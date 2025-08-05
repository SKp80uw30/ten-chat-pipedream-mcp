# Railway Modular Deployment Plan

## Overview

Deploy the TEN Framework + MCP + Jitsi voice AI agent as a **modular, updateable system** on Railway with automatic latest version management and seamless inter-component integration.

## Architecture Design

### Multi-Service Railway Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Railway Project                          │
│  ten-chat-pipedream-mcp                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Frontend      │  │   MCP Server    │  │   Jitsi     │ │
│  │   Service       │  │   Service       │  │   Service   │ │
│  │                 │  │                 │  │             │ │
│  │ TEN Framework   │  │ Pipedream MCP   │  │ Jitsi Meet  │ │
│  │ Next.js App     │◄─┤ Protocol Server │  │ Self-hosted │ │
│  │ Voice Interface │  │ Workflow Tools  │  │ WebRTC      │ │
│  │                 │  │                 │  │             │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│           │                      │                 │       │
│           └──────────────────────┼─────────────────┘       │
│                                  │                         │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Shared Services                            │ │
│  │  • Doppler (Environment Variables)                     │ │
│  │  • PostgreSQL (Conversation History)                   │ │
│  │  • Redis (Session Management)                          │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Component Breakdown

#### 1. Frontend Service (TEN Framework Agent)
- **Purpose**: Main voice AI interface
- **Technology**: Next.js + TEN Framework
- **Updates**: TEN Framework git submodule (latest commit)
- **Port**: 3000 (Railway assigned)
- **Dependencies**: MCP Server, Jitsi Service

#### 2. MCP Server Service 
- **Purpose**: Model Context Protocol server for Pipedream workflows
- **Technology**: Node.js + @modelcontextprotocol/sdk:latest
- **Updates**: npm package latest versions
- **Port**: 8080 (Railway assigned) 
- **Dependencies**: Pipedream API

#### 3. Jitsi Service (Self-hosted)
- **Purpose**: WebRTC infrastructure (replaces Agora)
- **Technology**: Jitsi Meet Docker (latest)
- **Updates**: Docker image latest tag
- **Port**: 443/8443 (HTTPS required)
- **Dependencies**: None (standalone)

#### 4. Shared Services
- **PostgreSQL**: Conversation history and user data
- **Redis**: Session management and caching  
- **Doppler**: Environment variable management across all services

## Modular Deployment Strategy

### Phase 1: Service Separation

#### 1.1 Frontend Service Setup
```bash
# Create separate frontend service
railway service create frontend-service
railway link <frontend-service-id>

# Deploy TEN Framework playground
railway up --service frontend-service
```

#### 1.2 MCP Server Service Setup  
```bash
# Create MCP server service
railway service create mcp-server
railway link <mcp-server-id>

# Deploy MCP protocol server
railway up --service mcp-server
```

#### 1.3 Jitsi Service Setup
```bash
# Create Jitsi Meet service
railway service create jitsi-meet
railway link <jitsi-service-id>

# Deploy self-hosted Jitsi
railway up --service jitsi-meet
```

### Phase 2: Inter-Service Communication

#### Service Discovery Pattern
```javascript
// Frontend connects to MCP Server
const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 
  `https://${process.env.RAILWAY_SERVICE_NAME_MCP_SERVER}.railway.app`;

// Frontend connects to Jitsi
const JITSI_DOMAIN = process.env.JITSI_DOMAIN || 
  `${process.env.RAILWAY_SERVICE_NAME_JITSI_MEET}.railway.app`;
```

#### Environment Variable Sharing
All services use **Doppler project: `ten-chat-pipedream-mcp`** with service-specific configs:
- `frontend-prd` - Frontend service variables
- `mcp-server-prd` - MCP server variables  
- `jitsi-meet-prd` - Jitsi service variables
- `shared-prd` - Cross-service variables

### Phase 3: Latest Version Management

#### Automated Update Strategy
```yaml
# .github/workflows/update-dependencies.yml
name: Update Dependencies
on:
  schedule:
    - cron: '0 0 * * 1'  # Weekly on Monday
  workflow_dispatch:

