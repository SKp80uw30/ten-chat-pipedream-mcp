# TEN Framework + MCP Railway Deployment Plan

## Project Overview
Create a conversational voice AI agent using TEN Framework with MCP (Model Context Protocol) integration, deployed on Railway for global accessibility via mobile devices.

## Prerequisites Checklist
- [ ] Docker Desktop installed and running
- [ ] Railway CLI installed (`npm install -g @railway/cli`)
- [ ] Doppler CLI installed (`curl -Ls https://cli.doppler.com/install.sh | sh`)
- [ ] Node.js (v18+) installed
- [ ] Git configured
- [ ] Railway account created
- [ ] Doppler account created

## Environment Variables Setup

### Create Doppler Project
```bash
# Install and login to Doppler
curl -Ls https://cli.doppler.com/install.sh | sh
doppler login

# Create the project
doppler projects create ten-chat-pipedream-mcp

# Create environments
doppler environments create dev --project ten-chat-pipedream-mcp
doppler environments create staging --project ten-chat-pipedream-mcp
doppler environments create production --project ten-chat-pipedream-mcp
```

## Required API Keys and Configuration
Set up these critical variables in your Doppler project `ten-chat-pipedream-mcp`:

### 🔴 CRITICAL Variables (Required for basic functionality)
- [ ] `AGORA_APP_ID` - Get from https://console.agora.io/
- [ ] `AGORA_APP_CERTIFICATE` - Get from https://console.agora.io/
- [ ] `OPENAI_API_KEY` - Get from https://platform.openai.com/api-keys (used for both LLM and TTS)
- [ ] `DEEPGRAM_API_KEY` - Get from https://console.deepgram.com/
- [ ] `PIPEDREAM_API_KEY` - Get from https://pipedream.com/settings/account
- [ ] `PIPEDREAM_PROJECT_ID` - Get from your Pipedream project dashboard

### 🟡 IMPORTANT Variables (Core functionality)
- [ ] `JWT_SECRET` - Generate with `openssl rand -base64 32`
- [ ] `MCP_SERVER_URL` - Will be set after Pipedream MCP deployment
- [ ] `NODE_ENV=production`
- [ ] `APP_NAME=ten-chat-pipedream-mcp`
- [ ] `OPENAI_TTS_MODEL=tts-1` - OpenAI TTS model (tts-1 or tts-1-hd)
- [ ] `OPENAI_TTS_VOICE=alloy` - OpenAI voice (alloy, echo, fable, onyx, nova, shimmer)

## Step 1: Repository Setup

### 1.1 Create Project Structure
```bash
mkdir ten-mcp-voice-agent
cd ten-mcp-voice-agent
git init
```

### 1.2 Fork and Clone TEN Framework
```bash
# Clone the TEN framework as a submodule or copy relevant parts
git submodule add https://github.com/TEN-framework/ten-framework.git
# Or manually copy the ai_agents directory for customization
```

### 1.3 Create Railway Configuration Files

#### railway.toml
```toml
[build]
builder = "dockerfile"
dockerfilePath = "./Dockerfile"

[deploy]
restartPolicyType = "on-failure"
```

#### Dockerfile
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy TEN Agent files
COPY ten-framework/ai_agents/ ./
COPY package*.json ./

# Install dependencies
RUN npm install

# Build the application
RUN npm run build

FROM node:18-alpine AS runtime

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    docker \
    curl

# Copy built application
COPY --from=builder /app ./

# Create environment script for Railway port configuration
COPY start.sh ./
RUN chmod +x start.sh

# Expose the port (Railway will set PORT env var)
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:$PORT/health || exit 1

# Start the application
CMD ["./start.sh"]
```

#### start.sh
```bash
#!/bin/sh

# Railway port configuration
export PORT=${PORT:-49483}

# Update TEN Agent configuration for Railway
sed -i "s/49483/$PORT/g" /app/playground/src/platform/web/env.ts
sed -i "s/localhost/0.0.0.0/g" /app/playground/src/platform/web/env.ts

# Doppler integration - load environment variables
if command -v doppler > /dev/null 2>&1; then
    echo "Loading environment variables from Doppler..."
    eval "$(doppler secrets download --no-file --format=export --project=ten-chat-pipedream-mcp --config=production)"
