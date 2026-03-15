// @custom — SEO API: sitemap, robots.txt, JSON-LD, meta helpers
// GET /api/seo/meta/:slug  — per-post OG/Twitter meta
// GET /seo/sitemap.xml     — full site sitemap
// GET /seo/robots.txt      — robots.txt
const express = require('express')
const router = express.Router()
const { authenticate, requireAdmin } = require('../../lib/@system/Helpers/auth')
const BlogPostRepo = require('../../db/repos/@custom/BlogPostRepo')
const db = require('../../lib/@system/PostgreSQL')

// ── Helpers ───────────────────────────────────────────────────────────────────

function xmlEscape(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function getSiteUrl(req) {
  return process.env.SITE_URL || `${req.protocol}://${req.get('host')}`
}

// ── GET /api/seo/meta/:slug — per-post meta tags ──────────────────────────────
router.get('/api/seo/meta/:slug', async (req, res, next) => {
  try {
    const post = await BlogPostRepo.findBySlug(req.params.slug)
    if (!post || post.status !== 'published') {
      return res.status(404).json({ message: 'Post not found' })
    }

    const siteUrl = getSiteUrl(req)
    const postUrl = `${siteUrl}/blog/${post.slug}`

    const meta = {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || '',
      canonical: post.canonical_url || postUrl,
      og: {
        title: post.meta_title || post.title,
        description: post.meta_description || post.excerpt || '',
        image: post.og_image || post.cover_image || '',
        url: post.canonical_url || postUrl,
        type: 'article',
        publishedTime: post.published_at,
        modifiedTime: post.updated_at,
        author: post.author,
      },
      twitter: {
        card: 'summary_large_image',
        title: post.meta_title || post.title,
        description: post.meta_description || post.excerpt || '',
        image: post.og_image || post.cover_image || '',
      },
      jsonLd: buildJsonLd(post, siteUrl),
    }

    res.json({ meta })
  } catch (err) {
    next(err)
  }
})

// ── GET /seo/sitemap.xml — XML sitemap ────────────────────────────────────────
router.get('/seo/sitemap.xml', async (req, res, next) => {
  try {
    const siteUrl = getSiteUrl(req)

    const posts = await db.any(
      `SELECT slug, updated_at, published_at
       FROM blog_posts
       WHERE status = 'published'
       ORDER BY COALESCE(published_at, created_at) DESC
       LIMIT 1000`,
    )

    const categories = await db.any(
      `SELECT slug, updated_at FROM blog_categories ORDER BY created_at DESC`,
    ).catch(() => [])

    const urls = [
      `<url><loc>${xmlEscape(siteUrl)}/blog</loc><changefreq>daily</changefreq><priority>0.8</priority></url>`,
      ...categories.map(c =>
        `<url><loc>${xmlEscape(siteUrl)}/blog/category/${xmlEscape(c.slug)}</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>`,
      ),
      ...posts.map(p => {
        const lastmod = (p.updated_at || p.published_at || '').toString().split('T')[0]
        return [
          '<url>',
          `  <loc>${xmlEscape(siteUrl)}/blog/${xmlEscape(p.slug)}</loc>`,
          lastmod ? `  <lastmod>${lastmod}</lastmod>` : '',
          '  <changefreq>monthly</changefreq>',
          '  <priority>0.7</priority>',
          '</url>',
        ].filter(Boolean).join('\n')
      }),
    ]

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls,
      '</urlset>',
    ].join('\n')

    res.set('Content-Type', 'application/xml; charset=utf-8')
    res.send(xml)
  } catch (err) {
    next(err)
  }
})

// ── GET /seo/robots.txt ────────────────────────────────────────────────────────
router.get('/seo/robots.txt', (req, res) => {
  const siteUrl = getSiteUrl(req)
  const txt = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /app/',
    'Disallow: /api/',
    'Disallow: /admin/',
    '',
    `Sitemap: ${siteUrl}/seo/sitemap.xml`,
  ].join('\n')

  res.set('Content-Type', 'text/plain; charset=utf-8')
  res.send(txt)
})

// ── GET /api/seo/overview — SEO health per post (admin) ──────────────────────
router.get('/api/seo/overview', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const posts = await db.any(
      `SELECT id, slug, title, status, excerpt,
              meta_title, meta_description, canonical_url, og_image, cover_image,
              published_at, updated_at
       FROM blog_posts
       WHERE status = 'published'
       ORDER BY COALESCE(published_at, created_at) DESC
       LIMIT 200`,
    )

    const scored = posts.map(p => {
      let score = 0
      const issues = []

      if (p.meta_title && p.meta_title.length >= 30 && p.meta_title.length <= 60) {
        score += 25
      } else {
        issues.push(p.meta_title ? 'Meta title length not optimal (30-60 chars)' : 'Missing meta title')
      }

      if (p.meta_description && p.meta_description.length >= 120 && p.meta_description.length <= 160) {
        score += 25
      } else {
        issues.push(p.meta_description ? 'Meta description length not optimal (120-160 chars)' : 'Missing meta description')
      }

      if (p.og_image || p.cover_image) score += 25
      else issues.push('Missing OG image / cover image')

      if (p.canonical_url) score += 25
      else issues.push('No canonical URL (will default to post URL)')

      return { ...p, seoScore: score, seoIssues: issues }
    })

    res.json({ posts: scored })
  } catch (err) {
    next(err)
  }
})

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildJsonLd(post, siteUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || '',
    image: post.og_image || post.cover_image || undefined,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    datePublished: post.published_at,
    dateModified: post.updated_at,
    url: `${siteUrl}/blog/${post.slug}`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${post.slug}`,
    },
  }
}

module.exports = router