jobs:
  update-ten-framework:
    runs-on: ubuntu-latest
    steps:
      - name: Update TEN Framework Submodule
        run: |
          git submodule update --remote ten-framework
          git commit -am "Update TEN Framework to latest"
          
  update-mcp-dependencies:
    runs-on: ubuntu-latest  
    steps:
      - name: Update MCP SDK
        run: |
          cd mcp-integration
          npm update @modelcontextprotocol/sdk
          git commit -am "Update MCP SDK to latest"
          
  update-jitsi-image:
    runs-on: ubuntu-latest
    steps:
      - name: Update Jitsi Docker Image
        run: |
          # Update Dockerfile to pull latest Jitsi image
          sed -i 's/jitsi\/web:.*/jitsi\/web:latest/' services/jitsi/Dockerfile
```

## Implementation Plan

### Step 1: Project Restructuring

#### 1.1 Create Service Directories
```
ten-chat-pipedream/
├── services/
│   ├── frontend/           # TEN Framework + Next.js
│   │   ├── Dockerfile
│   │   ├── railway.toml
│   │   └── src/           # Symlink to ten-framework/ai_agents/playground
│   ├── mcp-server/        # MCP Protocol Server
│   │   ├── Dockerfile
│   │   ├── railway.toml
│   │   └── src/           # MCP integration code
│   └── jitsi/             # Self-hosted Jitsi Meet
│       ├── Dockerfile
│       ├── railway.toml
│       └── config/        # Jitsi configuration
├── shared/
│   ├── doppler-configs/   # Environment configurations
│   └── scripts/           # Deployment scripts
└── docker-compose.yml     # Local development
```

#### 1.2 Service-Specific Dockerfiles

**Frontend Service Dockerfile:**
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy TEN Framework (latest via submodule)
COPY ten-framework/ai_agents/playground/ ./
RUN npm install && npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=builder /app ./

# Install Doppler CLI for env management
RUN curl -Ls https://cli.doppler.com/install.sh | sh

EXPOSE $PORT
CMD ["npm", "start", "--", "--hostname", "0.0.0.0", "--port", "$PORT"]
```

**MCP Server Dockerfile:**
```dockerfile  
FROM node:20-alpine

WORKDIR /app

# Always install latest MCP SDK
RUN npm init -y && npm install @modelcontextprotocol/sdk@latest

COPY mcp-integration/ ./
RUN npm install

# Install Doppler CLI
RUN curl -Ls https://cli.doppler.com/install.sh | sh

EXPOSE $PORT  
CMD ["node", "pipedream-client.js"]
```

**Jitsi Service Dockerfile:**
```dockerfile
FROM jitsi/web:latest

# Custom Jitsi configuration for TEN Framework integration
COPY config/interface_config.js /config/
COPY config/config.js /config/

# Ensure HTTPS and WebRTC compatibility
EXPOSE 443 8443 10000/udp

CMD ["/init"]
```

### Step 2: Railway Service Configuration

#### 2.1 Frontend Service Railway Config
```toml
# services/frontend/railway.toml
[build]
builder = "dockerfile"
dockerfilePath = "./Dockerfile"

[deploy]
restartPolicyType = "on-failure"
healthcheckPath = "/health"
healthcheckTimeout = 30

[env]
NODE_ENV = "production"
DOPPLER_PROJECT = "ten-chat-pipedream-mcp"
DOPPLER_CONFIG = "frontend-prd"
```

#### 2.2 MCP Server Railway Config
```toml
# services/mcp-server/railway.toml
[build]
builder = "dockerfile" 
dockerfilePath = "./Dockerfile"

[deploy]
restartPolicyType = "on-failure"

[env]
NODE_ENV = "production"
DOPPLER_PROJECT = "ten-chat-pipedream-mcp"
DOPPLER_CONFIG = "mcp-server-prd"
```

