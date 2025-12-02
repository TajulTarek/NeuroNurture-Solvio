#!/bin/bash

# NeuroNurture - Stop All Services Script

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
LOGS_DIR="$SCRIPT_DIR/logs"
PID_FILE="$LOGS_DIR/service_pids.txt"

if [ ! -f "$PID_FILE" ]; then
    echo "No services are running (PID file not found)."
    exit 0
fi

echo "Stopping all NeuroNurture services..."
echo ""

count=0
while IFS='|' read -r pid name; do
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
        echo "Stopping $name (PID: $pid)..."
        kill "$pid" 2>/dev/null
        ((count++))
    fi
done < "$PID_FILE"

# Also kill any remaining Java, Node, and Python processes related to the services
echo ""
echo "Cleaning up any remaining processes..."

# Kill Maven/Spring Boot processes
pkill -f "spring-boot:run" 2>/dev/null

# Kill npm dev servers
pkill -f "npm run dev" 2>/dev/null

# Kill Python services (be careful with this - might kill other Python processes)
# Uncomment if needed, but use with caution
# pkill -f "uvicorn app.main:app" 2>/dev/null
# pkill -f "NuruAgent.*main.py" 2>/dev/null
# pkill -f "ALI_Model.*main.py" 2>/dev/null

> "$PID_FILE"
echo ""
echo "Stopped $count service(s)."
echo "All services have been stopped."

