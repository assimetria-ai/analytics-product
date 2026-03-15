/* tracker.js — privacy-first analytics, GDPR-friendly, no cookies */
;(function () {
  'use strict'

  var script = document.currentScript || (function () {
    var s = document.getElementsByTagName('script')
    return s[s.length - 1]
  })()

  var SITE_ID = script && script.getAttribute('data-site-id')
  if (!SITE_ID) return

  var ENDPOINT = (script.getAttribute('data-endpoint') || '') + '/api/analytics/collect'
  var SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes

  // ── Visitor / Session IDs ──────────────────────────────────────────────────

  function uid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
    })
  }

  function getVisitorId() {
    try {
      var id = localStorage.getItem('_atk_vid')
      if (!id) { id = uid(); localStorage.setItem('_atk_vid', id) }
      return id
    } catch (e) { return uid() }
  }

  function getSessionId() {
    try {
      var data = JSON.parse(localStorage.getItem('_atk_sid') || 'null')
      var now = Date.now()
      if (data && now - data.ts < SESSION_TIMEOUT_MS) {
        data.ts = now
        localStorage.setItem('_atk_sid', JSON.stringify(data))
        return data.id
      }
      var newData = { id: uid(), ts: now }
      localStorage.setItem('_atk_sid', JSON.stringify(newData))
      return newData.id
    } catch (e) { return uid() }
  }

  // ── Send event ─────────────────────────────────────────────────────────────

  function send(event_type, event_name, extra) {
    var payload = JSON.stringify(Object.assign({
      tracking_id: SITE_ID,
      visitor_id: getVisitorId(),
      session_id: getSessionId(),
      event_type: event_type,
      event_name: event_name,
      page_url: location.href,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      screen_width: screen.width,
    }, extra || {}))

    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: 'text/plain' }))
    } else {
      try {
        var xhr = new XMLHttpRequest()
        xhr.open('POST', ENDPOINT, true)
        xhr.setRequestHeader('Content-Type', 'text/plain')
        xhr.send(payload)
      } catch (e) {}
    }
  }

  // ── Pageview tracking ──────────────────────────────────────────────────────

  function trackPageview() {
    send('pageview', 'pageview')
  }

  // SPA navigation: patch history methods
  function patchHistory(method) {
    var orig = history[method]
    history[method] = function () {
      var result = orig.apply(this, arguments)
      trackPageview()
      return result
    }
  }

  patchHistory('pushState')
  patchHistory('replaceState')
  window.addEventListener('popstate', trackPageview)

  // ── Click tracking ─────────────────────────────────────────────────────────

  document.addEventListener('click', function (e) {
    var el = e.target
    // Walk up to find link or button
    for (var i = 0; i < 5 && el; i++) {
      if (el.tagName === 'A' || el.tagName === 'BUTTON') {
        var href = el.getAttribute('href') || undefined
        var text = (el.innerText || el.textContent || '').trim().slice(0, 100) || undefined
        send('click', 'click', { properties: { element: el.tagName.toLowerCase(), href: href, text: text } })
        return
      }
      el = el.parentElement
    }
  }, { passive: true })

  // ── Initial pageview ───────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trackPageview)
  } else {
    trackPageview()
  }
})()