fi

# Set environment variables for TEN Agent (loaded from Doppler)
export AGORA_APP_ID=${AGORA_APP_ID}
export AGORA_APP_CERTIFICATE=${AGORA_APP_CERTIFICATE}
export OPENAI_API_KEY=${OPENAI_API_KEY}
export OPENAI_TTS_MODEL=${OPENAI_TTS_MODEL:-tts-1}
export OPENAI_TTS_VOICE=${OPENAI_TTS_VOICE:-alloy}
export DEEPGRAM_API_KEY=${DEEPGRAM_API_KEY}
export PIPEDREAM_API_KEY=${PIPEDREAM_API_KEY}
export PIPEDREAM_PROJECT_ID=${PIPEDREAM_PROJECT_ID}
export MCP_SERVER_URL=${MCP_SERVER_URL}
export JWT_SECRET=${JWT_SECRET}

# Validate required environment variables
required_vars=(
    "AGORA_APP_ID"
    "AGORA_APP_CERTIFICATE" 
    "OPENAI_API_KEY"
    "DEEPGRAM_API_KEY"
    "PIPEDREAM_API_KEY"
    "PIPEDREAM_PROJECT_ID"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if [ -z "$(eval echo \$var)" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables:"
    printf '%s\n' "${missing_vars[@]}"
    exit 1
fi

echo "✅ All required environment variables are set!"

# Start the TEN Agent playground
cd playground && npm start -- --host 0.0.0.0 --port $PORT
```

## Step 2: MCP Integration Setup

### 2.1 Create MCP Server Configuration
```bash
mkdir mcp-config
cd mcp-config
```

#### mcp-server.json
```json
{
  "mcpServers": {
    "pipedream": {
      "command": "node",
      "args": ["/app/mcp-integration/pipedream-client.js"],
      "env": {
        "PIPEDREAM_API_KEY": "${PIPEDREAM_API_KEY}",
        "PIPEDREAM_PROJECT_ID": "${PIPEDREAM_PROJECT_ID}"
      }
    }
  }
}
```

### 2.2 Create Pipedream MCP Client
```bash
mkdir mcp-integration
cd mcp-integration
npm init -y
npm install @modelcontextprotocol/sdk
```

#### pipedream-client.js
```javascript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

class PipedreamMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: "pipedream-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    
    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler('tools/list', async () => {
      // Dynamic tool discovery from Pipedream
      const tools = await this.fetchPipedreamTools();
      return { tools };
    });

    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;
      return await this.executePipedreamTool(name, args);
    });
  }

  async fetchPipedreamTools() {
    // Implement Pipedream API integration for dynamic tool discovery
    // Uses environment variables from Doppler project 'ten-chat-pipedream-mcp'
    const apiKey = process.env.PIPEDREAM_API_KEY;
    const projectId = process.env.PIPEDREAM_PROJECT_ID;
    
    if (!apiKey || !projectId) {
      console.error('Missing Pipedream configuration. Check Doppler project: ten-chat-pipedream-mcp');
      return [];
    }
    
    try {
      const response = await fetch(`https://api.pipedream.com/v1/projects/${projectId}/workflows`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Pipedream API error: ${response.status}`);
      }
      
      const workflows = await response.json();
      return workflows.map(workflow => ({
        name: workflow.name,
        description: workflow.description,
        inputSchema: workflow.inputSchema
      }));
    } catch (error) {
      console.error('Error fetching Pipedream tools:', error);
      return [];
    }
  }

  async executePipedreamTool(toolName, args) {
    // Execute Pipedream workflow via API
    const apiKey = process.env.PIPEDREAM_API_KEY;
    
    try {
      const response = await fetch(`https://api.pipedream.com/v1/workflows/${toolName}/execute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(args)
      });
      
      if (!response.ok) {
        throw new Error(`Tool execution failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error executing tool ${toolName}:`, error);
      return { error: error.message };
    }
  }

  async run() {
    console.log('Starting Pipedream MCP Server with Doppler configuration...');
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

const server = new PipedreamMCPServer();
server.run().catch(console.error);
```

## Step 3: TEN Agent Configuration

### 3.1 Modify TEN Agent for MCP Integration
Create file: `ten-agent-config.json`
```json
{
  "agent": {
    "name": "voice-mcp-agent",
    "version": "1.0.0"
  },
  "extensions": [
    {
      "name": "mcp_integration",
      "path": "/app/mcp-integration",
      "config": {
        "server_url": "${MCP_SERVER_URL}",
        "dynamic_loading": true
      }
    }
  ],
  "rtc": {
    "agora_app_id": "${AGORA_APP_ID}",
    "agora_app_certificate": "${AGORA_APP_CERTIFICATE}"
  },
  "llm": {
    "provider": "openai",
    "api_key": "${OPENAI_API_KEY}",
    "model": "gpt-4"
  },
  "asr": {
    "provider": "deepgram",
    "api_key": "${DEEPGRAM_API_KEY}"
  },
  "tts": {
    "provider": "openai",
    "api_key": "${OPENAI_API_KEY}",
    "model": "${OPENAI_TTS_MODEL}",
    "voice": "${OPENAI_TTS_VOICE}",
    "speed": 1.0,
    "response_format": "mp3"
  }
}
```

### 3.2 Create Custom TEN Extension for MCP
```bash
mkdir extensions/mcp_integration
cd extensions/mcp_integration
```

#### extension.py
```python
import asyncio
import json
from typing import Any, Dict
from ten import Extension, TenEnv, Cmd, StatusCode, CmdResult, Data

class MCPIntegrationExtension(Extension):
    def __init__(self, name: str):
        super().__init__(name)
        self.mcp_client = None

    async def on_init(self, ten_env: TenEnv) -> None:
        ten_env.log_debug("MCP Integration Extension initialized")
        # Initialize MCP client connection
        await self.init_mcp_client()

    async def init_mcp_client(self):
        # Initialize connection to MCP server
        # This will connect to your Pipedream MCP server
        pass

    async def on_cmd(self, ten_env: TenEnv, cmd: Cmd) -> None:
        cmd_name = cmd.get_name()
        
        if cmd_name == "execute_mcp_tool":
            await self.handle_mcp_tool_execution(ten_env, cmd)
        elif cmd_name == "list_mcp_tools":
            await self.handle_list_mcp_tools(ten_env, cmd)
        else:
            await ten_env.return_result(CmdResult.create(StatusCode.ERROR), cmd)

    async def handle_mcp_tool_execution(self, ten_env: TenEnv, cmd: Cmd):
        tool_name = cmd.get_property_string("tool_name")
        tool_args = cmd.get_property_string("tool_args")
        
        # Execute MCP tool via client
        result = await self.execute_mcp_tool(tool_name, json.loads(tool_args))
        
        # Return result to TEN Agent
        cmd_result = CmdResult.create(StatusCode.OK)
        cmd_result.set_property_string("result", json.dumps(result))
        await ten_env.return_result(cmd_result, cmd)

    async def handle_list_mcp_tools(self, ten_env: TenEnv, cmd: Cmd):
        # Get available tools from MCP server
        tools = await self.list_available_tools()
        
        cmd_result = CmdResult.create(StatusCode.OK)
        cmd_result.set_property_string("tools", json.dumps(tools))
        await ten_env.return_result(cmd_result, cmd)

    async def execute_mcp_tool(self, tool_name: str, args: Dict[str, Any]):
        # Implementation for executing MCP tools
        # This interfaces with your Pipedream workflows
        pass

    async def list_available_tools(self):
        # Implementation for listing available MCP tools
        pass
```

## Step 4: Package.json Configuration
```json
{
  "name": "ten-mcp-voice-agent",
  "version": "1.0.0",
  "description": "Voice AI agent with MCP integration for Railway deployment",
  "main": "index.js",
  "scripts": {
    "start": "node playground/src/index.js",
    "build": "npm install && npm run build-playground",
    "build-playground": "cd playground && npm install && npm run build",
    "dev": "cd playground && npm run dev",
    "railway:deploy": "railway up"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.4.0",
    "express": "^4.18.2",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## Step 5: Railway Deployment with Doppler Integration

### 5.1 Set Up Doppler Variables
```bash
# Switch to production environment
doppler setup --project ten-chat-pipedream-mcp --config production

# Set all critical variables in Doppler
doppler secrets set AGORA_APP_ID="your_agora_app_id"
doppler secrets set AGORA_APP_CERTIFICATE="your_agora_certificate"
doppler secrets set OPENAI_API_KEY="your_openai_key"
doppler secrets set DEEPGRAM_API_KEY="your_deepgram_key"
doppler secrets set PIPEDREAM_API_KEY="your_pipedream_key"
doppler secrets set PIPEDREAM_PROJECT_ID="your_pipedream_project_id"

# Set OpenAI TTS configuration
doppler secrets set OPENAI_TTS_MODEL="tts-1"
doppler secrets set OPENAI_TTS_VOICE="alloy"

# Set application configuration
doppler secrets set NODE_ENV="production"
doppler secrets set APP_NAME="ten-chat-pipedream-mcp"
doppler secrets set JWT_SECRET="$(openssl rand -base64 32)"

# Set optional MCP configuration
doppler secrets set MCP_SERVER_URL="https://your-mcp-server.railway.app"
doppler secrets set MCP_SERVER_TIMEOUT="30000"

# Verify all variables are set
doppler secrets
```

### 5.2 Login and Initialize Railway
```bash
railway login
railway init --name ten-chat-pipedream-mcp
```

### 5.3 Connect Doppler to Railway
```bash
# Option 1: Use Railway's Doppler Integration (Recommended)
# 1. Go to your Railway project dashboard
# 2. Navigate to "Variables" tab
# 3. Click "Raw Editor" and then "Connect Integrations"
# 4. Select "Doppler" and authenticate
# 5. Select project: ten-chat-pipedream-mcp
# 6. Select environment: production
# 7. Click "Connect" - all variables will sync automatically

# Option 2: Manual sync (if integration not available)
railway variables set $(doppler secrets download --no-file --format=docker --project=ten-chat-pipedream-mcp --config=production)
```

### 5.4 Verify Environment Variables in Railway
```bash
# Check that variables are properly loaded
railway variables

# Should show all variables from your Doppler project including:
# - AGORA_APP_ID
# - AGORA_APP_CERTIFICATE  
# - OPENAI_API_KEY
# - OPENAI_TTS_MODEL
# - OPENAI_TTS_VOICE
# - DEEPGRAM_API_KEY
# - PIPEDREAM_API_KEY
# - PIPEDREAM_PROJECT_ID
# - JWT_SECRET
# - NODE_ENV
# - APP_NAME
```

### 5.5 Deploy to Railway
```bash
# Deploy the application
railway up

# Generate public domain
railway domain

# Monitor deployment logs
railway logs --follow

# Check deployment status
railway status
```

## Step 6: Mobile Access Setup

### 6.1 PWA Configuration
Create `public/manifest.json`:
```json
{
  "name": "Voice AI Agent",
  "short_name": "VoiceAI",
  "description": "AI Voice Assistant with MCP Integration",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

### 6.2 Service Worker for Offline Capability
Create `public/sw.js`:
```javascript
const CACHE_NAME = 'voice-ai-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll([
        '/',
        '/static/js/bundle.js',
        '/static/css/main.css'
      ]))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

