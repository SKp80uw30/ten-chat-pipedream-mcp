# Railway Modular Deployment - Execution Plan

## 🎯 Objective
Deploy TEN Framework voice AI agent as a **modular, updateable system** on Railway with automatic latest version management and seamless component integration.

## 🏗️ Architecture Overview

### Three-Service Railway Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                Railway Project: ten-chat-pipedream-mcp       │
├─────────────────────────────────────────────────────────────┤
│  Frontend Service  │  MCP Server Service  │  Jitsi Service  │
│                    │                      │                 │
│  TEN Framework     │  Pipedream MCP       │  Self-hosted    │
│  Next.js           │  Protocol Server     │  WebRTC         │
│  Voice Interface   │  Workflow Tools      │  (Free Agora    │
│                    │                      │   replacement)  │
└─────────────────────────────────────────────────────────────┘
```

## ✅ Ready-to-Execute Steps

### Phase 1: Environment Setup (15 minutes)

#### Step 1.1: Verify Prerequisites
```bash
# Check CLI tools
railway --version
doppler --version  
git --version
node --version  # Should be >= 20

# Authenticate
railway login
doppler login

# Verify Railway authentication
railway whoami
```

#### Step 1.2: Configure API Keys in Doppler
```bash
# Set up Doppler project and environments
./shared/doppler-configs/setup-doppler.sh

# Add your real API keys (replace placeholders)
doppler secrets set OPENAI_API_KEY="sk-your-real-key" --project ten-chat-pipedream-mcp --config frontend-prd
doppler secrets set DEEPGRAM_API_KEY="your-real-key" --project ten-chat-pipedream-mcp --config frontend-prd
doppler secrets set PIPEDREAM_API_KEY="your-real-key" --project ten-chat-pipedream-mcp --config mcp-server-prd
doppler secrets set PIPEDREAM_PROJECT_ID="your-real-id" --project ten-chat-pipedream-mcp --config mcp-server-prd

# Verify secrets are set
doppler secrets --project ten-chat-pipedream-mcp --config frontend-prd
```

### Phase 2: Local Testing (10 minutes)

#### Step 2.1: Test Locally with Docker Compose
```bash
# Build and start all services locally
npm run dev

# In another terminal, run health checks
npm run health

# View logs
npm run dev:logs

# Test integration
npm test

# Clean up
npm run dev:stop
```

### Phase 3: Railway Deployment (20 minutes)

#### Step 3.1: Deploy All Services
```bash
# One-command deployment of all services
./shared/scripts/deploy.sh

# Or skip confirmation for automated deployment
./shared/scripts/deploy.sh --skip-confirmation
```

**What this script does:**
1. ✅ Updates TEN Framework to latest commit
2. ✅ Updates MCP SDK to latest version  
3. ✅ Creates Railway services (mcp-server, jitsi, frontend)
4. ✅ Deploys in dependency order
5. ✅ Updates service URLs in Doppler
6. ✅ Runs comprehensive health checks
7. ✅ Provides final service URLs

#### Step 3.2: Verify Deployment
```bash
# Manual health check after deployment
./shared/scripts/health-check.sh

# Check Railway logs
npm run railway:logs

# View individual service logs  
railway logs --service frontend --follow
railway logs --service mcp-server --follow
railway logs --service jitsi --follow
```

### Phase 4: Validation & Testing (10 minutes)

#### Step 4.1: Test Complete Integration
1. **Frontend**: Open the provided Railway URL
2. **Voice Interface**: Test microphone and TEN Framework voice interaction
3. **MCP Tools**: Verify Pipedream workflow execution
4. **Jitsi WebRTC**: Test audio/video functionality
5. **Mobile PWA**: Install and test on mobile device

#### Step 4.2: Performance Validation
```bash
# Run integration tests against live services
FRONTEND_URL="https://your-frontend.railway.app" \
MCP_SERVER_URL="https://your-mcp-server.railway.app" \
JITSI_DOMAIN="your-jitsi.railway.app" \
npm test
```

## 🔄 Automated Update System

### Weekly Dependency Updates
The GitHub workflow (`.github/workflows/update-dependencies.yml`) automatically:
- Updates TEN Framework submodule to latest commit
- Updates MCP SDK to latest npm version
- Updates Jitsi to latest Docker image (on next deployment)
- Creates GitHub issues for manual review and deployment

### Manual Updates
```bash
# Update all dependencies manually
./shared/scripts/update-dependencies.sh

