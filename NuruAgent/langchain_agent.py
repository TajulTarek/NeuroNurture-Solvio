
import os
import json
import logging
import psycopg2
import threading
import time
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv

from langchain_anthropic import ChatAnthropic
from langchain_core.tools import Tool
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.runnables import RunnablePassthrough

from config import settings

load_dotenv()
logger = logging.getLogger(__name__)


class NeuroNurtureAgent:
    """Professional AI Agent for NeuroNurture using LangChain
    
    API Interface:
    The agent receives requests with the following parameters:
    - user_type: Type of user (parent/school/admin) - determines access level and permissions
    - user_id: Unique identifier for the user - used for data filtering and personalization
    - context: Previous conversation context - maintains conversation continuity and memory
    - message: The actual user question or request - the main input to process
    
    These parameters are used to:
    - Set appropriate access restrictions based on user type
    - Filter database queries to user-specific data
    - Maintain conversation context for better responses
    - Personalize responses based on user identity
    """
    
    def __init__(self):
        """Initialize the agent with LangChain components"""
        # Initialize Claude LLM
        self.llm = ChatAnthropic(
            model="claude-sonnet-4-5-20250929",
            anthropic_api_key=settings.ANTHROPIC_API_KEY,
            timeout=30.0,
            temperature=0.7,
            max_tokens=1000
        )
        
        # Initialize database connection
        self.db_connection = None
        self._connection_lock = threading.Lock()
        self._monitor_thread = None
        self._stop_monitoring = False
        self._connect_database()
        self._start_connection_monitor()
        
        # User context (set per request)
        self.current_user_type = "admin"
        self.current_user_id = None
        
    def _connect_database(self):
        """Connect to PostgreSQL database"""
        with self._connection_lock:
            try:
                if self.db_connection:
                    self.db_connection.close()
                self.db_connection = psycopg2.connect(settings.DATABASE_URL)
                logger.info("Database connected successfully")
            except Exception as e:
                logger.error(f"Database connection failed: {e}")
                self.db_connection = None
    
    def _is_connection_alive(self) -> bool:
        """Check if database connection is alive"""
        if not self.db_connection:
            return False
        
        try:
            with self._connection_lock:
                cursor = self.db_connection.cursor()
                cursor.execute("SELECT 1")
                cursor.fetchone()
                cursor.close()
                return True
        except Exception as e:
            logger.warning(f"Database connection check failed: {e}")
            return False
    
    def _start_connection_monitor(self):
        """Start background thread to monitor database connection"""
        if self._monitor_thread and self._monitor_thread.is_alive():
            return
        
        self._stop_monitoring = False
        self._monitor_thread = threading.Thread(target=self._monitor_connection, daemon=True)
        self._monitor_thread.start()
        logger.info("Database connection monitor started")
    
    def _monitor_connection(self):
        """Background thread to monitor and maintain database connection"""
        while not self._stop_monitoring:
            try:
                if not self._is_connection_alive():
                    logger.warning("Database connection lost, attempting to reconnect...")
                    self._connect_database()
                time.sleep(1)  # Check every 1 second
            except Exception as e:
                logger.error(f"Error in connection monitor: {e}")
                time.sleep(1)
    
    def _stop_connection_monitor(self):
        """Stop the connection monitoring thread"""
        self._stop_monitoring = True
        if self._monitor_thread and self._monitor_thread.is_alive():
            self._monitor_thread.join(timeout=2)
        logger.info("Database connection monitor stopped")
    
    def _get_database_schema(self) -> str:
        """Get database schema information"""
        if not self.db_connection:
            return "Database not connected"
        
        try:
            with self._connection_lock:
                cursor = self.db_connection.cursor()
                cursor.execute("""
                    SELECT 
                        t.table_name,
                        c.column_name,
                        c.data_type,
                        c.is_nullable
                    FROM information_schema.tables t
                    LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
                    WHERE t.table_schema = 'public'
                    ORDER BY t.table_name, c.ordinal_position
                """)
                
                results = cursor.fetchall()
                cursor.close()
            
            # Group by table
            tables = {}
            for row in results:
                table_name, column_name, data_type, is_nullable = row
                if table_name not in tables:
                    tables[table_name] = []
                if column_name:
                    tables[table_name].append({
                        'column': column_name,
                        'type': data_type,
                        'nullable': is_nullable
                    })
            
            # Format schema concisely with table-specific clarifications
            schema_text = "Database Schema:\n"
            for table_name, columns in tables.items():
                schema_text += f"\nTable: {table_name}\n"
                
                # Add specific clarifications for important tables
                if table_name == "app_user":
                    schema_text += "  IMPORTANT: This table contains ONLY PARENT information. It does NOT contain doctor, school, or admin data.\n"
                elif table_name == "parent":
                    schema_text += "  This table contains parent profile information.\n"
                elif table_name == "child":
                    schema_text += "  This table contains child information linked to parents.\n"
                elif table_name == "schools":
                    schema_text += "  This table contains school information.\n"
                elif table_name == "doctor":
                    schema_text += "  This table contains doctor information.\n"
                
                for col in columns:  # Limit columns shown
                    schema_text += f"  - {col['column']}: {col['type']}\n"
                
            
            return schema_text
            
        except Exception as e:
            logger.error(f"Error getting database schema: {e}")
            return f"Error getting schema: {str(e)}"
    
    def _build_user_context(self, user_type: str, user_id: int = None) -> str:
        """Build user-specific context"""
        user_type = user_type.lower()
        
        if user_type == "parent" and user_id and self.db_connection:
            try:
                with self._connection_lock:
                    cursor = self.db_connection.cursor()
                    cursor.execute("""
                        SELECT c.id, c.name, c.date_of_birth, c.gender 
                        FROM child c 
                        WHERE c.parent_id = %s
                    """, (user_id,))
                    children = cursor.fetchall()
                    cursor.close()
                
                if children:
                    children_info = "\n".join([
                        f"- Child ID: {child[0]}, Name: {child[1]}, DOB: {child[2]}, Gender: {child[3]}" 
                        for child in children
                    ])
                    return f"Parent ID: {user_id}\nYour Children:\n{children_info}"
                else:
                    return f"Parent ID: {user_id}\nNo children found in system."
            except Exception as e:
                logger.error(f"Error getting parent context: {e}")
                return f"Parent ID: {user_id}"
                
        elif user_type == "school" and user_id and self.db_connection:
            try:
                with self._connection_lock:
                    cursor = self.db_connection.cursor()
                    cursor.execute("""
                        SELECT s.school_name, s.city, s.state, s.student_count
                        FROM schools s 
                        WHERE s.id = %s
                    """, (user_id,))
                    school_info = cursor.fetchone()
                    
                    cursor.execute("""
                        SELECT c.id, c.name, c.date_of_birth, c.gender, c.parent_id
                        FROM child c 
                        WHERE c.school_id = %s
                        LIMIT 5
                    """, (user_id,))
                    children = cursor.fetchall()
                    cursor.close()
                
                if school_info:
                    school_context = f"School ID: {user_id}\nSchool Name: {school_info[0]}\nLocation: {school_info[1]}, {school_info[2]}\nStudent Count: {school_info[3]}"
                    if children:
                        children_info = "\n".join([
                            f"- Child ID: {child[0]}, Name: {child[1]}" 
                            for child in children
                        ])
                        return f"{school_context}\n\nEnrolled Children (showing first 5):\n{children_info}"
                    else:
                        return f"{school_context}\n\nNo children enrolled in this school."
                else:
                    return f"School ID: {user_id}\nSchool not found in system."
            except Exception as e:
                logger.error(f"Error getting school context: {e}")
                return f"School ID: {user_id}"
                
        elif user_type == "admin":
            return "Full system administrator access"
        else:
            return f"User Type: {user_type}"
    
    def _get_access_rules(self, user_type: str) -> str:
        """Get access rules based on user type"""
        user_type = user_type.lower()
        
        if user_type == "parent":
            return """
ACCESS RESTRICTIONS FOR PARENT:
- You can ONLY access data about YOUR OWN CHILDREN
- You CANNOT access other children's data, school information, or system-wide statistics
- You CANNOT access other parents' information
- You CAN compare your children's progress with general benchmarks
- All database queries MUST filter by parent_id or child_id belonging to parent
- If asked about others, politely decline and redirect to their own children
"""
        elif user_type == "school":
            return """
ACCESS RESTRICTIONS FOR SCHOOL:
- You can ONLY access data about YOUR SCHOOL and CHILDREN ENROLLED IN YOUR SCHOOL
- You CANNOT access other schools' data or children from other schools
- You CAN access educational game data for children enrolled in your school
- All database queries MUST filter by school_id or child_id belonging to school
- If asked about other schools, politely decline and redirect to your school's data
"""
        else:  # admin
            return """
ACCESS RULES FOR ADMIN:
- Full access to all data in the system
- Can access any child, parent, school, or game data
- Can provide system-wide statistics and comparisons
"""
    
    def _create_tools(self) -> List[Tool]:
        """Create LangChain tools for the agent"""
        
        def web_search_tool(query: str) -> str:
            """Search for current information using Claude's knowledge"""
            try:
                search_prompt = f"""Search for current information about: {query}

Provide a concise summary focusing only on the most relevant and recent information. Keep it brief and directly related to the query.

IMPORTANT: Format your response in PLAIN TEXT only. No markdown, HTML, bold text, bullet points, or special formatting."""
                
                response = self.llm.invoke([HumanMessage(content=search_prompt)])
                return f"Web search results for '{query}':\n{response.content}"
                
            except Exception as e:
                logger.error(f"Web search error: {e}")
                return f"Search error: {str(e)}"
        
        def database_query_tool(query_request: str) -> str:
            """Execute database query based on natural language request"""
            if not self.db_connection:
                return "Database not connected"
            
            try:
                # Generate SQL query using LLM
                schema = self._get_database_schema()
                user_context = self._build_user_context(self.current_user_type, self.current_user_id)
                access_rules = self._get_access_rules(self.current_user_type)
                
                query_prompt = f"""Generate a SQL query for this request:

User Type: {self.current_user_type.upper()}
{user_context}

User request: "{query_request}"

Database schema:
{schema}

{access_rules}

CRITICAL TABLE CLARIFICATIONS:
- app_user table: Contains ONLY PARENT information. It does NOT contain doctor, school, or admin data.
- parent table: Contains parent profile information.
- child table: Contains child information linked to parents.
- schools table: Contains school information.
- doctor table: Contains doctor information.

SQL Generation Rules:
1. Use only SELECT queries
2. Use EXACT table and column names from the schema above
3. Add LIMIT clause for large results (max 10 records)
4. Enforce access restrictions based on user type
5. Return only the SQL query, nothing else
6. Double-check table and column names against the schema
7. If unsure about table/column names, use the get_database_schema tool first
8. REMEMBER: app_user table is ONLY for parents, not other user types

Example for Admin: SELECT * FROM child LIMIT 10
Example for Parent: SELECT * FROM child WHERE parent_id = {self.current_user_id} LIMIT 10
Example for School: SELECT * FROM child WHERE school_id = {self.current_user_id} LIMIT 10

IMPORTANT: Use only the exact table and column names shown in the schema above. Do NOT assume app_user contains non-parent data."""

                response = self.llm.invoke([HumanMessage(content=query_prompt)])
                sql_query = response.content.strip()
                sql_query = sql_query.replace("```sql", "").replace("```", "").strip()
                
                logger.info(f"Generated SQL: {sql_query}")
                
                # Execute query
                with self._connection_lock:
                    cursor = self.db_connection.cursor()
                    cursor.execute(sql_query)
                    results = cursor.fetchall()
                    columns = [desc[0] for desc in cursor.description] if cursor.description else []
                    
                    # Convert to list of dictionaries
                    data = []
                    for row in results:
                        data.append(dict(zip(columns, row)))
                    
                    cursor.close()
                
                if not data:
                    return "No data found"
                
                # Format results concisely
                result_text = f"Found {len(data)} records:\n"
                for i, record in enumerate(data[:5]):  # Show first 5 records
                    result_text += f"Record {i+1}: {record}\n"
                
                if len(data) > 5:
                    result_text += f"... and {len(data) - 5} more records"
                
                return result_text
                
            except Exception as e:
                logger.error(f"Database query error: {e}")
                return f"Database error: {str(e)}"
        
        def get_schema_tool(query: str = "") -> str:
            """Get database schema information"""
            return self._get_database_schema()
        
        # Create LangChain Tool objects
        tools = [
            Tool(
                name="web_search",
                func=web_search_tool,
                description="Search for current information, news, general knowledge, educational content, or any topic outside the NeuroNurture database. Use when user asks about general information, current events, educational advice, or topics not in the database."
            ),
            Tool(
                name="get_database_schema",
                func=get_schema_tool,
                description="Get the database schema to understand what tables and columns are available. ALWAYS use this tool FIRST before making any database queries to ensure you use the correct table and column names. This prevents hallucination and ensures accurate queries."
            ),
            Tool(
                name="database_query",
                func=database_query_tool,
                description="Query the NeuroNurture database for specific data about children, parents, schools, educational games, progress, performance, or any stored information. Use ONLY after checking the database schema with get_database_schema tool. Use when user asks about specific children, game scores, progress reports, or any data that would be stored in the system. IMPORTANT: Always respect user access restrictions. REMEMBER: app_user table contains ONLY parent information, not doctor/school/admin data."
            )
        ]
        
        return tools
    
    def _create_system_prompt(self, user_type: str, user_id: int = None, conversation_context: str = "") -> str:
        """Create system prompt for the agent"""
        user_context = self._build_user_context(user_type, user_id)
        access_rules = self._get_access_rules(user_type)
        
        context_section = ""
        if conversation_context:
            context_section = f"\n\nPrevious conversation context:\n{conversation_context}"
        
        system_prompt = f"""You are an AI assistant for the NeuroNurture educational platform. You help users with questions about children's educational progress, games, and learning data.

API REQUEST INFORMATION:
This agent receives the following information from the API request:
- User Type: {user_type.upper()} (determines access level and permissions)
- User ID: {user_id if user_id else 'Not provided'} (identifies the specific user)
- Context: {conversation_context if conversation_context else 'No previous context'} (conversation history for continuity)
- User Message: The actual question or request from the user

Current Request Details:
User Type: {user_type.upper()}
{user_context}

{access_rules}

IMPORTANT DATABASE TABLE CLARIFICATIONS:
- app_user table: Contains ONLY PARENT information. It does NOT contain doctor, school, or admin data.
- parent table: Contains parent profile information.
- child table: Contains child information linked to parents.
- schools table: Contains school information.
- doctor table: Contains doctor information.

RESPONSE GUIDELINES:
1. Limit responses to maximum 5 sentences
2. Be clear, helpful, and supportive
3. Do NOT use any formatting symbols like ** __ * _ - # > ``` or any markdown/HTML
4. Keep responses short and to the point
5. Only include relevant information, nothing extra

DATABASE QUERY WORKFLOW:
- ALWAYS use get_database_schema tool FIRST when you need to query the database
- This will show you the exact table names, column names, and data types
- Then use database_query tool with the correct table and column names from the schema
- This prevents hallucination and ensures accurate queries
- Remember: app_user table is ONLY for parents, not other user types

TOOL USAGE:
- get_database_schema: Use FIRST to understand database structure before any queries
- database_query: Use to get specific data from the database (after checking schema)
- web_search: Use for general information, educational advice, or topics outside the database

ACCESS RESTRICTIONS:
- Parents can only see their own children's data
- Schools can only see their enrolled students' data
- Admins can see all data
- Always respect these restrictions when querying{context_section}

Provide helpful, informative responses that address the user's needs appropriately."""
        
        return system_prompt
    
    def process_message(self, message: str, user_type: str = "admin", user_id: int = None, context: str = "") -> Dict[str, Any]:
        """Process user message using LangChain agent
        
        API Request Parameters:
        - message: The user's question or request (string)
        - user_type: Type of user (parent/school/admin) - determines access level
        - user_id: Unique identifier for the user - used for data filtering
        - context: Previous conversation context - maintains conversation continuity
        
        Returns:
        - Dict containing response, database_accessed, web_searched, tools_used
        """
        try:
            # Set current user context
            self.current_user_type = user_type.lower()
            self.current_user_id = user_id
            
            logger.info(f"Processing message from {user_type} (ID: {user_id}): {message[:50]}...")
            
            # Create tools
            tools = self._create_tools()
            
            # Create system prompt
            system_prompt = self._create_system_prompt(user_type, user_id, context)
            
            # Create prompt template for tool calling agent
            prompt = ChatPromptTemplate.from_messages([
                ("system", system_prompt),
                ("human", "{input}"),
                MessagesPlaceholder(variable_name="agent_scratchpad"),
            ])
            
            # Create agent
            agent = create_tool_calling_agent(self.llm, tools, prompt)
            
            # Create agent executor
            agent_executor = AgentExecutor(
                agent=agent,
                tools=tools,
                verbose=True,
                handle_parsing_errors=True,
                max_iterations=5,
                return_intermediate_steps=True
            )
            
            # Execute agent
            result = agent_executor.invoke({"input": message})
            
            # Extract response and metadata
            response_text = result.get("output", "")
            intermediate_steps = result.get("intermediate_steps", [])
            
            # Handle case where response_text might be a list of dicts (from Claude's response)
            if isinstance(response_text, list):
                # Extract text from Claude's response format
                if len(response_text) > 0 and isinstance(response_text[0], dict):
                    response_text = response_text[0].get("text", "")
                else:
                    response_text = str(response_text)
            elif not isinstance(response_text, str):
                response_text = str(response_text)
            
            # Determine which tools were used
            tools_used = set()
            for step in intermediate_steps:
                if len(step) >= 1 and hasattr(step[0], 'tool'):
                    tools_used.add(step[0].tool)
            
            return {
                "response": response_text,
                "database_accessed": "database_query" in tools_used,
                "web_searched": "web_search" in tools_used,
                "tools_used": len(tools_used)
            }
            
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            return {
                "response": f"I encountered an error while processing your request. Please try again.",
                "error": True
            }
    
    def classify_ticket_priority(self, message: str, user_type: str = "user", user_id: int = None) -> Dict[str, Any]:
        """Classify ticket priority and rewrite message for clarity
        
        API Request Parameters:
        - message: The user's ticket/issue message (string)
        - user_type: Type of user (parent/school/admin) - affects priority classification
        - user_id: Unique identifier for the user - used for context
        
        Returns:
        - Dict containing priority, rewritten_message, reasoning, error status
        """
        try:
            classification_prompt = f"""You are an expert ticket classification system for a child development and educational platform.

Your task is to:
1. Classify the priority of the user's issue/ticket
2. Rewrite the message to be clear, grammatically correct, and professional for admin review

PRIORITY CLASSIFICATION GUIDELINES:
- URGENT: Payment issues, Subscription issues, Login issues, System crashes, security issues, data loss, payment failures, critical bugs affecting multiple users
- HIGH: Major feature broken, significant user experience issues, important functionality not working
- MEDIUM: Minor bugs, feature requests, general questions, moderate user experience issues
- LOW: Cosmetic issues, minor suggestions, informational requests, non-critical improvements

MESSAGE REWRITING GUIDELINES:
- Fix grammar and spelling errors
- Improve clarity and structure
- Don't be verbose. Just say the specific message considering the user's needs.
- Make it professional and concise
- Preserve the original intent and details
- Use proper technical terminology when appropriate
- Rewrite in first person. As if you are the user.
- Don't use any formatting symbols like ** __ * _ - # > ``` or any markdown/HTML

User Type: {user_type}
User ID: {user_id if user_id else 'Unknown'}

Original Message:
{message}

Please respond in the following JSON format:
{{
    "priority": "LOW|MEDIUM|HIGH|URGENT",
    "rewritten_message": "Clear, grammatically correct, and professional version of the message",
    "reasoning": "Brief explanation of why this priority was chosen"
}}"""

            response = self.llm.invoke([HumanMessage(content=classification_prompt)])
            response_text = response.content
            
            # Try to parse JSON response
            try:
                # Clean up response
                cleaned_text = response_text.strip()
                if cleaned_text.startswith("```json"):
                    cleaned_text = cleaned_text.replace("```json", "").replace("```", "").strip()
                
                result = json.loads(cleaned_text)
                
                # Validate priority
                valid_priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"]
                if result.get("priority") not in valid_priorities:
                    result["priority"] = "MEDIUM"
                
                return {
                    "priority": result["priority"],
                    "rewritten_message": result.get("rewritten_message", message),
                    "reasoning": result.get("reasoning", "Priority classified based on content analysis"),
                    "error": False
                }
                
            except json.JSONDecodeError:
                # Fallback: extract priority from text
                response_lower = response_text.lower()
                
                if "urgent" in response_lower:
                    priority = "URGENT"
                elif "high" in response_lower:
                    priority = "HIGH"
                elif "low" in response_lower:
                    priority = "LOW"
                else:
                    priority = "MEDIUM"
                
                return {
                    "priority": priority,
                    "rewritten_message": message,
                    "reasoning": "Priority extracted from AI response",
                    "error": False
                }
                
        except Exception as e:
            logger.error(f"Error classifying ticket priority: {e}")
            return {
                "priority": "MEDIUM",
                "rewritten_message": message,
                "reasoning": "Error occurred during classification",
                "error": True
            }


# Create global instance
neuronurture_agent = NeuroNurtureAgent()

# Add cleanup handler for graceful shutdown
import atexit

def cleanup_agent():
    """Cleanup function to stop monitoring and close connections"""
    if hasattr(neuronurture_agent, '_stop_connection_monitor'):
        neuronurture_agent._stop_connection_monitor()
    if hasattr(neuronurture_agent, 'db_connection') and neuronurture_agent.db_connection:
        try:
            neuronurture_agent.db_connection.close()
        except:
            pass

atexit.register(cleanup_agent)
