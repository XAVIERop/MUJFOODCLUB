#!/bin/bash

# Auto-Reopen Management Script
# Easy commands to manage the 11 AM auto-reopen system

case "$1" in
  "status")
    echo "📊 Auto-Reopen System Status"
    echo "============================="
    echo ""
    echo "⏰ Current time: $(date)"
    echo ""
    echo "📋 Current cron job:"
    crontab -l | grep "simple_auto_reopen.js" || echo "❌ No cron job found"
    echo ""
    echo "📝 Recent logs:"
    if [ -f "logs/auto_reopen.log" ]; then
      tail -10 logs/auto_reopen.log
    else
      echo "No logs found yet"
    fi
    ;;
    
  "test")
    echo "🧪 Testing auto-reopen system..."
    node scripts/simple_auto_reopen.js
    ;;
    
  "logs")
    echo "📝 Auto-reopen logs:"
    if [ -f "logs/auto_reopen.log" ]; then
      cat logs/auto_reopen.log
    else
      echo "No logs found"
    fi
    ;;
    
  "remove")
    echo "🗑️ Removing auto-reopen cron job..."
    crontab -l 2>/dev/null | grep -v "simple_auto_reopen.js" | crontab -
    echo "✅ Cron job removed"
    ;;
    
  "reinstall")
    echo "🔄 Reinstalling auto-reopen system..."
    ./scripts/setup_11am_cron.sh
    ;;
    
  *)
    echo "🏪 Auto-Reopen Management"
    echo "========================="
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  status    - Show system status and recent logs"
    echo "  test      - Test the auto-reopen system now"
    echo "  logs      - Show all logs"
    echo "  remove    - Remove the cron job"
    echo "  reinstall - Reinstall the cron job"
    echo ""
    echo "Examples:"
    echo "  $0 status"
    echo "  $0 test"
    echo "  $0 logs"
    ;;
esac
