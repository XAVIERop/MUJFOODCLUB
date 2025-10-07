#!/bin/bash

# Simple 11 AM Auto-Reopen Setup
# Sets up cron job to reopen first 10 cafes at 11:00 AM daily

echo "🏪 Setting up 11 AM auto-reopen for first 10 cafes..."

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
REOPEN_SCRIPT="$SCRIPT_DIR/simple_auto_reopen.js"

# Make script executable
chmod +x "$REOPEN_SCRIPT"

# Create logs directory
mkdir -p "$PROJECT_DIR/logs"

# Create cron job (runs at 11:00 AM daily)
CRON_JOB="0 11 * * * cd $PROJECT_DIR && node $REOPEN_SCRIPT >> $PROJECT_DIR/logs/auto_reopen.log 2>&1"

# Remove existing auto-reopen cron job if it exists
crontab -l 2>/dev/null | grep -v "simple_auto_reopen.js" | crontab -

# Add new cron job
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo "✅ Cron job set up successfully!"
echo "📅 First 10 cafes will auto-reopen at 11:00 AM daily"
echo "📝 Logs: $PROJECT_DIR/logs/auto_reopen.log"

echo ""
echo "🧪 To test right now:"
echo "   node $REOPEN_SCRIPT"

echo ""
echo "📋 Current cron jobs:"
crontab -l

echo ""
echo "🔧 To remove: crontab -l | grep -v 'simple_auto_reopen.js' | crontab -"
