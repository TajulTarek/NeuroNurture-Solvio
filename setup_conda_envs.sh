#!/bin/bash

# Setup script to install dependencies in all conda environments
# This script creates conda environments with Python 3.10 and installs requirements

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Conda environment names
CONDA_ENV_AGENT="agent"
CONDA_ENV_TF_GPU="tf_gpu"
CONDA_ENV_ALI_MODEL="ali_model"
PYTHON_VERSION="3.10"

# Initialize conda
if [ -f "$HOME/miniconda3/etc/profile.d/conda.sh" ]; then
    source "$HOME/miniconda3/etc/profile.d/conda.sh"
elif [ -f "$HOME/anaconda3/etc/profile.d/conda.sh" ]; then
    source "$HOME/anaconda3/etc/profile.d/conda.sh"
elif [ -f "/opt/conda/etc/profile.d/conda.sh" ]; then
    source "/opt/conda/etc/profile.d/conda.sh"
fi

if ! command -v conda &> /dev/null; then
    echo "ERROR: conda not found. Please ensure miniconda/anaconda is installed."
    exit 1
fi

echo "=========================================="
echo "Setting up Conda Environments"
echo "=========================================="
echo "Python version: $PYTHON_VERSION"
echo ""

# Function to setup environment
setup_env() {
    local env_name=$1
    local project_dir=$2
    local requirements_file="$project_dir/requirements.txt"
    
    echo "=== Setting up $env_name ==="
    
    # Check if environment exists
    if conda env list | grep -q "^${env_name} "; then
        echo "  Environment '$env_name' already exists"
        read -p "  Recreate it? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "  Removing existing environment..."
            conda remove -n "$env_name" --all -y
        else
            echo "  Using existing environment"
        fi
    fi
    
    # Create environment if it doesn't exist
    if ! conda env list | grep -q "^${env_name} "; then
        echo "  Creating conda environment '$env_name' with Python $PYTHON_VERSION..."
        conda create -n "$env_name" python="$PYTHON_VERSION" -y
        if [ $? -ne 0 ]; then
            echo "  ERROR: Failed to create environment"
            return 1
        fi
    fi
    
    # Install requirements if file exists
    if [ -f "$requirements_file" ]; then
        echo "  Installing requirements from $requirements_file..."
        conda run -n "$env_name" pip install -r "$requirements_file"
        if [ $? -ne 0 ]; then
            echo "  WARNING: Some packages may have failed to install"
        else
            echo "  ✓ Requirements installed successfully"
        fi
    else
        echo "  WARNING: No requirements.txt found at $requirements_file"
    fi
    
    echo ""
    return 0
}

# Setup each environment
setup_env "$CONDA_ENV_AGENT" "$SCRIPT_DIR/NuruAgent"
setup_env "$CONDA_ENV_TF_GPU" "$SCRIPT_DIR/Games/model_server"
setup_env "$CONDA_ENV_ALI_MODEL" "$SCRIPT_DIR/ALI_Model/model"

echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "To activate an environment manually:"
echo "  conda activate $CONDA_ENV_AGENT"
echo "  conda activate $CONDA_ENV_TF_GPU"
echo "  conda activate $CONDA_ENV_ALI_MODEL"
echo ""