#### 2.3 Jitsi Service Railway Config
```toml
# services/jitsi/railway.toml
[build]
builder = "dockerfile"
dockerfilePath = "./Dockerfile"

[deploy]
restartPolicyType = "on-failure"

[env]
ENABLE_LETSENCRYPT = "1"
DOPPLER_PROJECT = "ten-chat-pipedream-mcp" 
DOPPLER_CONFIG = "jitsi-meet-prd"
```

### Step 3: Environment Variable Management

#### 3.1 Doppler Configuration Structure
```bash
# Create service-specific Doppler configs
doppler configs create frontend-prd --project ten-chat-pipedream-mcp
doppler configs create mcp-server-prd --project ten-chat-pipedream-mcp
doppler configs create jitsi-meet-prd --project ten-chat-pipedream-mcp
doppler configs create shared-prd --project ten-chat-pipedream-mcp

# Set service URLs for inter-communication
doppler secrets set MCP_SERVER_URL="https://mcp-server-production.railway.app" --project ten-chat-pipedream-mcp --config frontend-prd
doppler secrets set JITSI_DOMAIN="jitsi-meet-production.railway.app" --project ten-chat-pipedream-mcp --config frontend-prd
```

#### 3.2 Cross-Service Environment Variables
```bash
# Frontend Service Variables
OPENAI_API_KEY=<openai-key>
DEEPGRAM_API_KEY=<deepgram-key>
MCP_SERVER_URL=https://mcp-server-production.railway.app
JITSI_DOMAIN=jitsi-meet-production.railway.app
JITSI_ROOM_PREFIX=ten-agent

# MCP Server Variables  
PIPEDREAM_API_KEY=<pipedream-key>
PIPEDREAM_PROJECT_ID=<project-id>
OPENAI_API_KEY=<openai-key>

# Jitsi Service Variables
ENABLE_LETSENCRYPT=1
JITSI_WEB_CONFIG_resolution=720
JITSI_WEB_CONFIG_startWithAudioMuted=false
```

### Step 4: Service Integration Testing

#### 4.1 Health Check Endpoints

**Frontend Health Check:**
```javascript
// services/frontend/src/pages/api/health.js
export default function handler(req, res) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      mcp_server: process.env.MCP_SERVER_URL,
      jitsi_domain: process.env.JITSI_DOMAIN,
      ten_framework: 'loaded'
    }
  };
  res.status(200).json(health);
}
```

**MCP Server Health Check:**
```javascript
// services/mcp-server/src/health.js  
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    mcp_sdk_version: require('@modelcontextprotocol/sdk/package.json').version,
    pipedream_connected: !!process.env.PIPEDREAM_API_KEY
  });
});
```

#### 4.2 Integration Test Suite
```javascript
// tests/integration.test.js
describe('Service Integration', () => {
  test('Frontend connects to MCP Server', async () => {
    const response = await fetch(`${FRONTEND_URL}/api/mcp/test`);
    expect(response.status).toBe(200);
  });
  
  test('MCP Server executes Pipedream workflow', async () => {
    const response = await fetch(`${MCP_SERVER_URL}/execute-tool`, {
      method: 'POST',
      body: JSON.stringify({ tool: 'test-workflow', args: {} })
    });
    expect(response.status).toBe(200);
  });
  
  test('Jitsi Meet loads and accepts connections', async () => {
    const response = await fetch(`https://${JITSI_DOMAIN}/`);
    expect(response.status).toBe(200);
  });
});
```

### Step 5: Deployment Orchestration

#### 5.1 Deployment Script
```bash
#!/bin/bash
# deploy.sh - Deploy all services to Railway

set -e

echo "🚀 Starting modular deployment to Railway..."

# Update dependencies to latest versions
echo "📦 Updating dependencies..."
git submodule update --remote ten-framework
cd mcp-integration && npm update && cd ..

# Deploy services in dependency order
echo "🔧 Deploying MCP Server..."  
railway up --service mcp-server

