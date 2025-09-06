#!/usr/bin/env node

/**
 * Monitoring and Alerting Setup Script
 * Configures comprehensive monitoring for production environment
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Configuration
const CONFIG = {
  SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'your-supabase-url',
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || 'your-service-key',
  MONITORING_CONFIG: {
    ALERT_THRESHOLDS: {
      ERROR_RATE: 5, // 5% error rate
      RESPONSE_TIME: 500, // 500ms response time
      DATABASE_QUERIES: 1000, // 1000ms database queries
      MEMORY_USAGE: 80, // 80% memory usage
      CPU_USAGE: 80, // 80% CPU usage
    },
    CHECK_INTERVALS: {
      HEALTH_CHECK: 30000, // 30 seconds
      PERFORMANCE_CHECK: 60000, // 1 minute
      ALERT_CHECK: 300000, // 5 minutes
    }
  }
};

// Initialize Supabase client with service key for admin operations
const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_SERVICE_KEY);

/**
 * Create monitoring tables
 */
async function createMonitoringTables() {
  console.log('📊 Creating monitoring tables...');
  
  const monitoringTables = `
    -- Application health monitoring
    CREATE TABLE IF NOT EXISTS public.health_checks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      service_name TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'unhealthy')),
      response_time_ms INTEGER,
      error_message TEXT,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- Performance metrics
    CREATE TABLE IF NOT EXISTS public.performance_metrics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      metric_name TEXT NOT NULL,
      metric_value DECIMAL(10,2) NOT NULL,
      metric_unit TEXT NOT NULL,
      tags JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- Alert history
    CREATE TABLE IF NOT EXISTS public.alert_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      alert_type TEXT NOT NULL,
      severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
      message TEXT NOT NULL,
      resolved BOOLEAN DEFAULT false,
      resolved_at TIMESTAMPTZ,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- System events
    CREATE TABLE IF NOT EXISTS public.system_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_type TEXT NOT NULL,
      event_data JSONB NOT NULL,
      user_id UUID REFERENCES public.profiles(id),
      ip_address INET,
      user_agent TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- Create indexes for monitoring tables
    CREATE INDEX IF NOT EXISTS idx_health_checks_service_created ON public.health_checks(service_name, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_health_checks_status_created ON public.health_checks(status, created_at DESC);
    
    CREATE INDEX IF NOT EXISTS idx_performance_metrics_name_created ON public.performance_metrics(metric_name, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_performance_metrics_created ON public.performance_metrics(created_at DESC);
    
    CREATE INDEX IF NOT EXISTS idx_alert_history_type_created ON public.alert_history(alert_type, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_alert_history_severity_created ON public.alert_history(severity, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_alert_history_resolved ON public.alert_history(resolved, created_at DESC);
    
    CREATE INDEX IF NOT EXISTS idx_system_events_type_created ON public.system_events(event_type, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_system_events_user_created ON public.system_events(user_id, created_at DESC);
  `;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: monitoringTables });
    if (error) throw error;
    console.log('✅ Monitoring tables created successfully');
  } catch (error) {
    console.error('❌ Error creating monitoring tables:', error.message);
    throw error;
  }
}

/**
 * Create monitoring functions
 */
