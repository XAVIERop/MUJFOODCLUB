#!/bin/bash

# Automated Cafe Reopening - Cron Job Setup
# This script sets up a cron job to reopen cafes at 11:00 AM daily

echo "🏪 Setting up automated cafe reopening system..."

# Get the current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
AUTO_REOPEN_SCRIPT="$SCRIPT_DIR/auto_reopen_cafes.js"

# Check if the auto reopen script exists
if [ ! -f "$AUTO_REOPEN_SCRIPT" ]; then
    echo "❌ Auto reopen script not found: $AUTO_REOPEN_SCRIPT"
    exit 1
fi

# Make the script executable
chmod +x "$AUTO_REOPEN_SCRIPT"

# Create the cron job entry
CRON_JOB="0 11 * * * cd $PROJECT_DIR && node $AUTO_REOPEN_SCRIPT >> $PROJECT_DIR/logs/cafe_reopening.log 2>&1"

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_DIR/logs"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "auto_reopen_cafes.js"; then
    echo "⚠️ Cron job already exists. Updating..."
    # Remove existing cron job
    crontab -l 2>/dev/null | grep -v "auto_reopen_cafes.js" | crontab -
fi

# Add the new cron job
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo "✅ Cron job added successfully!"
echo "📅 Cafes will automatically reopen at 11:00 AM daily"
echo "📝 Logs will be saved to: $PROJECT_DIR/logs/cafe_reopening.log"

# Show current cron jobs
echo ""
echo "📋 Current cron jobs:"
crontab -l

echo ""
echo "🔧 To manage the cron job:"
echo "   View: crontab -l"
echo "   Edit: crontab -e"
echo "   Remove: crontab -l | grep -v 'auto_reopen_cafes.js' | crontab -"
echo ""
echo "📊 To test the system:"
echo "   node $AUTO_REOPEN_SCRIPT"
