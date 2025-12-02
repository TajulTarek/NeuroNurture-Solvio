# NuruAgent - NeuroNurture AI Agent

**Version 5.0.0** | Powered by LangChain + Claude Sonnet 4

A professional AI-powered chatbot service for the NeuroNurture platform that provides intelligent assistance for autism detection, child development tracking, and educational game management.

## 🚀 Overview

NuruAgent is a sophisticated AI agent built on LangChain that serves as the intelligent backend for the NeuroNurture platform. It provides role-based assistance to parents, schools, doctors, and administrators, helping them understand child development progress, game performance, and platform insights.

## ✨ Key Features

### 🤖 AI-Powered Intelligence
- **Claude Sonnet 4 Integration**: State-of-the-art language model for intelligent responses
- **LangChain Framework**: Professional agent architecture with automatic tool selection
- **Context-Aware Conversations**: Maintains conversation context for better understanding
- **Smart Tool Orchestration**: Automatically selects and executes appropriate tools

### 🔐 Role-Based Access Control
- **Admin**: Full system access and analytics
- **Parent**: Access to their own children's data and progress
- **School**: Access to enrolled students' information
- **Doctor**: Patient-specific data and therapeutic insights

### 🎮 Game Intelligence
The agent understands all 5 NeuroNurture cognitive development games:
1. **Gaze Tracking** - Eye movement and cognitive training
2. **Gesture Control** - Hand movement and motor skills development
3. **Mirror Posture** - Physical coordination and posture training
4. **Dance Doodle** - Creative expression through movement
5. **Repeat With Me** - Memory and auditory processing

### 📊 Advanced Capabilities
- **Performance Analytics**: AI-generated insights on child development progress
- **Ticket Classification**: Automatic priority classification for support tickets
- **Database Queries**: Secure, role-filtered database access
- **Web Search**: General information and educational content retrieval

## 📁 Project Structure

```
NuruAgent/
├── main.py                      # FastAPI application and endpoints
├── langchain_agent.py           # Core LangChain agent implementation
├── ai_agent.py                  # Legacy agent (backup)
├── simple_langchain_agent.py    # Alternative implementation
├── performance_helpers.py       # Child performance analysis utilities
├── config.py                    # Configuration management
├── start.py                     # Simple startup script
├── requirements.txt             # Python dependencies
├── .env                         # Environment configuration (create this)
├── .gitignore                   # Git ignore rules
├── README.md                    # This file
├── LANGCHAIN_IMPLEMENTATION.md  # Technical implementation details
├── UPGRADE_SUMMARY.md           # Upgrade documentation
├── README_PERFORMANCE_OVERVIEW.md # Performance features
├── test_new_agent.py            # Test suite
└── test_simple.py               # Simple tests
```

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.8 or higher
- PostgreSQL database (NeuroNurture schema)
- Anthropic API key for Claude

### 1. Install Dependencies

```bash
cd NuruAgent
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file in the `NuruAgent` directory:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/neuronnurture

# Anthropic Claude AI Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Application Configuration
DEBUG=True
HOST=0.0.0.0
PORT=8005
```

### 3. Start the Server

**Option 1: Using the startup script (Recommended)**
```bash
python start.py
```

**Option 2: Using uvicorn directly**
```bash
uvicorn main:app --host 0.0.0.0 --port 8005 --reload
```

**Option 3: Using Python directly**
```bash
python main.py
```

The server will be available at: `http://localhost:8005`

## 📡 API Endpoints

### Health & Status

#### `GET /`
Health check endpoint
```json
{
  "message": "NeuroNurture AI Chatbot is running",
  "status": "healthy"
}
```

#### `GET /health`
Detailed system status
```json
{
  "status": "healthy",
  "database": "connected",
  "ai_service": "connected",
  "version": "5.0.0",
  "framework": "LangChain + Claude Sonnet 4"
}
```

### Chat & AI

#### `POST /chat`
Main AI chat endpoint

**Request:**
```json
{
  "message": "How is my child performing in games?",
  "user_type": "parent",
  "user_id": 1,
  "context": "Previous conversation context (optional)"
}
```

**Response:**
```json
{
  "response": "Your child is showing excellent progress...",
  "error": false
}
```

**Parameters:**
- `message` (string, required): User's question or request
- `user_type` (string, default: "admin"): Type of user - "parent", "school", "admin", or "doctor"
- `user_id` (int, optional): Unique identifier for the user
- `context` (string, optional): Previous conversation context for continuity

#### `POST /ticket/classify`
Classify ticket priority and rewrite message

**Request:**
```json
{
  "message": "payment not working help!!!",
  "user_type": "parent",
  "user_id": 1
}
```

**Response:**
```json
{
  "priority": "HIGH",
  "rewritten_message": "Payment system is not functioning properly. Requesting immediate assistance.",
  "reasoning": "Payment issues are critical and affect user experience.",
  "error": false
}
```

### Data & Analytics

#### `GET /child/{child_id}/performance-overview`
Get AI-generated performance overview for a specific child

**Response:**
```json
{
  "overview": "Comprehensive AI-generated insights...",
  "has_data": true,
  "child_info": {
    "name": "John Doe",
    "date_of_birth": "2018-05-15",
    "gender": "M",
    "parent_name": "Jane Doe"
  },
  "performance_summary": {...}
}
```

#### `GET /parents`
Get list of all parents with children count

