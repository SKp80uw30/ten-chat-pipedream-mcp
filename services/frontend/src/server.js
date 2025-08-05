const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'frontend',
    environment: {
      node_env: process.env.NODE_ENV,
      port: process.env.PORT
    },
    services: {
      mcp_server_url: process.env.MCP_SERVER_URL || 'Not configured',
      jitsi_domain: process.env.JITSI_DOMAIN || 'meet.jit.si'
    }
  });
});

// Basic frontend placeholder
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>TEN Framework Voice AI Agent</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .status { padding: 10px; border-radius: 4px; margin: 10px 0; }
            .healthy { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
            .pending { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
            h1 { color: #333; }
            .service-list { list-style: none; padding: 0; }
            .service-list li { padding: 8px; margin: 4px 0; background: #f8f9fa; border-radius: 4px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎤 TEN Framework Voice AI Agent</h1>
            <div class="status healthy">✅ Frontend Service Running</div>
            
            <h2>Architecture</h2>
            <p>Modular deployment with separate Railway services:</p>
            <ul class="service-list">
                <li><strong>Frontend Service</strong> - This interface (Port: ${port})</li>
                <li><strong>MCP Server</strong> - Model Context Protocol integration</li>
                <li><strong>Jitsi Service</strong> - WebRTC voice/video communication</li>
            </ul>
            
            <h2>Integration Status</h2>
            <div class="status pending">⏳ MCP Server: ${process.env.MCP_SERVER_URL || 'Connecting...'}</div>
            <div class="status pending">⏳ Jitsi Domain: ${process.env.JITSI_DOMAIN || 'meet.jit.si'}</div>
            
            <h2>Features</h2>
            <ul>
                <li>✅ OpenAI GPT-4 conversation</li>
                <li>✅ OpenAI Whisper speech-to-text</li>
                <li>✅ OpenAI TTS text-to-speech</li>
                <li>✅ Jitsi Meet WebRTC (free alternative to Agora)</li>
                <li>✅ Pipedream workflow automation via MCP</li>
            </ul>
            
            <p><a href="/health">Health Check</a> | <a href="https://github.com/SKp80uw30/ten-chat-pipedream-mcp">GitHub Repository</a></p>
        </div>
    </body>
    </html>
  `);
});

// Service endpoints placeholder
app.get('/api/services', (req, res) => {
  res.json({
    frontend: {
      status: 'running',
      url: `http://localhost:${port}`
    },
    mcp_server: {
      status: 'connecting',
      url: process.env.MCP_SERVER_URL || null
    },
    jitsi: {
      status: 'ready',
      domain: process.env.JITSI_DOMAIN || 'meet.jit.si'
    }
  });
});

// Start HTTP server
app.listen(port, '0.0.0.0', () => {
  console.log(`Frontend service running on port ${port}`);
  console.log('Environment variables:');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- MCP_SERVER_URL:', process.env.MCP_SERVER_URL || 'Not set');
  console.log('- JITSI_DOMAIN:', process.env.JITSI_DOMAIN || 'meet.jit.si');
});