## Step 7: Testing and Validation

### 7.1 Local Testing
```bash
# Test locally before deployment
docker build -t ten-mcp-agent .
docker run -p 8080:8080 --env-file .env ten-mcp-agent
```

### 7.2 Deployment Validation
```bash
# After railway deployment
curl https://your-app.railway.app/health

# Validate Doppler integration
railway run --service your-service-name doppler secrets --project ten-chat-pipedream-mcp

# Check environment variables are loaded
railway logs --follow | grep "environment variables"
```

### 7.3 Doppler Configuration Validation
```bash
# Verify Doppler project setup
doppler projects --scope ten-chat-pipedream-mcp

# Check all required secrets are set
doppler secrets --project ten-chat-pipedream-mcp --config production

# Test Doppler CLI integration
doppler run --project ten-chat-pipedream-mcp --config production -- env | grep -E "(AGORA|OPENAI|DEEPGRAM|PIPEDREAM)"
```

### 7.3 Mobile Testing Checklist
- [ ] Web interface loads on mobile browser
- [ ] Voice recording works on mobile
- [ ] MCP tools execute successfully
- [ ] PWA can be installed on mobile
- [ ] Offline functionality works

## Step 8: Monitoring and Maintenance

### 8.1 Railway Monitoring
- Monitor logs: `railway logs --follow`
- Check metrics in Railway dashboard
- Set up alerts for errors

