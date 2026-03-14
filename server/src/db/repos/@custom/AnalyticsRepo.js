// @custom — Newsletter Analytics repository
const db = require('../../../lib/@system/PostgreSQL')

const AnalyticsRepo = {
  // Overall newsletter stats
  async getNewsletterStats(newsletter_id) {
    return db.oneOrNone(
      `SELECT
         COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'active')       AS active_subscribers,
         COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'unsubscribed') AS total_unsubscribed,
         COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'sent')         AS total_campaigns,
         COALESCE(SUM(c.recipient_count) FILTER (WHERE c.status='sent'), 0) AS total_sends,
         COALESCE(AVG(
           CASE WHEN cm.delivered > 0
                THEN (cm.unique_opens::numeric / cm.delivered) * 100
                ELSE NULL END
         ), 0) AS avg_open_rate,
         COALESCE(AVG(
           CASE WHEN cm.unique_opens > 0
                THEN (cm.unique_clicks::numeric / cm.unique_opens) * 100
                ELSE NULL END
         ), 0) AS avg_click_rate
       FROM newsletters n
       LEFT JOIN subscribers s ON s.newsletter_id = n.id
       LEFT JOIN campaigns c ON c.newsletter_id = n.id
       LEFT JOIN campaign_metrics cm ON cm.campaign_id = c.id
       WHERE n.id = $1`,
      [newsletter_id],
    )
  },

  // Per-campaign metrics list for a newsletter
  async getCampaignMetrics(newsletter_id, { limit = 20, offset = 0 } = {}) {
    return db.any(
      `SELECT c.id, c.subject, c.sent_at, c.recipient_count, c.status,
              cm.delivered, cm.opens, cm.unique_opens, cm.clicks, cm.unique_clicks,
              cm.bounces, cm.unsubscribes,
              CASE WHEN cm.delivered > 0
                   THEN ROUND((cm.unique_opens::numeric / cm.delivered) * 100, 1)
                   ELSE 0 END AS open_rate,
              CASE WHEN cm.unique_opens > 0
                   THEN ROUND((cm.unique_clicks::numeric / cm.unique_opens) * 100, 1)
                   ELSE 0 END AS click_rate,
              CASE WHEN cm.delivered > 0
                   THEN ROUND((cm.unsubscribes::numeric / cm.delivered) * 100, 2)
                   ELSE 0 END AS unsub_rate
       FROM campaigns c
       LEFT JOIN campaign_metrics cm ON cm.campaign_id = c.id
       WHERE c.newsletter_id = $1 AND c.status = 'sent'
       ORDER BY c.sent_at DESC
       LIMIT $2 OFFSET $3`,
      [newsletter_id, limit, offset],
    )
  },

  // Subscriber growth over time
  async getSubscriberGrowth(newsletter_id, { days = 30 } = {}) {
    return db.any(
      `WITH dates AS (
         SELECT generate_series(
           date_trunc('day', now() - ($2 || ' days')::interval),
           date_trunc('day', now()),
           interval '1 day'
         ) AS day
       )
       SELECT
         dates.day,
         COALESCE(SUM(COUNT(*)) OVER (ORDER BY dates.day), 0) AS cumulative_subscribers,
         COUNT(s.id) FILTER (WHERE s.status = 'active') AS new_subscribers
       FROM dates
       LEFT JOIN subscribers s
         ON date_trunc('day', s.subscribed_at) = dates.day
         AND s.newsletter_id = $1
       GROUP BY dates.day
       ORDER BY dates.day`,
      [newsletter_id, days],
    )
  },

  // Top campaigns by open rate
  async getTopCampaigns(newsletter_id, { limit = 10 } = {}) {
    return db.any(
      `SELECT c.id, c.subject, c.sent_at, c.recipient_count,
              CASE WHEN cm.delivered > 0
                   THEN ROUND((cm.unique_opens::numeric / cm.delivered) * 100, 1)
                   ELSE 0 END AS open_rate,
              CASE WHEN cm.unique_opens > 0
                   THEN ROUND((cm.unique_clicks::numeric / cm.unique_opens) * 100, 1)
                   ELSE 0 END AS click_rate
       FROM campaigns c
       JOIN campaign_metrics cm ON cm.campaign_id = c.id
       WHERE c.newsletter_id = $1 AND c.status = 'sent'
       ORDER BY open_rate DESC
       LIMIT $2`,
      [newsletter_id, limit],
    )
  },
}

module.exports = AnalyticsRepo