#### `GET /schools`
Get list of all schools with enrollment data

#### `GET /tables`
Get list of all database tables

#### `GET /games`
Get available games information

#### `GET /roles`
Get list of available user roles

## 🎯 Usage Examples

### Example 1: Parent Querying Child Progress

```bash
curl -X POST http://localhost:8005/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How is my child doing in the gaze tracking game?",
    "user_type": "parent",
    "user_id": 1
  }'
```

### Example 2: School Querying Student Data

```bash
curl -X POST http://localhost:8005/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me all students enrolled in my school",
    "user_type": "school",
    "user_id": 5
  }'
```

### Example 3: Admin Analytics Query

```bash
curl -X POST http://localhost:8005/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are the overall platform statistics?",
    "user_type": "admin",
    "user_id": 1
  }'
```

### Example 4: Ticket Classification

```bash
curl -X POST http://localhost:8005/ticket/classify \
  -H "Content-Type: application/json" \
  -d '{
    "message": "urgent! my child cannot login",
    "user_type": "parent",
    "user_id": 1
  }'
```

## 🧪 Testing

### Run Test Suite

```bash
python test_new_agent.py
```

Tests verify:
- Agent initialization
- Access control functionality
- Tool creation and execution
- Ticket classification
- Message processing
- Database connectivity

### Simple Test

```bash
python test_simple.py
```

## 🔧 Configuration

### Database Connection
- PostgreSQL connection via `DATABASE_URL` environment variable
- Automatic connection monitoring and reconnection
- Thread-safe database access
- Role-based query filtering

### AI Service
- Anthropic Claude API integration
- Claude Sonnet 4 model (`claude-sonnet-4-5-20250929`)
- Configurable temperature and max tokens
- Timeout handling

### Security Features
- Role-based access control (RBAC)
- SQL injection prevention (parameterized queries)
- Data privacy enforcement (users can only see their own data)
- Error message sanitization
- Connection monitoring

## 🏗️ Architecture

### Agent Flow

```
User Request
    ↓
FastAPI Endpoint (/chat)
    ↓
NeuroNurtureAgent.process_message()
    ↓
LangChain Agent (create_tool_calling_agent)
    ↓
Claude Sonnet 4 (Function Calling)
    ↓
Tool Selection & Execution
    ├── web_search
    ├── database_query (with access control)
    └── get_database_schema
    ↓
Response Generation
    ↓
Formatted Response (5 sentences max, no markdown)
```

### Tools Available

1. **web_search(query: str)**
   - Searches the web for general information
   - Used for educational content, current events, general knowledge

2. **database_query(query: str)**
   - Executes SQL queries on NeuroNurture database
   - Automatically applies role-based access restrictions
   - Prevents SQL injection with parameterized queries

3. **get_database_schema()**
   - Returns database schema information
   - Shows available tables and columns
   - Helps agent understand data structure

## 📊 Response Guidelines

The agent follows strict response guidelines:

- **Maximum 5 sentences** per response
- **No markdown formatting** (no bold, bullets, code blocks)
- **Plain text only** for clean, readable responses
- **Concise and relevant** information
- **Supportive and helpful** tone

## 🔄 Access Control Logic

### Parent Access
```sql
-- Parents can only see their own children
SELECT * FROM child WHERE parent_id = {user_id}
```

### School Access
```sql
-- Schools can only see their enrolled students
SELECT * FROM child WHERE school_id = {user_id}
```

### Admin Access
```sql
-- Admins have full access
SELECT * FROM child
```

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Create `.env` file** with your database URL and Anthropic API key

3. **Start the server:**
   ```bash
   python start.py
   ```

4. **Verify health:**
   ```bash
   curl http://localhost:8005/health
   ```

5. **Start chatting:**
   ```bash
   curl -X POST http://localhost:8005/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello!", "user_type": "admin"}'
   ```

## 📚 Documentation

- **LANGCHAIN_IMPLEMENTATION.md**: Detailed technical implementation
- **UPGRADE_SUMMARY.md**: Upgrade history and migration guide
- **README_PERFORMANCE_OVERVIEW.md**: Performance analytics features

## 🐛 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` in `.env` file
- Check PostgreSQL is running
- Verify database credentials
- Check firewall/network settings

### API Key Issues
- Verify `ANTHROPIC_API_KEY` is set correctly
- Check API key has sufficient credits
- Verify API key permissions

### Port Already in Use
- Change `PORT` in `.env` file
- Or kill the process using port 8005:
  ```bash
  lsof -ti:8005 | xargs kill
  ```

## 🔐 Security Notes

- Never commit `.env` file to version control
- Use environment variables for sensitive data
- Regularly rotate API keys
- Monitor database access logs
- Implement rate limiting in production

## 📝 License

Part of the NeuroNurture platform. See main repository for license information.

## 🤝 Contributing

When contributing to NuruAgent:
1. Follow the existing code structure
2. Maintain role-based access control
3. Keep responses to 5 sentences max
4. Add tests for new features
5. Update documentation

## 🎉 Your AI Agent is Ready!

NuruAgent is now fully operational and ready to help users with:
- Game information and guidance
- Progress tracking and analytics
- Role-specific assistance
- Database queries and insights
- Educational support
- Ticket classification and management

**Happy chatting!** 🤖✨

---

**NeuroNurture** - Empowering children with autism through technology and care.
