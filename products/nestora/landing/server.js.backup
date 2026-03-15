import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Health check endpoint - /api/health
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    service: 'nestora',
    timestamp: new Date().toISOString() 
  });
});

// Root endpoint - basic info
app.get('/', (req, res) => {
  res.status(200).json({
    service: 'nestora',
    message: 'Nestora landing page server',
    endpoints: {
      health: '/api/health',
      login: '/login'
    }
  });
});

// Login endpoint
app.get('/login', (req, res) => {
  res.status(200).json({
    service: 'nestora',
    page: 'login',
    message: 'Login page',
    info: 'This is the login endpoint for Nestora'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path,
    message: 'The requested endpoint does not exist'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Nestora landing page server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
});