# Deploy updated dependencies
./shared/scripts/deploy.sh
```

## 📊 Success Criteria Checklist

### ✅ Infrastructure
- [ ] All 3 Railway services created and healthy
- [ ] Doppler environment variables configured for each service
- [ ] Inter-service communication working
- [ ] Health checks passing for all services

### ✅ Functionality  
- [ ] TEN Framework voice interface loads and responds
- [ ] MCP server connects to Pipedream and executes workflows
- [ ] Jitsi Meet provides WebRTC without Agora dependencies
- [ ] All components integrate seamlessly

### ✅ Modularity
- [ ] Each service can be updated independently  
- [ ] Latest versions automatically used (TEN, MCP SDK, Jitsi)
- [ ] Rolling updates don't break inter-service communication
- [ ] Rollback capability for each service

### ✅ Monitoring
- [ ] Health endpoints respond correctly
- [ ] Logs accessible via Railway dashboard
- [ ] Update notifications working via GitHub issues
- [ ] Performance metrics collected

## 🚀 Quick Start Commands

```bash
# Complete setup and deployment (one command)
./shared/scripts/deploy.sh

# Local development
npm run dev

# Health monitoring
npm run health

# Dependency updates
npm run update

# View logs
npm run railway:logs
```

## 🛠️ Service URLs (After Deployment)

| Service | URL Pattern | Purpose |
|---------|-------------|---------|
| Frontend | `https://frontend-production.railway.app` | Main voice AI interface |
| MCP Server | `https://mcp-server-production.railway.app` | Pipedream workflow execution |
| Jitsi Meet | `https://jitsi-meet-production.railway.app` | WebRTC communication |

## 🔧 Troubleshooting

### Common Issues & Solutions

**Service not starting:**
```bash
railway logs --service <service-name>
doppler secrets --project ten-chat-pipedream-mcp --config <service>-prd
```

**Environment variables missing:**
```bash
./shared/doppler-configs/setup-doppler.sh
doppler secrets set KEY="value" --project ten-chat-pipedream-mcp --config <service>-prd
```

**Inter-service communication failing:**
```bash
./shared/scripts/health-check.sh
# Check service URLs in Doppler configuration
```

**Dependencies out of date:**
```bash
./shared/scripts/update-dependencies.sh
./shared/scripts/deploy.sh
```

## 🎉 Expected Outcome

After successful execution:

1. **Production-Ready System**: Voice AI agent running on Railway with professional-grade infrastructure
2. **Cost-Effective**: No expensive Agora fees - using free Jitsi Meet WebRTC
3. **Modular & Maintainable**: Each component can be updated independently
4. **Auto-Updating**: Latest versions of all dependencies automatically managed
5. **Mobile-Optimized**: PWA installable on mobile devices
6. **Scalable**: Railway auto-scaling with traffic

## 📋 Next Steps After Deployment

1. **Custom Domain**: Set up custom domain in Railway dashboard
2. **Advanced Features**: Add conversation history, user authentication
3. **Monitoring**: Set up advanced monitoring and alerting
4. **Self-Hosted Jitsi**: Deploy own Jitsi instance for complete control
5. **Advanced MCP**: Add more Pipedream workflows and MCP tools

---

**Total Deployment Time: ~45 minutes**
**Maintenance Time: ~5 minutes/week (automated)**
**Cost: Railway usage only (no external API fees)**