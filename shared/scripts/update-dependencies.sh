#!/bin/bash

set -e

echo "🔄 Updating dependencies to latest versions..."

# Update TEN Framework submodule to latest
echo "Updating TEN Framework submodule..."
git submodule update --remote ten-framework
git add ten-framework
if ! git diff --cached --quiet; then
    git commit -m "Update TEN Framework to latest commit

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
    echo "✅ TEN Framework updated to latest commit"
else
    echo "ℹ️ TEN Framework already at latest commit"
fi

# Update Pipedream MCP submodule if it exists
if [ -d "pipedream-mcp-reference" ]; then
    echo "Updating Pipedream MCP reference..."
    git submodule update --remote pipedream-mcp-reference
    git add pipedream-mcp-reference
    if ! git diff --cached --quiet; then
        git commit -m "Update Pipedream MCP reference to latest

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
        echo "✅ Pipedream MCP reference updated to latest commit"
    else
        echo "ℹ️ Pipedream MCP reference already at latest commit"
    fi
fi

# Update MCP integration dependencies
echo "Updating MCP integration dependencies..."
cd mcp-integration
npm update @modelcontextprotocol/sdk
npm audit fix --force || echo "Note: Some vulnerabilities may require manual review"
cd ..

# Check if dependencies were updated
if ! git diff --quiet mcp-integration/package.json mcp-integration/package-lock.json; then
    git add mcp-integration/package.json mcp-integration/package-lock.json
    git commit -m "Update MCP SDK and dependencies to latest versions

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
    echo "✅ MCP SDK updated to latest version"
else
    echo "ℹ️ MCP SDK already at latest version"
fi

# Update Jitsi integration dependencies (if any)
if [ -d "jitsi-integration" ]; then
    echo "Checking Jitsi integration for updates..."
    # Jitsi uses Docker latest tag, so no npm updates needed
    echo "ℹ️ Jitsi uses Docker :latest tag - will update on next deployment"
fi

# Generate update report
echo ""
echo "📊 Update Report:"
echo "=================="

# Check TEN Framework version
TEN_COMMIT=$(cd ten-framework && git rev-parse --short HEAD)
echo "TEN Framework: commit $TEN_COMMIT"

# Check MCP SDK version
MCP_VERSION=$(cd mcp-integration && npm list @modelcontextprotocol/sdk --depth=0 | grep @modelcontextprotocol/sdk | awk '{print $2}' | sed 's/@//')
echo "MCP SDK: version $MCP_VERSION"

# Check Node.js version in Dockerfiles
FRONTEND_NODE=$(grep "FROM node:" services/frontend/Dockerfile | head -1 | cut -d: -f2 | cut -d- -f1)
MCP_NODE=$(grep "FROM node:" services/mcp-server/Dockerfile | head -1 | cut -d: -f2 | cut -d- -f1)
echo "Frontend Node.js: $FRONTEND_NODE"
echo "MCP Server Node.js: $MCP_NODE"

# Check Jitsi version
JITSI_TAG=$(grep "FROM jitsi/web:" services/jitsi/Dockerfile | cut -d: -f2)
echo "Jitsi Meet: tag $JITSI_TAG"

echo ""
echo "✅ Dependency update complete!"
echo ""
echo "Next steps:"
echo "1. Test locally: docker-compose up"
echo "2. Deploy to Railway: ./shared/scripts/deploy.sh"
echo "3. Verify all services: ./shared/scripts/health-check.sh"