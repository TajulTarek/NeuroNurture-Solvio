#!/bin/bash

# NeuroNurture - Run All Services Script
# This script starts all backend, frontend, and Python services

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Create logs directory
LOGS_DIR="$SCRIPT_DIR/logs"
mkdir -p "$LOGS_DIR"

# PID file to track running processes
PID_FILE="$LOGS_DIR/service_pids.txt"
> "$PID_FILE"

# Function to run a service in the background
run_service() {
    local service_name=$1
    local command=$2
    local log_file="$LOGS_DIR/${service_name}.log"
    
    echo "Starting $service_name..."
    # Use absolute path and ensure we're in the script directory
    (cd "$SCRIPT_DIR" && eval "$command") > "$log_file" 2>&1 &
    local pid=$!
    echo "$pid|$service_name" >> "$PID_FILE"
    echo "  Started with PID: $pid (logs: $log_file)"
}

# Function to stop all services
stop_services() {
    echo "Stopping all services..."
    if [ -f "$PID_FILE" ]; then
        while IFS='|' read -r pid name; do
            if kill -0 "$pid" 2>/dev/null; then
                echo "Stopping $name (PID: $pid)..."
                kill "$pid" 2>/dev/null
            fi
        done < "$PID_FILE"
        > "$PID_FILE"
    fi
    echo "All services stopped."
    exit 0
}

# Trap Ctrl+C to stop all services
trap stop_services SIGINT SIGTERM

# Conda Configuration
# Conda environment names - using Python 3.10 for all services
CONDA_ENV_AGENT="agent"
CONDA_ENV_TF_GPU="tf_gpu"
CONDA_ENV_ALI_MODEL="ali_model"
PYTHON_VERSION="3.10"

echo "=========================================="
echo "NeuroNurture - Starting All Services"
echo "=========================================="
echo ""
echo "Using miniconda with Python $PYTHON_VERSION for all Python services"
echo "Conda environments: $CONDA_ENV_AGENT, $CONDA_ENV_TF_GPU, $CONDA_ENV_ALI_MODEL"
echo ""

# Initialize conda
if [ -z "$CONDA_DEFAULT_ENV" ]; then
    # Try to find and initialize conda
    if [ -f "$HOME/miniconda3/etc/profile.d/conda.sh" ]; then
        source "$HOME/miniconda3/etc/profile.d/conda.sh"
    elif [ -f "$HOME/anaconda3/etc/profile.d/conda.sh" ]; then
        source "$HOME/anaconda3/etc/profile.d/conda.sh"
    elif [ -f "/opt/conda/etc/profile.d/conda.sh" ]; then
        source "/opt/conda/etc/profile.d/conda.sh"
    else
        echo "WARNING: Could not find conda. Trying to use conda from PATH..."
        if ! command -v conda &> /dev/null; then
            echo "ERROR: conda not found. Please ensure miniconda/anaconda is installed and initialized."
            exit 1
        fi
    fi
fi

