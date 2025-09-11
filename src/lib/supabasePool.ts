import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

// Connection pool configuration - Optimized for 500+ concurrent users
const POOL_SIZE = 50; // Increased from 10 to 50 for high concurrency
const MAX_RETRIES = 5; // Increased retries for better reliability
const RETRY_DELAY = 500; // Reduced delay for faster recovery
const CONNECTION_TIMEOUT = 10000; // 10 second timeout
const MAX_WAITING_QUEUE = 100; // Allow up to 100 waiting requests

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

      // Check if waiting queue is full
      if (this.waitingQueue.length >= MAX_WAITING_QUEUE) {
        reject(new Error('Connection pool overloaded - too many waiting requests'));
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
      }, CONNECTION_TIMEOUT);
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
    const utilization = this.clients.length > 0 ? (this.inUseClients.size / this.clients.length) * 100 : 0;
    const queueUtilization = (this.waitingQueue.length / MAX_WAITING_QUEUE) * 100;
    
    return {
      totalClients: this.clients.length,
      availableClients: this.availableClients.length,
      inUseClients: this.inUseClients.size,
      waitingRequests: this.waitingQueue.length,
      maxWaitingQueue: MAX_WAITING_QUEUE,
      utilizationPercentage: Math.round(utilization),
      queueUtilizationPercentage: Math.round(queueUtilization),
      healthStatus: this.getHealthStatus(utilization, queueUtilization),
    };
  }

  private getHealthStatus(utilization: number, queueUtilization: number): 'healthy' | 'warning' | 'critical' {
    if (utilization > 90 || queueUtilization > 80) return 'critical';
    if (utilization > 70 || queueUtilization > 50) return 'warning';
    return 'healthy';
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
