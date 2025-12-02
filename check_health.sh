#!/bin/bash

# NeuroNurture - Health Check Script
# This script checks if all services are running properly

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Service port mappings
declare -A SERVICE_PORTS=(
    ["config-server"]="8888"
    ["discovery"]="8761"
    ["jwt_auth"]="8080"
    ["admin"]="8090"
    ["parent"]="8082"
    ["school"]="8091"
    ["doctor"]="8093"
    ["Mirror_Posture_Game"]="8083"
    ["dance_doodle"]="8087"
    ["gaze_game"]="8086"
    ["gesture_game"]="8084"
    ["repeat_with_me_game"]="8089"
    ["nuru_chat"]="8094"
    ["main-frontend"]="8081"
    ["admin-website"]="3001"
    ["nuru_agent"]="8005"
    ["model_server"]="8000"
    ["ali_model"]="8010"
)

# Function to check if a port is listening
check_port() {
    local port=$1
    local timeout=${2:-2}
    
    if command -v nc &> /dev/null; then
        nc -z -w "$timeout" localhost "$port" &> /dev/null
        return $?
    elif command -v timeout &> /dev/null && command -v bash &> /dev/null; then
        timeout "$timeout" bash -c "echo > /dev/tcp/localhost/$port" &> /dev/null
        return $?
    else
        # Fallback: try curl
        curl -s --connect-timeout "$timeout" "http://localhost:$port" &> /dev/null
        return $?
    fi
}

# Function to check HTTP endpoint
check_http_endpoint() {
    local url=$1
    local timeout=${2:-3}
    
    if command -v curl &> /dev/null; then
        local status=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout "$timeout" --max-time "$timeout" "$url" 2>/dev/null)
        if [ "$status" -ge 200 ] && [ "$status" -lt 500 ]; then
            return 0
        fi
    fi
    return 1
}

# Function to check a service health
check_service_health() {
    local service_name=$1
    local port=${SERVICE_PORTS[$service_name]}
    
    if [ -z "$port" ]; then
        echo "  ⚠️  $service_name: Unknown port"
        return 1
    fi
    
    # Check if port is listening
    if check_port "$port" 2; then
        # For Spring Boot services, try actuator health endpoint
        if [[ "$service_name" =~ ^(config-server|discovery|jwt_auth|admin|parent|school|doctor|Mirror_Posture_Game|dance_doodle|gaze_game|gesture_game|repeat_with_me_game|nuru_chat)$ ]]; then
            if check_http_endpoint "http://localhost:$port/actuator/health" 2 || check_http_endpoint "http://localhost:$port/health" 2; then
                echo "  ✅ $service_name: Running on port $port (health check passed)"
                return 0
            else
                echo "  ⚠️  $service_name: Port $port is open but health endpoint not responding"
                return 1
            fi
        # For Python FastAPI services, try /health or / endpoint
        elif [[ "$service_name" =~ ^(nuru_agent|model_server|ali_model)$ ]]; then
            if check_http_endpoint "http://localhost:$port/health" 2 || check_http_endpoint "http://localhost:$port/" 2; then
                echo "  ✅ $service_name: Running on port $port (health check passed)"
                return 0
            else
                echo "  ⚠️  $service_name: Port $port is open but health endpoint not responding"
                return 1
            fi
        # For frontend services, just check if port is open
        else
            echo "  ✅ $service_name: Running on port $port"
            return 0
        fi
    else
        echo "  ❌ $service_name: Not responding on port $port"
        return 1
    fi
}

# Main health check function
main() {
    echo "=========================================="
    echo "NeuroNurture - Service Health Check"
    echo "=========================================="
    echo ""
    
    local total=0
    local passed=0
    local failed=0
    
    echo "=== Backend Services ==="
    for service in config-server discovery jwt_auth admin parent school doctor \
                   Mirror_Posture_Game dance_doodle gaze_game gesture_game \
                   repeat_with_me_game nuru_chat; do
        ((total++))
        if check_service_health "$service"; then
            ((passed++))
        else
            ((failed++))
        fi
    done
    
    echo ""
    echo "=== Frontend Services ==="
    for service in main-frontend admin-website; do
        ((total++))
        if check_service_health "$service"; then
            ((passed++))
        else
            ((failed++))
        fi
    done
    
    echo ""
    echo "=== Python Services ==="
    for service in nuru_agent model_server ali_model; do
        ((total++))
        if check_service_health "$service"; then
            ((passed++))
        else
            ((failed++))
        fi
    done
    
    echo ""
    echo "=========================================="
    echo "Health Check Summary"
    echo "=========================================="
    echo "Total Services: $total"
    echo "✅ Healthy: $passed"
    echo "❌ Unhealthy: $failed"
    echo ""
    
    if [ $failed -eq 0 ]; then
        echo "🎉 All services are running properly!"
        exit 0
    else
        echo "⚠️  Some services are not responding."
        echo "   Check logs in $SCRIPT_DIR/logs/ for details."
        exit 1
    fi
}

main

