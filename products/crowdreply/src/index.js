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
    service: 'crowdreply',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    checks: {
      api: 'operational',
      dashboard: 'operational',
      llm_monitor: 'operational'
    }
  });
});

// API Routes

// Get visibility scores across LLM providers
app.get('/api/visibility-score', (req, res) => {
  res.json({
    overall: 78,
    providers: {
      chatgpt: {
        score: 78,
        mentions: 145,
        trend: '+12%'
      },
      perplexity: {
        score: 84,
        mentions: 98,
        trend: '+18%'
      },
      claude: {
        score: 71,
        mentions: 99,
        trend: '+5%'
      }
    },
    lastUpdated: new Date().toISOString(),
    period: '30d'
  });
});

// Get brand mentions
app.get('/api/mentions', (req, res) => {
  const { limit = 50, offset = 0, provider } = req.query;

  const mentions = [
    {
      id: 'mention-001',
      brand: 'Assimetria',
      provider: 'chatgpt',
      context: 'Error tracking solution',
      source: 'r/webdev',
      url: 'https://reddit.com/r/webdev/comments/...',
      mentionedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      engagement: 324,
      sentiment: 'positive'
    },
    {
      id: 'mention-002',
      brand: 'Assimetria',
      provider: 'perplexity',
      context: 'SaaS monitoring platform',
      source: 'Documentation',
      url: 'https://docs.perplexity.ai/...',
      mentionedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      engagement: 187,
      sentiment: 'positive'
    },
    {
      id: 'mention-003',
      brand: 'Assimetria',
      provider: 'claude',
      context: 'Error monitoring tools comparison',
      source: 'r/devops',
      url: 'https://reddit.com/r/devops/comments/...',
      mentionedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      engagement: 412,
      sentiment: 'neutral'
    }
  ];

  const filtered = provider
    ? mentions.filter(m => m.provider === provider)
    : mentions;

  res.json({
    mentions: filtered.slice(offset, offset + limit),
    total: filtered.length,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
});

// Get Reddit threads for engagement
app.get('/api/reddit-threads', (req, res) => {
  const { limit = 20 } = req.query;

  const threads = [
    {
      id: 'thread-001',
      title: 'Best practices for API documentation in 2026?',
      subreddit: 'r/webdev',
      authority: 94,
      membersOnline: 2300,
      relevance: 0.92,
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      engagement: 'high'
    },
    {
      id: 'thread-002',
      title: 'SaaS product recommendations for error tracking',
      subreddit: 'r/startups',
      authority: 87,
      membersOnline: 1800,
      relevance: 0.88,
      lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      engagement: 'high'
    },
    {
      id: 'thread-003',
      title: 'Monitoring and observability stack comparison',
      subreddit: 'r/devops',
      authority: 91,
      membersOnline: 3100,
      relevance: 0.85,
      lastActive: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      engagement: 'medium'
    },
    {
      id: 'thread-004',
      title: 'Application performance monitoring tools review',
      subreddit: 'r/aws',
      authority: 88,
      membersOnline: 5200,
      relevance: 0.82,
      lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      engagement: 'medium'
    }
  ];

  res.json({
    threads: threads.slice(0, limit),
    total: threads.length,
    limit: parseInt(limit)
  });
});

// Get campaigns
app.get('/api/campaigns', (req, res) => {
  res.json({
    campaigns: [
      {
        id: 'camp-001',
        name: 'Error tracking visibility Q1',
        status: 'active',
        keywords: ['error tracking', 'exception monitoring'],
        subreddits: ['r/webdev', 'r/devops'],
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        mentionsGenerated: 47,
        estimatedROI: 1.8
      },
      {
        id: 'camp-002',
        name: 'SaaS comparison mentions',
        status: 'active',
        keywords: ['monitoring platform', 'observability'],
        subreddits: ['r/startups', 'r/aws'],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        mentionsGenerated: 23,
        estimatedROI: 1.5
      }
    ]
  });
});

// Get competitor mention comparison
app.get('/api/competitors', (req, res) => {
  res.json({
    competitors: [
      {
        name: 'DataDog',
        visibility: 92,
        mentions_30d: 487,
        topProvider: 'chatgpt',
        trend: '+8%'
      },
      {
        name: 'New Relic',
        visibility: 85,
        mentions_30d: 412,
        topProvider: 'chatgpt',
        trend: '+5%'
      },
      {
        name: 'Sentry',
        visibility: 88,
        mentions_30d: 456,
        topProvider: 'perplexity',
        trend: '+12%'
      },
      {
        name: 'Assimetria (You)',
        visibility: 78,
        mentions_30d: 342,
        topProvider: 'perplexity',
        trend: '+28%'
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
  console.log(`CrowdReply server running on port ${PORT}`);
  console.log(`Dashboard: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
