#!/usr/bin/env python3
"""
Simple test to check if the agent works
"""
import sys
import traceback

def test_import():
    try:
        print("Testing imports...")
        from langchain_agent import neuronurture_agent
        print("✓ Agent imported successfully")
        return True
    except Exception as e:
        print(f"✗ Import failed: {e}")
        traceback.print_exc()
        return False

def test_simple_message():
    try:
        print("Testing simple message...")
        from langchain_agent import neuronurture_agent
        
        response = neuronurture_agent.process_message(
            message="Hello, how are you?",
            user_type="admin",
            user_id=None,
            context=""
        )
        
        print(f"✓ Response received: {response}")
        return True
    except Exception as e:
        print(f"✗ Message processing failed: {e}")
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("Testing LangChain Agent")
    print("=" * 50)
    
    if test_import():
        test_simple_message()
    
    print("=" * 50)

