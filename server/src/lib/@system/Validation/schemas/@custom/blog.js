const { z } = require('zod')

// ── Body schemas ──────────────────────────────────────────────────────────────

const CreateBlogPostBody = z.object({
  title: z.string({ required_error: 'title is required' }).trim().min(1, 'title is required'),
  excerpt: z.string().optional().nullable(),
  content: z.string().optional().default(''),
  category: z.string().optional().default('Company'),
  author: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  cover_image: z.string().url('cover_image must be a valid URL').optional().nullable(),
  status: z.enum(['draft', 'published']).optional().default('draft'),
})

const UpdateBlogPostBody = z.object({
  title: z.string().trim().min(1, 'title must be a non-empty string').optional(),
  excerpt: z.string().optional().nullable(),
  content: z.string().optional(),
  category: z.string().optional(),
  author: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  cover_image: z.string().url('cover_image must be a valid URL').optional().nullable(),
  status: z.enum(['draft', 'published']).optional(),
})

// ── Params schemas ────────────────────────────────────────────────────────────

const BlogPostIdParams = z.object({
  id: z.coerce.number({ invalid_type_error: 'id must be a number' }).int().positive('id must be a positive integer'),
})

const BlogPostSlugParams = z.object({
  slug: z.string({ required_error: 'slug is required' }).trim().min(1, 'slug is required'),
})

// ── Query schemas ─────────────────────────────────────────────────────────────

const ListBlogPostsQuery = z.object({
  status: z.enum(['draft', 'published']).optional(),
  category: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

module.exports = {
  CreateBlogPostBody,
  UpdateBlogPostBody,
  BlogPostIdParams,
  BlogPostSlugParams,
  ListBlogPostsQuery,
}