### 8.2 Health Checks
Implement health check endpoint in your application:
```javascript
app.get('/health', (req, res) => {
  // Check if all critical environment variables from Doppler are loaded
  const requiredEnvVars = [
    'AGORA_APP_ID',
    'AGORA_APP_CERTIFICATE',
    'OPENAI_API_KEY', 
    'DEEPGRAM_API_KEY',
    'PIPEDREAM_API_KEY',
    'PIPEDREAM_PROJECT_ID'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    doppler_project: 'ten-chat-pipedream-mcp',
    environment_check: {
      missing_variables: missingVars,
      all_variables_loaded: missingVars.length === 0
    },
    mcp_connected: mcpClient?.isConnected() || false,
    services: {
      agora: !!process.env.AGORA_APP_ID,
      openai: !!process.env.OPENAI_API_KEY,
      deepgram: !!process.env.DEEPGRAM_API_KEY,
      elevenlabs: !!process.env.ELEVENLABS_API_KEY,
      pipedream: !!process.env.PIPEDREAM_API_KEY
    }
  });
});
```

### 8.3 Doppler Secret Rotation
```bash
# Rotate API keys safely
doppler secrets set OPENAI_API_KEY="new_key_value" --project ten-chat-pipedream-mcp --config production

# Railway will automatically sync the new values if Doppler integration is enabled
# Or manually trigger sync:
railway redeploy
```