async function createMonitoringFunctions() {
  console.log('🔧 Creating monitoring functions...');
  
  const monitoringFunctions = `
    -- Function to record health check
    CREATE OR REPLACE FUNCTION public.record_health_check(
      p_service_name TEXT,
      p_status TEXT,
      p_response_time_ms INTEGER DEFAULT NULL,
      p_error_message TEXT DEFAULT NULL,
      p_metadata JSONB DEFAULT NULL
    )
    RETURNS void AS $$
    BEGIN
      INSERT INTO public.health_checks (
        service_name,
        status,
        response_time_ms,
        error_message,
        metadata
      ) VALUES (
        p_service_name,
        p_status,
        p_response_time_ms,
        p_error_message,
        p_metadata
      );
    END;
    $$ LANGUAGE plpgsql;

    -- Function to record performance metric
    CREATE OR REPLACE FUNCTION public.record_performance_metric(
      p_metric_name TEXT,
      p_metric_value DECIMAL(10,2),
      p_metric_unit TEXT,
      p_tags JSONB DEFAULT NULL
    )
    RETURNS void AS $$
    BEGIN
      INSERT INTO public.performance_metrics (
        metric_name,
        metric_value,
        metric_unit,
        tags
      ) VALUES (
        p_metric_name,
        p_metric_value,
        p_metric_unit,
        p_tags
      );
    END;
    $$ LANGUAGE plpgsql;

    -- Function to create alert
    CREATE OR REPLACE FUNCTION public.create_alert(
      p_alert_type TEXT,
      p_severity TEXT,
      p_message TEXT,
      p_metadata JSONB DEFAULT NULL
    )
    RETURNS void AS $$
    BEGIN
      INSERT INTO public.alert_history (
        alert_type,
        severity,
        message,
        metadata
      ) VALUES (
        p_alert_type,
        p_severity,
        p_message,
        p_metadata
      );
    END;
    $$ LANGUAGE plpgsql;

    -- Function to record system event
    CREATE OR REPLACE FUNCTION public.record_system_event(
      p_event_type TEXT,
      p_event_data JSONB,
      p_user_id UUID DEFAULT NULL,
      p_ip_address INET DEFAULT NULL,
      p_user_agent TEXT DEFAULT NULL
    )
    RETURNS void AS $$
    BEGIN
      INSERT INTO public.system_events (
        event_type,
        event_data,
        user_id,
        ip_address,
        user_agent
      ) VALUES (
        p_event_type,
        p_event_data,
        p_user_id,
        p_ip_address,
        p_user_agent
      );
    END;
    $$ LANGUAGE plpgsql;

    -- Function to check system health
    CREATE OR REPLACE FUNCTION public.check_system_health()
    RETURNS TABLE (
      service_name TEXT,
      status TEXT,
      last_check TIMESTAMPTZ,
      avg_response_time DECIMAL(10,2)
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        hc.service_name,
        hc.status,
        hc.created_at as last_check,
        AVG(hc.response_time_ms)::DECIMAL(10,2) as avg_response_time
      FROM public.health_checks hc
      WHERE hc.created_at >= NOW() - INTERVAL '5 minutes'
      GROUP BY hc.service_name, hc.status, hc.created_at
      ORDER BY hc.created_at DESC;
    END;
    $$ LANGUAGE plpgsql;

    -- Function to get performance metrics
    CREATE OR REPLACE FUNCTION public.get_performance_metrics(
      p_metric_name TEXT DEFAULT NULL,
      p_hours_back INTEGER DEFAULT 24
    )
    RETURNS TABLE (
      metric_name TEXT,
      avg_value DECIMAL(10,2),
      min_value DECIMAL(10,2),
      max_value DECIMAL(10,2),
      sample_count BIGINT
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        pm.metric_name,
        AVG(pm.metric_value)::DECIMAL(10,2) as avg_value,
        MIN(pm.metric_value)::DECIMAL(10,2) as min_value,
        MAX(pm.metric_value)::DECIMAL(10,2) as max_value,
        COUNT(*) as sample_count
      FROM public.performance_metrics pm
      WHERE pm.created_at >= NOW() - (p_hours_back || ' hours')::INTERVAL
        AND (p_metric_name IS NULL OR pm.metric_name = p_metric_name)
      GROUP BY pm.metric_name
      ORDER BY pm.metric_name;
    END;
    $$ LANGUAGE plpgsql;
  `;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: monitoringFunctions });
    if (error) throw error;
    console.log('✅ Monitoring functions created successfully');
  } catch (error) {
    console.error('❌ Error creating monitoring functions:', error.message);
    throw error;
  }
}

/**
 * Create monitoring triggers
 */
async function createMonitoringTriggers() {
  console.log('⚡ Creating monitoring triggers...');
  
  const monitoringTriggers = `
    -- Trigger to monitor order creation
    CREATE OR REPLACE FUNCTION public.monitor_order_creation()
    RETURNS TRIGGER AS $$
    BEGIN
      -- Record system event
      PERFORM public.record_system_event(
        'order_created',
        jsonb_build_object(
          'order_id', NEW.id,
          'cafe_id', NEW.cafe_id,
          'user_id', NEW.user_id,
          'total_amount', NEW.total_amount,
          'order_number', NEW.order_number
        ),
        NEW.user_id
      );
      
      -- Check for high order volume
      IF (SELECT COUNT(*) FROM public.orders WHERE created_at >= NOW() - INTERVAL '1 minute') > 50 THEN
        PERFORM public.create_alert(
          'high_order_volume',
          'medium',
          'High order volume detected: ' || (SELECT COUNT(*) FROM public.orders WHERE created_at >= NOW() - INTERVAL '1 minute') || ' orders in the last minute'
        );
      END IF;
      
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trigger_monitor_order_creation
      AFTER INSERT ON public.orders
      FOR EACH ROW
      EXECUTE FUNCTION public.monitor_order_creation();

    -- Trigger to monitor profile updates
    CREATE OR REPLACE FUNCTION public.monitor_profile_updates()
    RETURNS TRIGGER AS $$
    BEGIN
      -- Record system event for significant profile changes
      IF OLD.loyalty_points != NEW.loyalty_points OR OLD.loyalty_tier != NEW.loyalty_tier THEN
        PERFORM public.record_system_event(
          'profile_loyalty_updated',
          jsonb_build_object(
            'user_id', NEW.id,
            'old_points', OLD.loyalty_points,
            'new_points', NEW.loyalty_points,
            'old_tier', OLD.loyalty_tier,
            'new_tier', NEW.loyalty_tier
          ),
          NEW.id
        );
      END IF;
      
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trigger_monitor_profile_updates
      AFTER UPDATE ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.monitor_profile_updates();
  `;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: monitoringTriggers });
    if (error) throw error;
    console.log('✅ Monitoring triggers created successfully');
  } catch (error) {
    console.error('❌ Error creating monitoring triggers:', error.message);
    throw error;
  }
}

