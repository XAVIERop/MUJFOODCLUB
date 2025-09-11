import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

// Connection pool configuration
const POOL_SIZE = 10;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

class SupabaseConnectionPool {
  private clients: SupabaseClient<Database>[] = [];
  private availableClients: SupabaseClient<Database>[] = [];
  private inUseClients: Set<SupabaseClient<Database>> = new Set();
  private waitingQueue: Array<{
    resolve: (client: SupabaseClient<Database>) => void;
    reject: (error: Error) => void;
  }> = [];

  constructor() {
    this.initializePool();
  }

  private initializePool() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // Create multiple client instances for connection pooling
    for (let i = 0; i < POOL_SIZE; i++) {
      const client = createClient<Database>(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
        realtime: {
          params: {
            eventsPerSecond: 10, // Limit realtime events
          },
        },
        global: {
          headers: {
            'X-Client-Info': `mujfoodclub-web-${i}`,
          },
        },
      });

      this.clients.push(client);
      this.availableClients.push(client);
    }
  }

  async getClient(): Promise<SupabaseClient<Database>> {
    return new Promise((resolve, reject) => {
      // Try to get an available client immediately
      if (this.availableClients.length > 0) {
        const client = this.availableClients.pop()!;
        this.inUseClients.add(client);
        resolve(client);
        return;
      }

      // If no clients available, add to waiting queue
      this.waitingQueue.push({ resolve, reject });

      // Set timeout for waiting requests
      setTimeout(() => {
        const index = this.waitingQueue.findIndex(item => item.resolve === resolve);
        if (index !== -1) {
          this.waitingQueue.splice(index, 1);
          reject(new Error('Connection pool timeout - no available clients'));
        }
      }, 5000); // 5 second timeout
    });
  }

  releaseClient(client: SupabaseClient<Database>) {
    if (this.inUseClients.has(client)) {
      this.inUseClients.delete(client);
      this.availableClients.push(client);

      // Process waiting queue
      if (this.waitingQueue.length > 0) {
        const { resolve } = this.waitingQueue.shift()!;
        this.inUseClients.add(client);
        resolve(client);
      }
    }
  }

  async withClient<T>(
    operation: (client: SupabaseClient<Database>) => Promise<T>
  ): Promise<T> {
    const client = await this.getClient();
    
    try {
      const result = await operation(client);
      return result;
    } finally {
      this.releaseClient(client);
    }
  }

  getPoolStatus() {
    return {
      totalClients: this.clients.length,
      availableClients: this.availableClients.length,
      inUseClients: this.inUseClients.size,
      waitingRequests: this.waitingQueue.length,
    };
  }
}

// Create singleton instance
export const supabasePool = new SupabaseConnectionPool();

// Helper function for easy usage
export const withSupabaseClient = <T>(
  operation: (client: SupabaseClient<Database>) => Promise<T>
): Promise<T> => {
  return supabasePool.withClient(operation);
};