## Troubleshooting Guide

### Common Issues:
1. **Port binding errors**: Ensure PORT environment variable is used
2. **API key issues**: Verify all keys are set in Doppler project `ten-chat-pipedream-mcp`
3. **Docker build failures**: Check Dockerfile syntax and dependencies
4. **MCP connection issues**: Verify Pipedream server configuration
5. **Mobile audio issues**: Ensure HTTPS is enabled for microphone access
6. **Doppler integration issues**: Check Railway-Doppler connection in dashboard
7. **Environment variable sync**: Verify Doppler CLI and Railway integration

### Debug Commands:
```bash
# Check Railway logs
railway logs --follow

# Verify Doppler variables are loaded
railway run env | grep -E "(AGORA|OPENAI|DEEPGRAM|PIPEDREAM)"

# Test Doppler connection locally
doppler run --project ten-chat-pipedream-mcp --config production -- node -e "console.log('AGORA_APP_ID:', process.env.AGORA_APP_ID ? 'SET' : 'NOT SET')"

# SSH into Railway container (if needed)
railway shell

# Local debugging
docker logs container_name

# Check Doppler project status
doppler projects get ten-chat-pipedream-mcp

# Validate all required secrets
doppler secrets --project ten-chat-pipedream-mcp --config production | grep -E "(AGORA|OPENAI|DEEPGRAM|PIPEDREAM)"
```

### Doppler-Specific Troubleshooting:
```bash
# Reset Doppler CLI if authentication issues
doppler logout
doppler login

# Re-sync variables to Railway
railway variables set $(doppler secrets download --no-file --format=docker --project=ten-chat-pipedream-mcp --config=production)

# Check Doppler integration status in Railway dashboard
# Go to Variables → Integrations → Doppler (should show "Connected")
```

## Success Criteria
- [ ] Doppler project `ten-chat-pipedream-mcp` created with all required variables
- [ ] Railway-Doppler integration successfully connected
- [ ] TEN Agent deploys successfully on Railway
- [ ] Public HTTPS URL is accessible
- [ ] Voice conversation works from mobile browser
- [ ] MCP tools integrate with Pipedream workflows
- [ ] All environment variables load correctly from Doppler
- [ ] Application scales automatically with traffic
- [ ] Health checks pass consistently
- [ ] Environment variable rotation works seamlessly

## Next Steps After Implementation
1. Set up custom domain
2. Implement user authentication
3. Add conversation history storage
4. Optimize for mobile performance
5. Add more MCP integrations
6. Implement usage analytics