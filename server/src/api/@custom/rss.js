// @custom — RSS / Atom feeds for published blog posts
// GET /rss                    — RSS 2.0 (all published posts)
// GET /rss/atom               — Atom feed
// GET /rss/category/:slug     — RSS 2.0 filtered by category
const express = require('express')
const router = express.Router()
const db = require('../../lib/@system/PostgreSQL')

// ── Config ────────────────────────────────────────────────────────────────────

const FEED_LIMIT = 50

function getSiteUrl(req) {
  return process.env.SITE_URL || `${req.protocol}://${req.get('host')}`
}

function getSiteTitle() {
  return process.env.SITE_NAME || 'Blog'
}

function xmlEscape(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function toRfc2822(date) {
  if (!date) return new Date().toUTCString()
  return new Date(date).toUTCString()
}

function toIso(date) {
  if (!date) return new Date().toISOString()
  return new Date(date).toISOString()
}

// ── Fetch posts helper ────────────────────────────────────────────────────────

async function fetchPosts(categorySlug) {
  const baseQuery = `
    SELECT bp.id, bp.slug, bp.title, bp.excerpt, bp.content,
           bp.author, bp.cover_image, bp.published_at, bp.updated_at,
           bp.reading_time, bp.tags, bc.slug AS category_slug, bc.name AS category_name
    FROM blog_posts bp
    LEFT JOIN blog_categories bc ON bc.id = bp.category_id
    WHERE bp.status = 'published'
  `

  if (categorySlug) {
    return db.any(
      `${baseQuery} AND bc.slug = $1 ORDER BY bp.published_at DESC LIMIT $2`,
      [categorySlug, FEED_LIMIT],
    )
  }

  return db.any(
    `${baseQuery} ORDER BY bp.published_at DESC LIMIT $1`,
    [FEED_LIMIT],
  )
}

// ── Determine content mode ────────────────────────────────────────────────────

async function getRssMode() {
  try {
    const row = await db.oneOrNone(
      `SELECT value FROM blog_settings WHERE key = 'rss_mode'`,
    )
    return row ? row.value.replace(/^"|"$/g, '') : 'excerpt'
  } catch {
    return 'excerpt'
  }
}

function getItemContent(post, mode) {
  if (mode === 'full') {
    return post.content || post.excerpt || ''
  }
  return stripHtml(post.excerpt || post.content || '').slice(0, 500)
}

// ── RSS 2.0 ───────────────────────────────────────────────────────────────────

async function buildRss2(posts, siteUrl, feedTitle, feedUrl) {
  const mode = await getRssMode()
  const now = new Date().toUTCString()

  const items = posts.map(p => {
    const url = `${siteUrl}/blog/${p.slug}`
    const content = getItemContent(p, mode)
    const enclosure = p.cover_image
      ? `<enclosure url="${xmlEscape(p.cover_image)}" type="image/jpeg" length="0" />`
      : ''

    return [
      '<item>',
      `  <title>${xmlEscape(p.title)}</title>`,
      `  <link>${xmlEscape(url)}</link>`,
      `  <guid isPermaLink="true">${xmlEscape(url)}</guid>`,
      `  <description>${xmlEscape(content)}</description>`,
      `  <author>${xmlEscape(p.author || 'The Team')}</author>`,
      `  <pubDate>${toRfc2822(p.published_at)}</pubDate>`,
      p.category_name ? `  <category>${xmlEscape(p.category_name)}</category>` : '',
      enclosure,
      '</item>',
    ].filter(Boolean).join('\n')
  })

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '<channel>',
    `  <title>${xmlEscape(feedTitle)}</title>`,
    `  <link>${xmlEscape(siteUrl)}/blog</link>`,
    `  <description>Latest posts from ${xmlEscape(feedTitle)}</description>`,
    `  <language>en-us</language>`,
    `  <lastBuildDate>${now}</lastBuildDate>`,
    `  <atom:link href="${xmlEscape(feedUrl)}" rel="self" type="application/rss+xml" />`,
    ...items,
    '</channel>',
    '</rss>',
  ].join('\n')
}

// ── Atom ──────────────────────────────────────────────────────────────────────

async function buildAtom(posts, siteUrl) {
  const mode = await getRssMode()
  const feedTitle = getSiteTitle()

  const entries = posts.map(p => {
    const url = `${siteUrl}/blog/${p.slug}`
    const content = getItemContent(p, mode)

    return [
      '<entry>',
      `  <id>${xmlEscape(url)}</id>`,
      `  <title>${xmlEscape(p.title)}</title>`,
      `  <link href="${xmlEscape(url)}" />`,
      `  <updated>${toIso(p.updated_at || p.published_at)}</updated>`,
      `  <published>${toIso(p.published_at)}</published>`,
      `  <author><name>${xmlEscape(p.author || 'The Team')}</name></author>`,
      `  <summary type="text">${xmlEscape(content)}</summary>`,
      '</entry>',
    ].join('\n')
  })

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    `  <id>${xmlEscape(siteUrl)}/blog</id>`,
    `  <title>${xmlEscape(feedTitle)}</title>`,
    `  <link href="${xmlEscape(siteUrl)}/blog" />`,
    `  <link rel="self" href="${xmlEscape(siteUrl)}/rss/atom" />`,
    `  <updated>${toIso(posts[0]?.published_at)}</updated>`,
    ...entries,
    '</feed>',
  ].join('\n')
}

// ── Routes ────────────────────────────────────────────────────────────────────

// GET /rss — RSS 2.0 all published posts
router.get('/rss', async (req, res, next) => {
  try {
    const siteUrl = getSiteUrl(req)
    const posts = await fetchPosts(null)
    const xml = await buildRss2(posts, siteUrl, getSiteTitle(), `${siteUrl}/rss`)
    res.set('Content-Type', 'application/rss+xml; charset=utf-8')
    res.send(xml)
  } catch (err) {
    next(err)
  }
})

// GET /rss/atom — Atom feed
router.get('/rss/atom', async (req, res, next) => {
  try {
    const siteUrl = getSiteUrl(req)
    const posts = await fetchPosts(null)
    const xml = await buildAtom(posts, siteUrl)
    res.set('Content-Type', 'application/atom+xml; charset=utf-8')
    res.send(xml)
  } catch (err) {
    next(err)
  }
})

// GET /rss/category/:slug — per-category RSS
router.get('/rss/category/:slug', async (req, res, next) => {
  try {
    const siteUrl = getSiteUrl(req)
    const { slug } = req.params

    const category = await db.oneOrNone(
      `SELECT name FROM blog_categories WHERE slug = $1`,
      [slug],
    ).catch(() => null)

    const posts = await fetchPosts(slug)
    const feedTitle = category
      ? `${getSiteTitle()} — ${category.name}`
      : getSiteTitle()

    const xml = await buildRss2(
      posts, siteUrl, feedTitle,
      `${siteUrl}/rss/category/${xmlEscape(slug)}`,
    )

    res.set('Content-Type', 'application/rss+xml; charset=utf-8')
    res.send(xml)
  } catch (err) {
    next(err)
  }
})

module.exports = router
