import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

// Advanced connection management for 500+ concurrent users
interface ConnectionConfig {
  maxConnections: number;
  minConnections: number;
  scaleUpThreshold: number;
  scaleDownThreshold: number;
  healthCheckInterval: number;
  maxRetries: number;
  retryDelay: number;
}

interface ConnectionMetrics {
  totalConnections: number;
  activeConnections: number;
  availableConnections: number;
  waitingRequests: number;
  connectionErrors: number;
  avgResponseTime: number;
  peakConcurrency: number;
  healthStatus: 'healthy' | 'warning' | 'critical';
}

class AdvancedConnectionManager {
  private config: ConnectionConfig;
  private clients: SupabaseClient<Database>[] = [];
  private availableClients: SupabaseClient<Database>[] = [];
  private inUseClients: Set<SupabaseClient<Database>> = new Set();
  private waitingQueue: Array<{
    resolve: (client: SupabaseClient<Database>) => void;
    reject: (error: Error) => void;
    timestamp: number;
  }> = [];
  private metrics: ConnectionMetrics;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private isScaling = false;

  constructor() {
    this.config = {
      maxConnections: 100, // Can scale up to 100 connections
      minConnections: 20,  // Minimum 20 connections always available
      scaleUpThreshold: 80, // Scale up when 80% utilized
      scaleDownThreshold: 30, // Scale down when 30% utilized
      healthCheckInterval: 5000, // Check every 5 seconds
      maxRetries: 3,
      retryDelay: 1000,
    };

    this.metrics = {
      totalConnections: 0,
      activeConnections: 0,
      availableConnections: 0,
      waitingRequests: 0,
      connectionErrors: 0,
      avgResponseTime: 0,
      peakConcurrency: 0,
      healthStatus: 'healthy',
    };

    this.initializeConnections();
    this.startHealthChecks();
  }

  private initializeConnections() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // Create initial connections
    for (let i = 0; i < this.config.minConnections; i++) {
      this.createConnection(i);
    }

    this.updateMetrics();
  }

  private createConnection(index: number): SupabaseClient<Database> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const client = createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 20, // Increased for high concurrency
        },
      },
      global: {
        headers: {
          'X-Client-Info': `mujfoodclub-advanced-${index}`,
          'X-Connection-Type': 'high-concurrency',
        },
      },
    });

    this.clients.push(client);
    this.availableClients.push(client);
    return client;
  }

  private async scaleUp(): Promise<void> {
    if (this.isScaling || this.clients.length >= this.config.maxConnections) {
      return;
    }

    this.isScaling = true;
    const scaleAmount = Math.min(10, this.config.maxConnections - this.clients.length);

    for (let i = 0; i < scaleAmount; i++) {
      const index = this.clients.length;
      this.createConnection(index);
    }

    this.isScaling = false;
    this.updateMetrics();
  }

  private async scaleDown(): Promise<void> {
    if (this.isScaling || this.clients.length <= this.config.minConnections) {
      return;
    }

    this.isScaling = true;
    const scaleAmount = Math.min(5, this.clients.length - this.config.minConnections);

    for (let i = 0; i < scaleAmount; i++) {
      if (this.availableClients.length > 0) {
        const client = this.availableClients.pop()!;
        const index = this.clients.indexOf(client);
        this.clients.splice(index, 1);
      }
    }

    this.isScaling = false;
    this.updateMetrics();
  }

  private startHealthChecks() {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);
  }

  private async performHealthCheck() {
    const utilization = this.clients.length > 0 ? (this.inUseClients.size / this.clients.length) * 100 : 0;
    const queueUtilization = (this.waitingQueue.length / 100) * 100; // Assuming max 100 waiting

    // Scale up if needed
    if (utilization > this.config.scaleUpThreshold && this.clients.length < this.config.maxConnections) {
      await this.scaleUp();
    }

    // Scale down if needed
    if (utilization < this.config.scaleDownThreshold && this.clients.length > this.config.minConnections) {
      await this.scaleDown();
    }

    // Clean up old waiting requests
    const now = Date.now();
    this.waitingQueue = this.waitingQueue.filter(request => {
      if (now - request.timestamp > 30000) { // 30 second timeout
        request.reject(new Error('Connection request timeout'));
        return false;
      }
      return true;
    });

    this.updateMetrics();
  }

  private updateMetrics() {
    const utilization = this.clients.length > 0 ? (this.inUseClients.size / this.clients.length) * 100 : 0;
    const queueUtilization = (this.waitingQueue.length / 100) * 100;

    this.metrics = {
      totalConnections: this.clients.length,
      activeConnections: this.inUseClients.size,
      availableConnections: this.availableClients.length,
      waitingRequests: this.waitingQueue.length,
      connectionErrors: this.metrics.connectionErrors,
      avgResponseTime: this.metrics.avgResponseTime,
      peakConcurrency: Math.max(this.metrics.peakConcurrency, this.inUseClients.size),
      healthStatus: this.getHealthStatus(utilization, queueUtilization),
    };
  }

  private getHealthStatus(utilization: number, queueUtilization: number): 'healthy' | 'warning' | 'critical' {
    if (utilization > 95 || queueUtilization > 90) return 'critical';
    if (utilization > 80 || queueUtilization > 70) return 'warning';
    return 'healthy';
  }

  async getClient(): Promise<SupabaseClient<Database>> {
    return new Promise((resolve, reject) => {
      // Try to get an available client immediately
      if (this.availableClients.length > 0) {
        const client = this.availableClients.pop()!;
        this.inUseClients.add(client);
        this.updateMetrics();
        resolve(client);
        return;
      }

      // Check if we can scale up
      if (this.clients.length < this.config.maxConnections) {
        const newClient = this.createConnection(this.clients.length);
        this.inUseClients.add(newClient);
        this.updateMetrics();
        resolve(newClient);
        return;
      }

      // Add to waiting queue
      this.waitingQueue.push({
        resolve,
        reject,
        timestamp: Date.now(),
      });

      this.updateMetrics();
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

      this.updateMetrics();
    }
  }

  async withClient<T>(
    operation: (client: SupabaseClient<Database>) => Promise<T>
  ): Promise<T> {
    const client = await this.getClient();
    
    try {
      const startTime = Date.now();
      const result = await operation(client);
      const responseTime = Date.now() - startTime;
      
      // Update average response time
      this.metrics.avgResponseTime = (this.metrics.avgResponseTime + responseTime) / 2;
      
      return result;
    } catch (error) {
      this.metrics.connectionErrors++;
      throw error;
    } finally {
      this.releaseClient(client);
    }
  }

  getMetrics(): ConnectionMetrics {
    return { ...this.metrics };
  }

  getDetailedStatus() {
    return {
      ...this.metrics,
      config: this.config,
      isScaling: this.isScaling,
      queueAge: this.waitingQueue.length > 0 ? 
        Date.now() - Math.min(...this.waitingQueue.map(r => r.timestamp)) : 0,
    };
  }

  destroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    // Reject all waiting requests
    this.waitingQueue.forEach(request => {
      request.reject(new Error('Connection manager destroyed'));
    });
    
    this.waitingQueue = [];
    this.clients = [];
    this.availableClients = [];
    this.inUseClients.clear();
  }
}

// Create singleton instance
export const advancedConnectionManager = new AdvancedConnectionManager();

// Helper function for easy usage
export const withAdvancedClient = <T>(
  operation: (client: SupabaseClient<Database>) => Promise<T>
): Promise<T> => {
  return advancedConnectionManager.withClient(operation);
};

export default AdvancedConnectionManager;
