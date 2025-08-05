// Health check endpoint for Frontend service
const express = require('express');
const app = express();

app.get('/api/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'frontend',
      ten_framework: 'loaded',
      services: {
        mcp_server: process.env.MCP_SERVER_URL || 'not configured',
        jitsi_domain: process.env.JITSI_DOMAIN || 'not configured'
      },
      environment: {
        node_env: process.env.NODE_ENV,
        port: process.env.PORT,
        doppler_project: process.env.DOPPLER_PROJECT,
        doppler_config: process.env.DOPPLER_CONFIG
      }
    };

    // Test MCP Server connectivity
    if (process.env.MCP_SERVER_URL) {
      try {
        const mcpResponse = await fetch(`${process.env.MCP_SERVER_URL}/health`, { 
          timeout: 5000 
        });
        health.services.mcp_server_status = mcpResponse.ok ? 'connected' : 'unreachable';
      } catch (error) {
        health.services.mcp_server_status = 'unreachable';
      }
    }

    res.status(200).json(health);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Only start server if this file is run directly (not imported)
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Frontend health server running on port ${port}`);
  });
}

module.exports = app;