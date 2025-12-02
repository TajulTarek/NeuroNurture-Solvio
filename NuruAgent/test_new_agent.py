#!/usr/bin/env python3
"""
Test script for the new LangChain-based agent
Run this after installing dependencies to verify the implementation
"""

import sys
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_agent_initialization():
    """Test that the agent initializes correctly"""
    try:
        from langchain_agent import neuronurture_agent
        
        logger.info("✓ Agent initialized successfully")
        logger.info(f"✓ Database connected: {neuronurture_agent.db_connection is not None}")
        logger.info(f"✓ LLM initialized: {neuronurture_agent.llm is not None}")
        return True
    except Exception as e:
        logger.error(f"✗ Agent initialization failed: {e}")
        return False

def test_process_message():
    """Test message processing"""
    try:
        from langchain_agent import neuronurture_agent
        
        # Test admin query
        response = neuronurture_agent.process_message(
            message="How many children are in the system?",
            user_type="admin",
            user_id=None,
            context=""
        )
        
        logger.info("✓ Message processing works")
        logger.info(f"  Response: {response.get('response', '')[:100]}...")
        logger.info(f"  Tools used: {response.get('tools_used', 0)}")
        return True
    except Exception as e:
        logger.error(f"✗ Message processing failed: {e}")
        return False

def test_ticket_classification():
    """Test ticket priority classification"""
    try:
        from langchain_professional_agent import neuronurture_agent
        
        result = neuronurture_agent.classify_ticket_priority(
            message="i cant login pls help!!!",
            user_type="parent",
            user_id=1
        )
        
        logger.info("✓ Ticket classification works")
        logger.info(f"  Priority: {result.get('priority', 'N/A')}")
        logger.info(f"  Rewritten: {result.get('rewritten_message', '')[:100]}...")
        return True
    except Exception as e:
        logger.error(f"✗ Ticket classification failed: {e}")
        return False

def test_access_control():
    """Test user type access control"""
    try:
        from langchain_agent import neuronurture_agent
        
        # Test parent context
        context = neuronurture_agent._build_user_context("parent", 1)
        logger.info("✓ Parent context built successfully")
        logger.info(f"  Context preview: {context[:100]}...")
        
        # Test school context
        context = neuronurture_agent._build_user_context("school", 1)
        logger.info("✓ School context built successfully")
        
        # Test admin context
        context = neuronurture_agent._build_user_context("admin", None)
        logger.info("✓ Admin context built successfully")
        
        return True
    except Exception as e:
        logger.error(f"✗ Access control test failed: {e}")
        return False

def test_tools_creation():
    """Test that tools are created correctly"""
    try:
        from langchain_agent import neuronurture_agent
        
        tools = neuronurture_agent._create_tools()
        
        logger.info(f"✓ Created {len(tools)} tools")
        for tool in tools:
            logger.info(f"  - {tool.name}: {tool.description[:50]}...")
        
        return True
    except Exception as e:
        logger.error(f"✗ Tools creation failed: {e}")
        return False

def main():
    """Run all tests"""
    logger.info("=" * 60)
    logger.info("Testing LangChain Agent Implementation")
    logger.info("=" * 60)
    
    tests = [
        ("Agent Initialization", test_agent_initialization),
        ("Access Control", test_access_control),
        ("Tools Creation", test_tools_creation),
        ("Ticket Classification", test_ticket_classification),
        ("Message Processing", test_process_message),
    ]
    
    results = []
    for test_name, test_func in tests:
        logger.info(f"\n--- Testing: {test_name} ---")
        results.append((test_name, test_func()))
    
    # Summary
    logger.info("\n" + "=" * 60)
    logger.info("TEST SUMMARY")
    logger.info("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        logger.info(f"{status}: {test_name}")
    
    logger.info(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        logger.info("\n🎉 All tests passed! Agent is ready to use.")
        return 0
    else:
        logger.info(f"\n⚠️ {total - passed} test(s) failed. Please check the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