/**
 * Create monitoring dashboard queries
 */
async function createMonitoringDashboard() {
  console.log('📊 Creating monitoring dashboard...');
  
  const dashboardQueries = `
    -- View for system health overview
    CREATE OR REPLACE VIEW public.system_health_overview AS
    SELECT 
      'database' as service_name,
      CASE 
        WHEN (SELECT COUNT(*) FROM public.health_checks WHERE service_name = 'database' AND created_at >= NOW() - INTERVAL '5 minutes') > 0 
        THEN 'healthy'
        ELSE 'unknown'
      END as status,
      (SELECT MAX(created_at) FROM public.health_checks WHERE service_name = 'database') as last_check,
      (SELECT AVG(response_time_ms) FROM public.health_checks WHERE service_name = 'database' AND created_at >= NOW() - INTERVAL '1 hour') as avg_response_time_ms
    UNION ALL
    SELECT 
      'api' as service_name,
      CASE 
        WHEN (SELECT COUNT(*) FROM public.health_checks WHERE service_name = 'api' AND created_at >= NOW() - INTERVAL '5 minutes') > 0 
        THEN 'healthy'
        ELSE 'unknown'
      END as status,
      (SELECT MAX(created_at) FROM public.health_checks WHERE service_name = 'api') as last_check,
      (SELECT AVG(response_time_ms) FROM public.health_checks WHERE service_name = 'api' AND created_at >= NOW() - INTERVAL '1 hour') as avg_response_time_ms;

    -- View for order metrics
    CREATE OR REPLACE VIEW public.order_metrics AS
    SELECT 
      DATE_TRUNC('hour', created_at) as hour,
      COUNT(*) as total_orders,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
      COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
      AVG(total_amount) as avg_order_value,
      SUM(total_amount) as total_revenue
    FROM public.orders
    WHERE created_at >= NOW() - INTERVAL '24 hours'
    GROUP BY DATE_TRUNC('hour', created_at)
    ORDER BY hour DESC;

    -- View for user activity metrics
    CREATE OR REPLACE VIEW public.user_activity_metrics AS
    SELECT 
      DATE_TRUNC('hour', created_at) as hour,
      COUNT(DISTINCT user_id) as active_users,
      COUNT(*) as total_orders,
      AVG(total_amount) as avg_order_value
    FROM public.orders
    WHERE created_at >= NOW() - INTERVAL '24 hours'
    GROUP BY DATE_TRUNC('hour', created_at)
    ORDER BY hour DESC;

    -- View for alert summary
    CREATE OR REPLACE VIEW public.alert_summary AS
    SELECT 
      alert_type,
      severity,
      COUNT(*) as count,
      MAX(created_at) as last_occurrence,
      COUNT(CASE WHEN resolved = false THEN 1 END) as unresolved_count
    FROM public.alert_history
    WHERE created_at >= NOW() - INTERVAL '24 hours'
    GROUP BY alert_type, severity
    ORDER BY severity DESC, count DESC;
  `;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: dashboardQueries });
    if (error) throw error;
    console.log('✅ Monitoring dashboard created successfully');
  } catch (error) {
    console.error('❌ Error creating monitoring dashboard:', error.message);
    throw error;
  }
}

/**
 * Create cleanup functions
 */
