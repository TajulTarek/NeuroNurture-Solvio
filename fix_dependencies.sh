#!/bin/bash

# Fix Dependencies Script
# This script reinstalls dependencies for all Python services

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Initialize conda
if [ -f "$HOME/miniconda3/etc/profile.d/conda.sh" ]; then
    source "$HOME/miniconda3/etc/profile.d/conda.sh"
elif [ -f "$HOME/anaconda3/etc/profile.d/conda.sh" ]; then
    source "$HOME/anaconda3/etc/profile.d/conda.sh"
fi

echo "=========================================="
echo "Fixing Python Service Dependencies"
echo "=========================================="
echo ""

# NuruAgent
echo "=== Fixing NuruAgent (agent environment) ==="
if conda env list | grep -q "^agent "; then
    echo "Upgrading pip and reinstalling dependencies..."
    conda run -n agent pip install --upgrade pip
    conda run -n agent pip install --upgrade -r "$SCRIPT_DIR/NuruAgent/requirements.txt"
    echo "Fixing LangChain dependencies (langchain-core missing)..."
    conda run -n agent pip install --upgrade "langchain-core>=0.3.15" "langchain==0.3.7" "langchain-community==0.3.7"
    echo "Fixing Anthropic version compatibility (proxies argument error)..."
    conda run -n agent pip install --upgrade "anthropic>=0.40.0" "langchain-anthropic>=0.2.2"
    echo "✓ NuruAgent dependencies updated"
else
    echo "⚠️  'agent' conda environment not found. Run setup_conda_envs.sh first."
fi
echo ""

# Model Server
echo "=== Fixing Model Server (tf_gpu environment) ==="
if conda env list | grep -q "^tf_gpu "; then
    echo "Upgrading pip and reinstalling dependencies..."
    conda run -n tf_gpu pip install --upgrade pip
    conda run -n tf_gpu pip install --upgrade -r "$SCRIPT_DIR/Games/model_server/requirements.txt"
    echo "✓ Model Server dependencies updated"
else
    echo "⚠️  'tf_gpu' conda environment not found. Run setup_conda_envs.sh first."
fi
echo ""

# ALI Model
echo "=== Fixing ALI Model (ali_model environment) ==="
if conda env list | grep -q "^ali_model "; then
    echo "Upgrading pip and reinstalling dependencies..."
    conda run -n ali_model pip install --upgrade pip
    conda run -n ali_model pip install --upgrade -r "$SCRIPT_DIR/ALI_Model/model/requirements.txt"
    echo "✓ ALI Model dependencies updated"
else
    echo "⚠️  'ali_model' conda environment not found. Run setup_conda_envs.sh first."
fi
echo ""

echo "=========================================="
echo "Done! Try running ./run_all.sh again"
echo "=========================================="

