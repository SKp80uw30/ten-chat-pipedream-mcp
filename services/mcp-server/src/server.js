const express = require('express');
const cors = require('cors');
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  const packageJson = require('@modelcontextprotocol/sdk/package.json');
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'mcp-server',
    mcp_sdk_version: packageJson.version,
    pipedream_configured: !!process.env.PIPEDREAM_API_KEY,
    environment: {
      node_env: process.env.NODE_ENV,
      port: process.env.PORT,
      doppler_project: process.env.DOPPLER_PROJECT,
      doppler_config: process.env.DOPPLER_CONFIG
    },
    pipedream: {
      api_key_configured: !!process.env.PIPEDREAM_API_KEY,
      project_id_configured: !!process.env.PIPEDREAM_PROJECT_ID
    }
  });
});

// MCP Server instance
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
      const tools = await this.fetchPipedreamTools();
      return { tools };
    });

    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;
      return await this.executePipedreamTool(name, args);
    });
  }

  async fetchPipedreamTools() {
    const apiKey = process.env.PIPEDREAM_API_KEY;
    const projectId = process.env.PIPEDREAM_PROJECT_ID;
    
    if (!apiKey || !projectId) {
      console.error('Missing Pipedream configuration');
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
        inputSchema: workflow.inputSchema || {}
      }));
    } catch (error) {
      console.error('Error fetching Pipedream tools:', error);
      return [];
    }
  }

  async executePipedreamTool(toolName, args) {
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

  async startStdioServer() {
    console.log('Starting Pipedream MCP Server...');
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// API endpoints for HTTP access
app.post('/execute-tool', async (req, res) => {
  const { tool, args } = req.body;
  
  try {
    const mcpServer = new PipedreamMCPServer();
    const result = await mcpServer.executePipedreamTool(tool, args);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/tools', async (req, res) => {
  try {
    const mcpServer = new PipedreamMCPServer();
    const tools = await mcpServer.fetchPipedreamTools();
    res.json({ tools });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start HTTP server
app.listen(port, '0.0.0.0', () => {
  console.log(`MCP Server HTTP interface running on port ${port}`);
});

// Also start MCP stdio server for direct MCP protocol access
const mcpServer = new PipedreamMCPServer();
if (process.env.ENABLE_MCP_STDIO !== 'false') {
  mcpServer.startStdioServer().catch(console.error);
}