echo "🎵 Deploying Jitsi Meet..."
railway up --service jitsi-meet  

echo "🖥️ Deploying Frontend..."
railway up --service frontend

# Wait for services to be healthy
echo "🏥 Checking service health..."
./scripts/health-check.sh

echo "✅ Deployment complete!"
echo "Frontend: https://frontend-production.railway.app"
echo "MCP Server: https://mcp-server-production.railway.app"  
echo "Jitsi Meet: https://jitsi-meet-production.railway.app"
```

#### 5.2 Health Check Script
```bash
#!/bin/bash
# scripts/health-check.sh

FRONTEND_URL="https://frontend-production.railway.app"
MCP_SERVER_URL="https://mcp-server-production.railway.app"
JITSI_URL="https://jitsi-meet-production.railway.app"

echo "Checking Frontend health..."
curl -f "$FRONTEND_URL/api/health" || exit 1

echo "Checking MCP Server health..."  
curl -f "$MCP_SERVER_URL/health" || exit 1

echo "Checking Jitsi Meet health..."
curl -f "$JITSI_URL/" || exit 1

echo "All services healthy! ✅"
```

### Step 6: Update Management

#### 6.1 Component Update Strategy

**TEN Framework Updates:**
```bash
# Update TEN Framework submodule
git submodule update --remote ten-framework
git add .gitmodules ten-framework
git commit -m "Update TEN Framework to latest commit"

# Redeploy frontend service  
railway up --service frontend
```

**MCP SDK Updates:**
```bash
# Update MCP dependencies
cd mcp-integration
npm update @modelcontextprotocol/sdk
git commit -am "Update MCP SDK to latest version"

# Redeploy MCP server
railway up --service mcp-server
```

**Jitsi Updates:**
```bash  
# Jitsi automatically uses :latest Docker tag
# Redeploy to pull latest image
railway up --service jitsi-meet
```

#### 6.2 Automated Update Monitoring
```javascript
// scripts/check-updates.js
const checkUpdates = async () => {
  // Check TEN Framework for new commits
  const tenLatest = await git.getLatestCommit('TEN-framework/ten-framework');
  const tenCurrent = await git.getCurrentCommit('ten-framework');
  
  // Check MCP SDK for new versions
  const mcpLatest = await npm.getLatestVersion('@modelcontextprotocol/sdk');
  const mcpCurrent = require('./mcp-integration/package.json').dependencies['@modelcontextprotocol/sdk'];
  
  // Check Jitsi Docker image for updates
  const jitsiLatest = await docker.getLatestTag('jitsi/web');
  
  return {
    ten_framework: { current: tenCurrent, latest: tenLatest, needs_update: tenCurrent !== tenLatest },
    mcp_sdk: { current: mcpCurrent, latest: mcpLatest, needs_update: mcpCurrent !== mcpLatest },
    jitsi: { latest: jitsiLatest, always_latest: true }
  };
};
```

## Success Criteria

### ✅ Deployment Checklist

**Infrastructure:**
- [ ] 3 Railway services created and configured
- [ ] Doppler environment variables configured for all services  
- [ ] Inter-service networking established
- [ ] Health checks passing for all services

**Functionality:**
- [ ] TEN Framework voice interface loads and responds
- [ ] MCP server connects to Pipedream and executes workflows
- [ ] Jitsi Meet provides WebRTC functionality
- [ ] All components integrate seamlessly

**Modularity:**
- [ ] Each service can be updated independently
- [ ] Latest versions automatically used (TEN submodule, MCP SDK, Jitsi Docker)
- [ ] Rolling updates don't break inter-service communication
- [ ] Rollback capability for each service

**Monitoring:**
- [ ] Health endpoints respond correctly
- [ ] Logs accessible via Railway dashboard
- [ ] Update notifications working
- [ ] Performance metrics collected

This plan ensures a robust, modular deployment where each component can be updated independently while maintaining system integrity and using the latest available versions.