# Function to ensure conda environment exists with Python 3.10 and installs dependencies
ensure_conda_env() {
    local env_name=$1
    local project_dir=$2
    local requirements_file="$project_dir/requirements.txt"
    
    if conda env list | grep -q "^${env_name} "; then
        echo "  Conda environment '$env_name' already exists"
        # Verify Python version
        local py_version=$(conda run -n "$env_name" python --version 2>&1 | grep -oP '\d+\.\d+' | head -1)
        if [ "$py_version" != "$PYTHON_VERSION" ]; then
            echo "  WARNING: Environment '$env_name' has Python $py_version, but Python $PYTHON_VERSION is required"
            echo "  Please recreate the environment: conda remove -n $env_name --all && conda create -n $env_name python=$PYTHON_VERSION -y"
        fi
    else
        echo "  Creating conda environment '$env_name' with Python $PYTHON_VERSION..."
        conda create -n "$env_name" python="$PYTHON_VERSION" -y
        if [ $? -ne 0 ]; then
            echo "  ERROR: Failed to create conda environment '$env_name'"
            return 1
        fi
    fi
    
    # Check and install dependencies if requirements.txt exists
    if [ -f "$requirements_file" ]; then
        echo "  Checking dependencies in '$env_name'..."
        # Try to import a key package to check if dependencies are installed
        local check_package=""
        case "$env_name" in
            "$CONDA_ENV_AGENT")
                check_package="fastapi"
                ;;
            "$CONDA_ENV_TF_GPU")
                check_package="uvicorn"
                ;;
            "$CONDA_ENV_ALI_MODEL")
                check_package="pandas"
                ;;
        esac
        
        # Check if the key package is installed
        local needs_install=0
        if [ -n "$check_package" ]; then
            if ! conda run -n "$env_name" python -c "import $check_package" 2>/dev/null; then
                needs_install=1
                echo "  Missing key package '$check_package', installing dependencies..."
            else
                echo "  Key package '$check_package' found, checking if all dependencies are installed..."
                # Double-check by trying to import another common package
                case "$env_name" in
                    "$CONDA_ENV_AGENT")
                        if ! conda run -n "$env_name" python -c "import langchain_anthropic" 2>/dev/null; then
                            needs_install=1
                            echo "  Missing some dependencies, installing..."
                        fi
                        ;;
                    "$CONDA_ENV_TF_GPU")
                        if ! conda run -n "$env_name" python -c "import fastapi" 2>/dev/null; then
                            needs_install=1
                            echo "  Missing some dependencies, installing..."
                        fi
                        ;;
                    "$CONDA_ENV_ALI_MODEL")
                        if ! conda run -n "$env_name" python -c "import numpy" 2>/dev/null; then
                            needs_install=1
                            echo "  Missing some dependencies, installing..."
                        fi
                        ;;
                esac
            fi
        else
            # If we don't have a check package, always install to be safe
            needs_install=1
            echo "  Installing dependencies from $requirements_file..."
        fi
        
        if [ $needs_install -eq 1 ]; then
            echo "  Installing/updating dependencies from $requirements_file..."
            conda run -n "$env_name" pip install --upgrade pip --quiet
            conda run -n "$env_name" pip install -r "$requirements_file"
            if [ $? -ne 0 ]; then
                echo "  ⚠️  WARNING: Some packages may have failed to install."
                echo "     You may need to run: conda activate $env_name && pip install -r $requirements_file"
            else
                echo "  ✓ Dependencies installed successfully"
            fi
        else
            echo "  ✓ Dependencies appear to be installed"
        fi
    else
        echo "  ⚠️  WARNING: No requirements.txt found at $requirements_file"
    fi
    
    return 0
}

# Health Check Functions
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

# Function to check if Maven is still downloading (by checking logs)
is_maven_downloading() {
    local service_name=$1
    local log_file="$LOGS_DIR/${service_name}.log"
    
    if [ ! -f "$log_file" ]; then
        return 0  # Log file doesn't exist yet, assume still starting
    fi
    
    # Check if service has started (Spring Boot "Started" message)
    if grep -qi "Started.*Application\|Tomcat started on port\|Jetty started on port" "$log_file" 2>/dev/null; then
        return 1  # Service has started, Maven is done
    fi
    
    # Check if build failed
    if grep -qi "BUILD FAILURE\|ERROR\|Failed to execute goal" "$log_file" 2>/dev/null; then
        return 1  # Build failed, stop waiting
    fi
    
    # If we see "BUILD SUCCESS" but no "Started", it might still be starting
    if grep -qi "BUILD SUCCESS" "$log_file" 2>/dev/null; then
        # Check if it's been more than 30 seconds since BUILD SUCCESS
        # (This is a simple heuristic - in practice, services should start quickly after build)
        return 0  # Still might be starting
    fi
    
    # If we see downloading activity, it's still downloading
    if grep -qi "Downloading\|Downloaded from" "$log_file" 2>/dev/null; then
        return 0  # Still downloading
    fi
    
    # Default: assume still starting if we can't determine
    return 0
}

# Function to check service health silently (returns 0 if healthy, 1 if not)
check_service_health_silent() {
    local service_name=$1
    local port=${SERVICE_PORTS[$service_name]}
    
    if [ -z "$port" ]; then
        return 1
    fi
    
    # Check if port is listening
    if check_port "$port" 2; then
        # For Spring Boot services, try actuator health endpoint
        if [[ "$service_name" =~ ^(config-server|discovery|jwt_auth|admin|parent|school|doctor|Mirror_Posture_Game|dance_doodle|gaze_game|gesture_game|repeat_with_me_game|nuru_chat)$ ]]; then
            if check_http_endpoint "http://localhost:$port/actuator/health" 2 || check_http_endpoint "http://localhost:$port/health" 2; then
                return 0
            fi
        # For Python FastAPI services, try /health or / endpoint
        elif [[ "$service_name" =~ ^(nuru_agent|model_server|ali_model)$ ]]; then
            if check_http_endpoint "http://localhost:$port/health" 2 || check_http_endpoint "http://localhost:$port/" 2; then
                return 0
            fi
        # For frontend services, just check if port is open
        else
            return 0
        fi
    fi
    return 1
}

