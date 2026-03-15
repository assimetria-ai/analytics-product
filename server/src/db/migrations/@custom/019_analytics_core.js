'use strict'

/**
 * Migration 019 – Analytics core tables
 * Creates the analytics_sites, analytics_events, analytics_sessions,
 * analytics_funnels, and analytics_error_events tables, plus demo seed data.
 */

const fs = require('fs')
const path = require('path')

const SCHEMAS_DIR = path.join(__dirname, '../../schemas/@custom')

exports.up = async (db) => {
  const schemas = [
    'analytics_sites',
    'analytics_events',
    'analytics_sessions',
    'analytics_funnels',
    'analytics_error_events',
  ]
  for (const schema of schemas) {
    const sql = fs.readFileSync(path.join(SCHEMAS_DIR, `${schema}.sql`), 'utf8')
    await db.none(sql)
    console.log(`[019_analytics_core] applied schema: ${schema}`)
  }

  // ── Seed demo data ───────────────────────────────────────────────────────
  await db.none(`
    DO $$
    DECLARE
      v_user_id  INTEGER;
      v_site_id  INTEGER;
      v_tid      UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      v_now      TIMESTAMPTZ := now();
    BEGIN
      SELECT id INTO v_user_id FROM users ORDER BY id LIMIT 1;
      IF v_user_id IS NULL THEN RETURN; END IF;

      -- Demo site
      INSERT INTO analytics_sites (user_id, name, domain, tracking_id)
      VALUES (v_user_id, 'Demo Site', 'demo.example.com', v_tid)
      ON CONFLICT DO NOTHING
      RETURNING id INTO v_site_id;

      IF v_site_id IS NULL THEN
        SELECT id INTO v_site_id FROM analytics_sites WHERE tracking_id = v_tid;
      END IF;
      IF v_site_id IS NULL THEN RETURN; END IF;

      -- Demo sessions (last 30 days, ~20 sessions)
      INSERT INTO analytics_sessions
        (site_id, visitor_id, session_key, started_at, ended_at, page_count,
         entry_page, exit_page, duration_seconds, is_bounce,
         referrer, utm_source, utm_medium, utm_campaign, country, city, device_type, browser, os)
      VALUES
        (v_site_id,'vis_001','sk_001', v_now - INTERVAL '1 day 2 hours',  v_now - INTERVAL '1 day 1 hour 56 min',7,'/','/',272,false,'https://google.com','google','organic',NULL,'US','San Francisco','desktop','Chrome','macOS'),
        (v_site_id,'vis_002','sk_002', v_now - INTERVAL '1 day 3 hours',  v_now - INTERVAL '1 day 2 hour 57 min',4,'/','/pricing',135,false,'https://twitter.com','twitter','social','spring-launch','GB','London','desktop','Firefox','Windows'),
        (v_site_id,'vis_003','sk_003', v_now - INTERVAL '1 day 5 hours',  v_now - INTERVAL '1 day 4 hour 57 min',3,'/features','/pricing',108,false,NULL,NULL,NULL,NULL,'DE','Berlin','mobile','Safari','iOS'),
        (v_site_id,'vis_004','sk_004', v_now - INTERVAL '2 days 1 hour',  v_now - INTERVAL '2 days 54 min',       9,'/docs','/app',371,false,'https://github.com',NULL,NULL,NULL,'FR','Paris','desktop','Chrome','Linux'),
        (v_site_id,'vis_005','sk_005', v_now - INTERVAL '2 days 4 hours', v_now - INTERVAL '2 days 3 hours 59 min',1,'/',NULL,34,true,NULL,NULL,NULL,NULL,'CA','Toronto','mobile','Chrome','Android'),
        (v_site_id,'vis_006','sk_006', v_now - INTERVAL '3 days',         v_now - INTERVAL '2 days 23 hours 58 min',5,'/','/',202,false,'https://news.ycombinator.com',NULL,NULL,NULL,'NL','Amsterdam','desktop','Edge','Windows'),
        (v_site_id,'vis_007','sk_007', v_now - INTERVAL '4 days',         v_now - INTERVAL '3 days 23 hours 55 min',6,'/blog','/signup',345,false,'https://reddit.com','reddit','social',NULL,'AU','Sydney','desktop','Chrome','macOS'),
        (v_site_id,'vis_008','sk_008', v_now - INTERVAL '5 days',         v_now - INTERVAL '4 days 23 hours 58 min',2,'/pricing',NULL,77,false,NULL,NULL,NULL,NULL,'BR','São Paulo','mobile','Chrome','Android'),
        (v_site_id,'vis_009','sk_009', v_now - INTERVAL '6 days',         v_now - INTERVAL '5 days 23 hours 54 min',8,'/','/',412,false,'https://linkedin.com','linkedin','social','b2b-q1','IN','Bangalore','desktop','Chrome','Windows'),
        (v_site_id,'vis_010','sk_010', v_now - INTERVAL '7 days',         v_now - INTERVAL '6 days 23 hours 57 min',4,'/features','/pricing',189,false,NULL,'email','email','newsletter-march','US','New York','desktop','Safari','macOS'),
        (v_site_id,'vis_011','sk_011', v_now - INTERVAL '8 days',         v_now - INTERVAL '7 days 23 hours 59 min',1,'/',NULL,15,true,NULL,NULL,NULL,NULL,'JP','Tokyo','mobile','Safari','iOS'),
        (v_site_id,'vis_012','sk_012', v_now - INTERVAL '10 days',        v_now - INTERVAL '9 days 23 hours 56 min',5,'/docs','/app',267,false,'https://google.com','google','organic',NULL,'US','Austin','desktop','Chrome','Windows'),
        (v_site_id,'vis_013','sk_013', v_now - INTERVAL '12 days',        v_now - INTERVAL '11 days 23 hours 57 min',3,'/','/blog',156,false,NULL,NULL,NULL,NULL,'SE','Stockholm','desktop','Firefox','Linux'),
        (v_site_id,'vis_014','sk_014', v_now - INTERVAL '14 days',        v_now - INTERVAL '13 days 23 hours 53 min',11,'/','/app',623,false,'https://google.com','google','organic',NULL,'US','Chicago','desktop','Chrome','macOS'),
        (v_site_id,'vis_015','sk_015', v_now - INTERVAL '16 days',        v_now - INTERVAL '15 days 23 hours 58 min',2,'/pricing',NULL,88,false,'https://producthunt.com','producthunt','referral','producthunt','SG','Singapore','desktop','Chrome','Windows'),
        (v_site_id,'vis_016','sk_016', v_now - INTERVAL '18 days',        v_now - INTERVAL '17 days 23 hours 56 min',4,'/blog','/pricing',231,false,NULL,NULL,NULL,NULL,'MX','Mexico City','mobile','Chrome','Android'),
        (v_site_id,'vis_017','sk_017', v_now - INTERVAL '20 days',        v_now - INTERVAL '19 days 23 hours 55 min',7,'/','/',389,false,'https://google.com','google','cpc','spring-launch','US','Seattle','desktop','Chrome','macOS'),
        (v_site_id,'vis_018','sk_018', v_now - INTERVAL '22 days',        v_now - INTERVAL '21 days 23 hours 57 min',1,'/',NULL,23,true,NULL,NULL,NULL,NULL,'KR','Seoul','mobile','Samsung','Android'),
        (v_site_id,'vis_019','sk_019', v_now - INTERVAL '25 days',        v_now - INTERVAL '24 days 23 hours 56 min',5,'/features','/signup',298,false,'https://twitter.com','twitter','social','spring-launch','CA','Vancouver','desktop','Firefox','Windows'),
        (v_site_id,'vis_020','sk_020', v_now - INTERVAL '28 days',        v_now - INTERVAL '27 days 23 hours 54 min',9,'/docs','/app',534,false,'https://github.com',NULL,NULL,NULL,'DE','Munich','desktop','Chrome','Linux');

      -- Demo pageview events (matching sessions)
      INSERT INTO analytics_events
        (site_id, visitor_id, session_id, event_type, event_name, page_url, referrer, device_type, browser, os, timestamp)
      VALUES
        (v_site_id,'vis_001','sk_001','pageview','pageview','/',             'https://google.com', 'desktop','Chrome','macOS',  v_now - INTERVAL '1 day 2 hours'),
        (v_site_id,'vis_001','sk_001','pageview','pageview','/pricing',      NULL,                 'desktop','Chrome','macOS',  v_now - INTERVAL '1 day 1 hour 50 min'),
        (v_site_id,'vis_001','sk_001','pageview','pageview','/features',     NULL,                 'desktop','Chrome','macOS',  v_now - INTERVAL '1 day 1 hour 45 min'),
        (v_site_id,'vis_001','sk_001','pageview','pageview','/docs',         NULL,                 'desktop','Chrome','macOS',  v_now - INTERVAL '1 day 1 hour 40 min'),
        (v_site_id,'vis_001','sk_001','pageview','pageview','/signup',       NULL,                 'desktop','Chrome','macOS',  v_now - INTERVAL '1 day 1 hour 30 min'),
        (v_site_id,'vis_001','sk_001','click',   'click',   '/signup',       NULL,                 'desktop','Chrome','macOS',  v_now - INTERVAL '1 day 1 hour 25 min'),
        (v_site_id,'vis_001','sk_001','pageview','pageview','/app',          NULL,                 'desktop','Chrome','macOS',  v_now - INTERVAL '1 day 1 hour 20 min'),
        (v_site_id,'vis_002','sk_002','pageview','pageview','/',             'https://twitter.com','desktop','Firefox','Windows',v_now - INTERVAL '1 day 3 hours'),
        (v_site_id,'vis_002','sk_002','pageview','pageview','/blog',         NULL,                 'desktop','Firefox','Windows',v_now - INTERVAL '1 day 2 hours 50 min'),
        (v_site_id,'vis_002','sk_002','pageview','pageview','/features',     NULL,                 'desktop','Firefox','Windows',v_now - INTERVAL '1 day 2 hours 40 min'),
        (v_site_id,'vis_002','sk_002','pageview','pageview','/pricing',      NULL,                 'desktop','Firefox','Windows',v_now - INTERVAL '1 day 2 hours 30 min'),
        (v_site_id,'vis_003','sk_003','pageview','pageview','/features',     NULL,                 'mobile', 'Safari','iOS',     v_now - INTERVAL '1 day 5 hours'),
        (v_site_id,'vis_003','sk_003','pageview','pageview','/',             NULL,                 'mobile', 'Safari','iOS',     v_now - INTERVAL '1 day 4 hours 50 min'),
        (v_site_id,'vis_003','sk_003','pageview','pageview','/pricing',      NULL,                 'mobile', 'Safari','iOS',     v_now - INTERVAL '1 day 4 hours 40 min'),
        (v_site_id,'vis_004','sk_004','pageview','pageview','/docs',         'https://github.com', 'desktop','Chrome','Linux',   v_now - INTERVAL '2 days 1 hour'),
        (v_site_id,'vis_004','sk_004','pageview','pageview','/docs/api',     NULL,                 'desktop','Chrome','Linux',   v_now - INTERVAL '2 days 55 min'),
        (v_site_id,'vis_004','sk_004','pageview','pageview','/',             NULL,                 'desktop','Chrome','Linux',   v_now - INTERVAL '2 days 50 min'),
        (v_site_id,'vis_005','sk_005','pageview','pageview','/',             NULL,                 'mobile', 'Chrome','Android', v_now - INTERVAL '2 days 4 hours'),
        (v_site_id,'vis_006','sk_006','pageview','pageview','/',             'https://news.ycombinator.com','desktop','Edge','Windows',v_now - INTERVAL '3 days'),
        (v_site_id,'vis_007','sk_007','pageview','pageview','/blog',         'https://reddit.com', 'desktop','Chrome','macOS',  v_now - INTERVAL '4 days');

      -- Demo funnels
      INSERT INTO analytics_funnels (site_id, name, steps)
      VALUES
        (v_site_id, 'Signup Funnel', '[
          {"name":"Landing Page","event_type":"pageview","event_name":"pageview","url_pattern":"/"},
          {"name":"Clicked Sign Up","event_type":"click","event_name":"click","url_pattern":"/signup"},
          {"name":"Completed Signup","event_type":"pageview","event_name":"pageview","url_pattern":"/app"}
        ]'::jsonb),
        (v_site_id, 'Upgrade Funnel', '[
          {"name":"Dashboard Visit","event_type":"pageview","event_name":"pageview","url_pattern":"/app"},
          {"name":"Viewed Pricing","event_type":"pageview","event_name":"pageview","url_pattern":"/pricing"},
          {"name":"Checkout","event_type":"click","event_name":"click","url_pattern":"/pricing"}
        ]'::jsonb);

      -- Demo analytics errors
      INSERT INTO analytics_error_events
        (site_id, message, stack_trace, source_file, line_number, column_number,
         browser, os, url, visitor_id, session_id, severity, fingerprint, first_seen_at, last_seen_at, occurrence_count, status)
      VALUES
        (v_site_id,
         'TypeError: Cannot read properties of undefined (reading ''map'')',
         'TypeError: Cannot read properties of undefined (reading ''map'')' || chr(10) ||
         '    at ProductList (bundle.js:4821:23)' || chr(10) ||
         '    at renderWithHooks (bundle.js:14985:22)',
         'bundle.js', 4821, 23, 'Chrome', 'macOS', '/app/products',
         'vis_001', 'sk_001', 'error', 'typeerr_map_001',
         v_now - INTERVAL '5 days', v_now - INTERVAL '2 hours', 47, 'unresolved'),
        (v_site_id,
         'ReferenceError: gtag is not defined',
         'ReferenceError: gtag is not defined' || chr(10) ||
         '    at trackEvent (analytics.js:12:5)' || chr(10) ||
         '    at HTMLButtonElement.onclick (index.html:1:1)',
         'analytics.js', 12, 5, 'Firefox', 'Windows', '/pricing',
         'vis_002', 'sk_002', 'warning', 'referenceerr_gtag_001',
         v_now - INTERVAL '10 days', v_now - INTERVAL '1 day', 12, 'resolved'),
        (v_site_id,
         'ChunkLoadError: Loading chunk 42 failed',
         'ChunkLoadError: Loading chunk 42 failed.' || chr(10) ||
         '    at Function.requireEnsure (bundle.js:1:1234)',
         'bundle.js', 1, 1234, 'Safari', 'iOS', '/docs',
         'vis_003', 'sk_003', 'error', 'chunkloaderr_042',
         v_now - INTERVAL '3 days', v_now - INTERVAL '3 hours', 23, 'unresolved');

    END$$;
  `)

  console.log('[019_analytics_core] seed data inserted')
}

exports.down = async (db) => {
  await db.none('DROP TABLE IF EXISTS analytics_error_events CASCADE')
  await db.none('DROP TABLE IF EXISTS analytics_funnels CASCADE')
  await db.none('DROP TABLE IF EXISTS analytics_sessions CASCADE')
  await db.none('DROP TABLE IF EXISTS analytics_events CASCADE')
  await db.none('DROP TABLE IF EXISTS analytics_sites CASCADE')
  console.log('[019_analytics_core] rolled back analytics tables')
}
