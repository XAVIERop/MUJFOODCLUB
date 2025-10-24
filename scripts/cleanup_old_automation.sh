#!/bin/bash

# Cleanup Old Automation Systems
# This removes conflicting automation methods

echo "🧹 Cleaning up old automation systems..."

# Remove local cron job
echo "📋 Removing local cron job..."
crontab -l 2>/dev/null | grep -v "simple_auto_reopen.js" | crontab -

# Check if cron job was removed
if crontab -l 2>/dev/null | grep -q "simple_auto_reopen.js"; then
    echo "❌ Failed to remove cron job"
else
    echo "✅ Local cron job removed"
fi

# Remove old log files
echo "🗑️ Cleaning up old logs..."
rm -f /Users/pv/MUJFOODCLUB/logs/auto_reopen.log
rm -f /Users/pv/MUJFOODCLUB/logs/auto_close.log

# Create new logs directory structure
mkdir -p /Users/pv/MUJFOODCLUB/logs
echo "📁 Created fresh logs directory"

echo "✅ Cleanup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Run the fix_cafe_automation.sql script in Supabase"
echo "2. Test the automation functions manually"
echo "3. Monitor the automation status"
echo ""
echo "🔧 To check automation status:"
echo "   SELECT check_automation_status();"
echo ""
echo "🧪 To test manually:"
echo "   SELECT close_all_cafes_automated();"
echo "   SELECT reopen_all_cafes_automated();"