async function createCleanupFunctions() {
  console.log('🧹 Creating cleanup functions...');
  
  const cleanupFunctions = `
    -- Function to cleanup old monitoring data
    CREATE OR REPLACE FUNCTION public.cleanup_monitoring_data()
    RETURNS void AS $$
    BEGIN
      -- Keep health checks for 7 days
      DELETE FROM public.health_checks 
      WHERE created_at < NOW() - INTERVAL '7 days';
      
      -- Keep performance metrics for 30 days
      DELETE FROM public.performance_metrics 
      WHERE created_at < NOW() - INTERVAL '30 days';
      
      -- Keep resolved alerts for 90 days
      DELETE FROM public.alert_history 
      WHERE resolved = true AND created_at < NOW() - INTERVAL '90 days';
      
      -- Keep system events for 30 days
      DELETE FROM public.system_events 
      WHERE created_at < NOW() - INTERVAL '30 days';
      
      -- Log cleanup
      INSERT INTO public.system_events (event_type, event_data)
      VALUES ('monitoring_cleanup', jsonb_build_object('timestamp', NOW()));
    END;
    $$ LANGUAGE plpgsql;

    -- Function to get monitoring statistics
    CREATE OR REPLACE FUNCTION public.get_monitoring_stats()
    RETURNS TABLE (
      table_name TEXT,
      record_count BIGINT,
      oldest_record TIMESTAMPTZ,
      newest_record TIMESTAMPTZ
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        'health_checks'::TEXT as table_name,
        COUNT(*) as record_count,
        MIN(created_at) as oldest_record,
        MAX(created_at) as newest_record
      FROM public.health_checks
      UNION ALL
      SELECT 
        'performance_metrics'::TEXT as table_name,
        COUNT(*) as record_count,
        MIN(created_at) as oldest_record,
        MAX(created_at) as newest_record
      FROM public.performance_metrics
      UNION ALL
      SELECT 
        'alert_history'::TEXT as table_name,
        COUNT(*) as record_count,
        MIN(created_at) as oldest_record,
        MAX(created_at) as newest_record
      FROM public.alert_history
      UNION ALL
      SELECT 
        'system_events'::TEXT as table_name,
        COUNT(*) as record_count,
        MIN(created_at) as oldest_record,
        MAX(created_at) as newest_record
      FROM public.system_events;
    END;
    $$ LANGUAGE plpgsql;
  `;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: cleanupFunctions });
    if (error) throw error;
    console.log('✅ Cleanup functions created successfully');
  } catch (error) {
    console.error('❌ Error creating cleanup functions:', error.message);
    throw error;
  }
}

/**
 * Create monitoring configuration file
 */
function createMonitoringConfig() {
  console.log('⚙️  Creating monitoring configuration...');
  
  const config = {
    monitoring: {
      healthCheck: {
        interval: CONFIG.MONITORING_CONFIG.CHECK_INTERVALS.HEALTH_CHECK,
        endpoints: [
          '/api/health',
          '/api/cafes',
          '/api/menu',
          '/api/orders'
        ]
      },
      performance: {
        interval: CONFIG.MONITORING_CONFIG.CHECK_INTERVALS.PERFORMANCE_CHECK,
        metrics: [
          'response_time',
          'error_rate',
          'throughput',
          'memory_usage',
          'cpu_usage'
        ]
      },
      alerts: {
        interval: CONFIG.MONITORING_CONFIG.CHECK_INTERVALS.ALERT_CHECK,
        thresholds: CONFIG.MONITORING_CONFIG.ALERT_THRESHOLDS
      }
    },
    notifications: {
      email: {
        enabled: true,
        recipients: ['admin@mujfoodclub.com']
      },
      slack: {
        enabled: false,
        webhook: 'your-slack-webhook-url'
      },
      sms: {
        enabled: false,
        provider: 'twilio'
      }
    }
  };
  
  const configPath = path.join(process.cwd(), 'monitoring.config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('✅ Monitoring configuration saved to monitoring.config.json');
}

/**
 * Main setup function
 */
async function setupMonitoring() {
  try {
    console.log('🚀 Setting up Production Monitoring System...');
    console.log('='.repeat(50));
    console.log('');
    
    await createMonitoringTables();
    await createMonitoringFunctions();
    await createMonitoringTriggers();
    await createMonitoringDashboard();
    await createCleanupFunctions();
    createMonitoringConfig();
    
    console.log('');
    console.log('🎉 Monitoring system setup completed successfully!');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Set up cron jobs for automated monitoring');
    console.log('2. Configure alert notifications (email/Slack/SMS)');
    console.log('3. Set up monitoring dashboard');
    console.log('4. Test monitoring functions');
    console.log('5. Schedule cleanup jobs');
    console.log('');
    console.log('🔧 Useful Commands:');
    console.log('   - Check system health: SELECT * FROM public.system_health_overview;');
    console.log('   - View order metrics: SELECT * FROM public.order_metrics;');
    console.log('   - Check alerts: SELECT * FROM public.alert_summary;');
    console.log('   - Cleanup old data: SELECT public.cleanup_monitoring_data();');
    console.log('');
    
  } catch (error) {
    console.error('❌ Monitoring setup failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupMonitoring();
}

export { setupMonitoring };
