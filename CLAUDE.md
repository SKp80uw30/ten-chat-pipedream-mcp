# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **voice AI agent** built with the TEN Framework, integrated with MCP (Model Context Protocol) for Pipedream workflow automation, and deployed on Railway. The project replaces expensive Agora WebRTC services with free, open-source **Jitsi Meet** for voice/video communication.

### Core Architecture

**Three-Layer Architecture:**
1. **TEN Framework Agent** (`ten-framework/` submodule) - Core voice AI engine with extensions
2. **MCP Integration** (`mcp-integration/`) - Model Context Protocol client for Pipedream workflows  
3. **Railway Deployment** (`Dockerfile`, `railway.toml`) - Cloud deployment with Doppler env management

**Key Components:**
- **Playground** (`ten-framework/ai_agents/playground/`) - Next.js frontend for voice interaction
- **Agent Configuration** (`ten-agent-config.json`) - Defines LLM, ASR, TTS, and RTC providers
- **MCP Client** (`mcp-integration/pipedream-client.js`) - Connects to Pipedream workflows via MCP
- **Jitsi Integration** (`jitsi-integration/`) - WebRTC components replacing Agora

## Common Commands

### Development
```bash
# Start development server (playground frontend)
npm run dev

# Build entire project (playground + MCP integration)
npm run build

# Start production server 
npm start
```

### TEN Framework Playground
```bash
cd ten-framework/ai_agents/playground
npm run dev          # Development with Turbopack
npm run build        # Production build
npm run lint         # ESLint validation
npm run proto        # Generate protobuf files
```

### Railway Deployment
```bash
railway login                    # Authenticate
railway init --name <project>    # Initialize project
railway up                       # Deploy
railway logs --follow           # Monitor logs
railway variables               # View environment variables
```

### Doppler Environment Management
```bash
doppler login
doppler secrets --project ten-chat-pipedream-mcp --config prd    # View secrets
doppler secrets set KEY="value" --project ten-chat-pipedream-mcp --config prd
doppler run --project ten-chat-pipedream-mcp --config prd -- <command>
```

## Environment Variables

**Critical Variables (Required):**
- `OPENAI_API_KEY` - OpenAI for LLM, TTS, and ASR (Whisper)
- `PIPEDREAM_API_KEY` - Workflow automation
- `PIPEDREAM_PROJECT_ID` - Pipedream project identifier

**Jitsi Configuration:**
- `JITSI_DOMAIN` - Jitsi server domain (default: "meet.jit.si")
- `JITSI_ROOM_PREFIX` - Room name prefix (default: "ten-agent")

**Application:**
- `NODE_ENV` - Environment (production/development)
- `JWT_SECRET` - Authentication secret
- `MCP_SERVER_URL` - MCP server endpoint

All environment variables are managed through **Doppler project: `ten-chat-pipedream-mcp`**

## TEN Framework Integration

### Agent Configuration Pattern
The `ten-agent-config.json` defines the agent's capabilities:
- **LLM Provider**: OpenAI GPT-4 for conversation
- **ASR Provider**: OpenAI Whisper for speech-to-text
- **TTS Provider**: OpenAI for text-to-speech  
- **RTC Provider**: Jitsi Meet for WebRTC (replaced Agora)
- **Extensions**: MCP integration for workflow tools

### Extension System
Extensions are located in `ten-framework/ai_agents/agents/ten_packages/extension/`. Custom extensions:
- **MCP Integration** (`extensions/mcp_integration/extension.py`) - Connects to Pipedream workflows
- Each extension has `manifest.json`, `property.json`, and implementation files

## MCP (Model Context Protocol) Integration

### Architecture Flow
1. **TEN Agent** receives voice input → processes with LLM
2. **LLM** decides to use tools → calls MCP client
3. **MCP Client** (`mcp-integration/pipedream-client.js`) → executes Pipedream workflow
4. **Results** flow back through MCP → LLM → TTS → voice output

### Key Files
- `mcp-config/mcp-server.json` - MCP server configuration
- `mcp-integration/pipedream-client.js` - MCP server implementation
- `mcp-integration/package.json` - MCP SDK dependencies

## Jitsi Meet Integration (Replaces Agora)

### Why Jitsi Over Agora
- **Free & Open Source** - No API keys or subscription costs
- **Self-hostable** - Complete control over infrastructure
- **WebRTC Compatible** - Same underlying technology as Agora

### Integration Components
- `jitsi-integration/JitsiMeetComponent.jsx` - React component for embedding
- `jitsi-integration/jitsi-service.js` - Service class for programmatic control
- See `JITSI_MIGRATION.md` for detailed migration information

### Usage Pattern
```javascript
import JitsiMeetService from './jitsi-integration/jitsi-service';

const jitsi = new JitsiMeetService('meet.jit.si');
await jitsi.initialize('room-name', containerElement);
jitsi.toggleAudio();
jitsi.sendChatMessage('Hello from TEN Agent!');
```

## Deployment Architecture

### Railway + Doppler Pattern
- **Railway** handles container deployment and HTTPS termination
- **Doppler** manages all environment variables and secrets
- **Docker** builds unified container with TEN Framework + MCP + Jitsi

### Build Process
1. `Dockerfile` copies TEN Framework playground
2. Installs MCP integration dependencies  
3. `start.sh` loads Doppler secrets and validates environment
4. Starts Next.js playground server on Railway-provided port

### Port Configuration
Railway dynamically assigns `PORT` environment variable. The application:
- Defaults to port 49483 for local development
- Uses `${PORT}` in production (set by Railway)
- Binds to `0.0.0.0` for container accessibility

## PWA (Progressive Web App) Support

Mobile-first design with PWA capabilities:
- `public/manifest.json` - App manifest for installation
- `public/sw.js` - Service worker for offline functionality
- Optimized for mobile voice interaction

## Key Patterns to Follow

### Environment Variable Loading
Always use Doppler for secrets management:
```bash
# In start.sh
eval "$(doppler secrets download --no-file --format=export --project=ten-chat-pipedream-mcp --config=prd)"
```

### Error Handling for Required Services
Validate critical environment variables before startup (see `start.sh` validation pattern).

### TEN Framework Extension Development
Follow TEN's extension pattern with `manifest.json`, `property.json`, and proper addon structure.

### MCP Tool Registration
Tools are dynamically discovered from Pipedream API and registered with the MCP server.

## Important Files to Understand

- `ten_mcp_railway_plan.md` - Complete deployment strategy and architecture decisions
- `JITSI_MIGRATION.md` - WebRTC migration from Agora to Jitsi Meet
- `doppler_env_variables.md` - Comprehensive environment variable documentation
- `ten-agent-config.json` - Agent capability and provider configuration
- `start.sh` - Production startup script with environment validation