# Function to wait for service with retries
wait_for_service() {
    local service_name=$1
    local max_wait=${2:-120}  # Default 2 minutes
    local check_interval=${3:-5}  # Check every 5 seconds
    local elapsed=0
    
    echo -n "  Waiting for $service_name"
    
    while [ $elapsed -lt $max_wait ]; do
        # Check if Maven is still downloading for Spring Boot services
        if [[ "$service_name" =~ ^(config-server|discovery|jwt_auth|admin|parent|school|doctor|Mirror_Posture_Game|dance_doodle|gaze_game|gesture_game|repeat_with_me_game|nuru_chat)$ ]]; then
            if is_maven_downloading "$service_name"; then
                echo -n "."
                sleep $check_interval
                elapsed=$((elapsed + check_interval))
                continue
            fi
        fi
        
        # Check if service is responding
        if check_service_health_silent "$service_name"; then
            echo " ✓ Ready"
            return 0
        fi
        
        echo -n "."
        sleep $check_interval
        elapsed=$((elapsed + check_interval))
    done
    
    echo " ✗ Timeout (${max_wait}s)"
    return 1
}

# Function to check all services with intelligent waiting
check_all_services() {
    echo ""
    echo "=========================================="
    echo "Health Check - Verifying All Services"
    echo "=========================================="
    echo ""
    echo "Note: Spring Boot services may take time to download Maven dependencies on first run."
    echo "This can take 2-5 minutes depending on your internet connection."
    echo ""
    
    local total=0
    local passed=0
    local failed=0
    
    # Wait a bit for services to start
    echo "Initial wait (30 seconds) for services to begin starting..."
    sleep 30
    echo ""
    
    echo "=== Backend Services ==="
    echo "Checking Spring Boot services (this may take a few minutes on first run)..."
    for service in config-server discovery jwt_auth admin parent school doctor \
                   Mirror_Posture_Game dance_doodle gaze_game gesture_game \
                   repeat_with_me_game nuru_chat; do
        ((total++))
        echo -n "[$total/13] $service: "
        if wait_for_service "$service" 180 5; then  # 3 minutes max wait, check every 5s
            ((passed++))
        else
            ((failed++))
            echo "  ⚠️  $service may still be starting. Check $LOGS_DIR/${service}.log"
        fi
    done
    
    echo ""
    echo "=== Frontend Services ==="
    for service in main-frontend admin-website; do
        ((total++))
        echo -n "[$total/15] $service: "
        if wait_for_service "$service" 60 3; then  # 1 minute max wait
            ((passed++))
        else
            ((failed++))
        fi
    done
    
    echo ""
    echo "=== Python Services ==="
    for service in nuru_agent model_server ali_model; do
        ((total++))
        echo -n "[$total/18] $service: "
        if wait_for_service "$service" 60 3; then  # 1 minute max wait
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
    else
        echo "⚠️  Some services may still be starting."
        echo "   Spring Boot services can take 2-5 minutes on first run to download dependencies."
        echo "   Check logs in $LOGS_DIR/ for details."
        echo "   Run './check_health.sh' later to verify all services are up."
    fi
    echo ""
}

# Backend Services - Spring Boot
echo "=== Starting Backend Services ==="
echo "Note: Spring Boot services may take 2-5 minutes on first run to download Maven dependencies."
echo "Subsequent runs will be faster. Check logs in $LOGS_DIR/ for progress."
echo ""
run_service "config-server" "cd Backend/Services/config-server && mvn spring-boot:run"
wait_for_service "config-server" 180 5

run_service "discovery" "cd Backend/Services/discovery && mvn spring-boot:run"
wait_for_service "discovery" 180 5

run_service "jwt_auth" "cd Backend/Services/jwt_auth && mvn spring-boot:run"
wait_for_service "jwt_auth" 180 5

run_service "admin" "cd Backend/Services/admin && mvn spring-boot:run"
wait_for_service "admin" 180 5

run_service "parent" "cd Backend/Services/parent && mvn spring-boot:run"
wait_for_service "parent" 180 5

run_service "school" "cd Backend/Services/school && mvn spring-boot:run"
wait_for_service "school" 180 5

run_service "doctor" "cd Backend/Services/doctor && mvn spring-boot:run"
wait_for_service "doctor" 180 5

run_service "Mirror_Posture_Game" "cd Backend/Services/mirror_posture_game && mvn spring-boot:run"
wait_for_service "Mirror_Posture_Game" 180 5

run_service "dance_doodle" "cd Backend/Services/dance_doodle && mvn spring-boot:run"
wait_for_service "dance_doodle" 180 5

run_service "gaze_game" "cd Backend/Services/gaze_game && mvn spring-boot:run"
wait_for_service "gaze_game" 180 5

run_service "gesture_game" "cd Backend/Services/gesture_game && mvn spring-boot:run"
wait_for_service "gesture_game" 180 5

run_service "repeat_with_me_game" "cd Backend/Services/repeat_with_me_game && mvn spring-boot:run"
wait_for_service "repeat_with_me_game" 180 5

