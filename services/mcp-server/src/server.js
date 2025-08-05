const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'mcp-server',
    environment: {
      node_env: process.env.NODE_ENV,
      port: process.env.PORT
    },
    pipedream: {
      api_key_configured: !!process.env.PIPEDREAM_API_KEY,
      project_id_configured: !!process.env.PIPEDREAM_PROJECT_ID
    }
  });
});

// Basic tools endpoint for testing
app.get('/tools', async (req, res) => {
  try {
    res.json({ 
      tools: [
        {
          name: 'test-tool',
          description: 'Basic test tool for MCP server',
          inputSchema: {}
        }
      ] 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test execution endpoint
app.post('/execute-tool', async (req, res) => {
  const { tool, args } = req.body;
  
  try {
    res.json({
      result: `Executed ${tool} with args: ${JSON.stringify(args)}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start HTTP server
app.listen(port, '0.0.0.0', () => {
  console.log(`MCP Server running on port ${port}`);
  console.log('Environment variables:');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- PIPEDREAM_API_KEY configured:', !!process.env.PIPEDREAM_API_KEY);
  console.log('- PIPEDREAM_PROJECT_ID configured:', !!process.env.PIPEDREAM_PROJECT_ID);
});