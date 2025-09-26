import { supabase } from '@/integrations/supabase/client';

/**
 * Auto-Cancellation Service
 * Handles automatic cancellation of orders that remain in 'received' status for 10+ minutes
 */

export interface AutoCancellationResult {
  success: boolean;
  cancelled_count: number;
  cancelled_orders: string[];
  timestamp: string;
}

class AutoCancellationService {
  private checkInterval: NodeJS.Timeout | null = null;
  private isChecking = false;

  /**
   * Manually trigger auto-cancellation check
   */
  async triggerAutoCancellation(): Promise<AutoCancellationResult> {
    try {
      const { data, error } = await supabase.rpc('trigger_auto_cancellation');
      
      if (error) {
        console.error('Error triggering auto-cancellation:', error);
        throw error;
      }

      return data as AutoCancellationResult;
    } catch (error) {
      console.error('Auto-cancellation service error:', error);
      return {
        success: false,
        cancelled_count: 0,
        cancelled_orders: [],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Start automatic periodic checks for auto-cancellation
   * Checks every 2 minutes for orders that need to be auto-cancelled
   */
  startPeriodicChecks(): void {
    if (this.checkInterval) {
      console.log('Auto-cancellation checks already running');
      return;
    }

    console.log('Starting auto-cancellation periodic checks (every 2 minutes)');
    
    this.checkInterval = setInterval(async () => {
      if (this.isChecking) {
        console.log('Auto-cancellation check already in progress, skipping...');
        return;
      }

      this.isChecking = true;
      try {
        const result = await this.triggerAutoCancellation();
        
        if (result.success && result.cancelled_count > 0) {
          console.log(`Auto-cancelled ${result.cancelled_count} orders:`, result.cancelled_orders);
          
          // You could emit an event here to notify other parts of the app
          // or show a toast notification
        }
      } catch (error) {
        console.error('Periodic auto-cancellation check failed:', error);
      } finally {
        this.isChecking = false;
      }
    }, 2 * 60 * 1000); // Check every 2 minutes
  }

  /**
   * Stop automatic periodic checks
   */
  stopPeriodicChecks(): void {
    if (this.checkInterval) {
      console.log('Stopping auto-cancellation periodic checks');
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Check if periodic checks are running
   */
  isPeriodicChecksRunning(): boolean {
    return this.checkInterval !== null;
  }

  /**
   * Get the status of the auto-cancellation service
   */
  getStatus(): {
    isRunning: boolean;
    isChecking: boolean;
  } {
    return {
      isRunning: this.isPeriodicChecksRunning(),
      isChecking: this.isChecking
    };
  }
}

// Create a singleton instance
export const autoCancellationService = new AutoCancellationService();

// Export the class for testing or custom instances
export default AutoCancellationService;