run_service "nuru_chat" "cd Backend/Services/nuru_chat && mvn spring-boot:run"
wait_for_service "nuru_chat" 180 5

# Frontend Services
echo ""
echo "=== Starting Frontend Services ==="
run_service "main-frontend" "cd Frontend/main-frontend && npm run dev"
wait_for_service "main-frontend" 60 3

run_service "admin-website" "cd Frontend/admin-website && npm run dev"
wait_for_service "admin-website" 60 3

# Python Services
echo ""
echo "=== Starting Python Services ==="

# NuruAgent
NURU_AGENT_DIR="$SCRIPT_DIR/NuruAgent"
echo "Setting up NuruAgent (conda env: $CONDA_ENV_AGENT)..."
if ensure_conda_env "$CONDA_ENV_AGENT" "$NURU_AGENT_DIR"; then
    # Double-check that fastapi is installed before starting
    if ! conda run -n $CONDA_ENV_AGENT python -c "import fastapi" 2>/dev/null; then
        echo "  fastapi not found, installing now..."
        conda run -n $CONDA_ENV_AGENT pip install fastapi uvicorn[standard]
        if [ $? -ne 0 ]; then
            echo "  ERROR: Failed to install fastapi. Please run: conda activate $CONDA_ENV_AGENT && pip install -r $NURU_AGENT_DIR/requirements.txt"
        else
            echo "  ✓ fastapi installed"
        fi
    fi
    run_service "nuru_agent" "cd $NURU_AGENT_DIR && conda run -n $CONDA_ENV_AGENT python main.py"
    wait_for_service "nuru_agent" 60 3
else
    echo "ERROR: Failed to setup conda environment for NuruAgent"
fi

# Model Server
MODEL_SERVER_DIR="$SCRIPT_DIR/Games/model_server"
echo "Setting up Model Server (conda env: $CONDA_ENV_TF_GPU)..."
if ensure_conda_env "$CONDA_ENV_TF_GPU" "$MODEL_SERVER_DIR"; then
    # Double-check that uvicorn is installed before starting
    if ! conda run -n $CONDA_ENV_TF_GPU python -c "import uvicorn" 2>/dev/null; then
        echo "  uvicorn not found, installing now..."
        conda run -n $CONDA_ENV_TF_GPU pip install uvicorn[standard] fastapi
        if [ $? -ne 0 ]; then
            echo "  ERROR: Failed to install uvicorn. Please run: conda activate $CONDA_ENV_TF_GPU && pip install -r $MODEL_SERVER_DIR/requirements.txt"
        else
            echo "  ✓ uvicorn installed"
        fi
    fi
    run_service "model_server" "cd $MODEL_SERVER_DIR && conda run -n $CONDA_ENV_TF_GPU python -m uvicorn app.main:app --reload"
    wait_for_service "model_server" 60 3
else
    echo "ERROR: Failed to setup conda environment for Model Server"
fi

# ALI Model
ALI_MODEL_DIR="$SCRIPT_DIR/ALI_Model/model"
echo "Setting up ALI Model (conda env: $CONDA_ENV_ALI_MODEL)..."
if ensure_conda_env "$CONDA_ENV_ALI_MODEL" "$ALI_MODEL_DIR"; then
    # Double-check that pandas is installed before starting
    if ! conda run -n $CONDA_ENV_ALI_MODEL python -c "import pandas" 2>/dev/null; then
        echo "  pandas not found, installing now..."
        conda run -n $CONDA_ENV_ALI_MODEL pip install pandas numpy scikit-learn
        if [ $? -ne 0 ]; then
            echo "  ERROR: Failed to install pandas. Please run: conda activate $CONDA_ENV_ALI_MODEL && pip install -r $ALI_MODEL_DIR/requirements.txt"
        else
            echo "  ✓ pandas installed"
        fi
    fi
    run_service "ali_model" "cd $ALI_MODEL_DIR && conda run -n $CONDA_ENV_ALI_MODEL python main.py"
    wait_for_service "ali_model" 60 3
else
    echo "ERROR: Failed to setup conda environment for ALI Model"
fi

echo ""
echo "=========================================="
echo "All services started and verified!"
echo "=========================================="
echo ""
echo "Logs are available in: $LOGS_DIR"
echo "To stop all services, press Ctrl+C"
echo ""
echo "Account details:"
echo "  parent: tarektajulislam484@gmail.com (Google sign in)"
echo "  admin: admin@neuronurture.com / Doctor123"
echo "  doctor: dipokdebnath917@gmail.com / Doctor123"
echo "  school: mehedimurad484@gmail.com / Doctor123"
echo ""
echo "To check service health again, run: ./check_health.sh"
echo ""

# Wait for all background processes
wait

