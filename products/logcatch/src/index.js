import express from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'logcatch',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    checks: {
      api: 'operational',
      dashboard: 'operational'
    }
  });
});

// API Routes

// Ingest errors
app.post('/api/ingest', (req, res) => {
  const { error, context, metadata } = req.body;

  if (!error) {
    return res.status(400).json({ error: 'Missing error field' });
  }

  // In production, this would process and fingerprint the error
  const errorId = Math.random().toString(36).substring(2, 11);

  res.status(202).json({
    id: errorId,
    received: true,
    timestamp: new Date().toISOString(),
    message: `Error ${errorId} queued for processing`
  });
});

// Get errors
app.get('/api/errors', (req, res) => {
  const { limit = 50, offset = 0 } = req.query;

  // Mock data for MVP
  const errors = [
    {
      id: 'err-001',
      fingerprint: 'TypeError:Cannot_read_property_map',
      title: 'TypeError: Cannot read property \'map\' of undefined',
      file: 'api/users.js',
      line: 145,
      count: 2483,
      severity: 'critical',
      lastSeen: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      firstSeen: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'err-002',
      fingerprint: 'ReferenceError:cache_not_defined',
      title: 'ReferenceError: cache is not defined',
      file: 'middleware/auth.js',
      line: 32,
      count: 38,
      severity: 'resolved',
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      firstSeen: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      resolvedAt: new Date().toISOString()
    },
    {
      id: 'err-003',
      fingerprint: 'SyntaxError:Unexpected_token_JSON',
      title: 'SyntaxError: Unexpected token in JSON at position 0',
      file: 'components/Parser.js',
      line: 89,
      count: 412,
      severity: 'high',
      lastSeen: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      firstSeen: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    }
  ];

  res.json({
    errors: errors.slice(offset, offset + limit),
    total: errors.length,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
});

// Get single error
app.get('/api/errors/:id', (req, res) => {
  const { id } = req.params;

  const error = {
    id,
    fingerprint: 'TypeError:Cannot_read_property_map',
    title: 'TypeError: Cannot read property \'map\' of undefined',
    file: 'api/users.js',
    line: 145,
    count: 2483,
    severity: 'critical',
    lastSeen: new Date().toISOString(),
    firstSeen: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    stackTrace: [
      'at getUserList (api/users.js:145:15)',
      'at async processRequest (middleware/handler.js:62:9)',
      'at async Object.route [as handler] (routes/index.js:28:15)',
      'at async createServer (server.js:94:8)'
    ],
    occurrences: 2483,
    affectedUsers: 347,
    releaseIntroduced: 'v2.0.5',
    releases: {
      'v2.0.5': 245,
      'v2.0.6': 1248,
      'v2.0.7': 990
    }
  };

  res.json(error);
});

// Alert rules
app.get('/api/alert-rules', (req, res) => {
  res.json({
    rules: [
      {
        id: 'rule-001',
        name: 'Critical error spike',
        condition: 'error_count > 100 in last 5m',
        channels: ['slack', 'email'],
        enabled: true
      },
      {
        id: 'rule-002',
        name: 'New error type',
        condition: 'first_occurrence in last 1h',
        channels: ['email'],
        enabled: true
      }
    ]
  });
});

// Root path serves the dashboard HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`LogCatch server running on port ${PORT}`);
  console.log(`Dashboard: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
