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