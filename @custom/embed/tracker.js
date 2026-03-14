/**
 * Analytics Product — Embed Tracking Script
 * Lightweight (<1KB gzipped), cookie-free analytics tracker.
 * Usage: <script src="https://YOUR_DOMAIN/embed.js" data-site="SITE_ID"></script>
 */
;(function () {
  'use strict'

  var script = document.currentScript
  var siteId = script && script.getAttribute('data-site')
  var endpoint =
    (script && script.getAttribute('data-endpoint')) ||
    script.src.replace(/\/embed\.js.*$/, '') + '/api/events/track'
  var autoClicks = script ? script.getAttribute('data-clicks') !== 'false' : true
  var autoForms = script ? script.getAttribute('data-forms') !== 'false' : true

  // Session ID — stored in sessionStorage, no cookies
  function getSessionId() {
    var key = '_ap_sid'
    var sid = null
    try {
      sid = sessionStorage.getItem(key)
    } catch (e) {}
    if (!sid) {
      sid =
        Math.random().toString(36).substring(2) +
        Date.now().toString(36)
      try {
        sessionStorage.setItem(key, sid)
      } catch (e) {}
    }
    return sid
  }

  var sessionId = getSessionId()

  // Detect basic device info
  function getDeviceType() {
    var ua = navigator.userAgent
    if (/Mobi|Android/i.test(ua)) return 'mobile'
    if (/Tablet|iPad/i.test(ua)) return 'tablet'
    return 'desktop'
  }

  function getBrowser() {
    var ua = navigator.userAgent
    if (ua.indexOf('Firefox') > -1) return 'Firefox'
    if (ua.indexOf('Edg') > -1) return 'Edge'
    if (ua.indexOf('Chrome') > -1) return 'Chrome'
    if (ua.indexOf('Safari') > -1) return 'Safari'
    return 'Other'
  }

  function getOS() {
    var ua = navigator.userAgent
    if (ua.indexOf('Win') > -1) return 'Windows'
    if (ua.indexOf('Mac') > -1) return 'macOS'
    if (ua.indexOf('Linux') > -1) return 'Linux'
    if (/Android/i.test(ua)) return 'Android'
    if (/iPhone|iPad/i.test(ua)) return 'iOS'
    return 'Other'
  }

  // Parse UTM params
  function getUTM() {
    var params = new URLSearchParams(location.search)
    return {
      utmSource: params.get('utm_source'),
      utmMedium: params.get('utm_medium'),
      utmCampaign: params.get('utm_campaign'),
      utmTerm: params.get('utm_term'),
      utmContent: params.get('utm_content'),
    }
  }

  // Send event
  function track(eventType, eventName, extra) {
    var utm = getUTM()
    var payload = {
      siteId: siteId,
      eventType: eventType,
      eventName: eventName || null,
      sessionId: sessionId,
      pageUrl: location.href,
      pagePath: location.pathname,
      pageTitle: document.title,
      referrer: document.referrer || null,
      device: getDeviceType(),
      browser: getBrowser(),
      os: getOS(),
      utmSource: utm.utmSource,
      utmMedium: utm.utmMedium,
      utmCampaign: utm.utmCampaign,
      utmTerm: utm.utmTerm,
      utmContent: utm.utmContent,
      properties: extra || null,
      timestamp: new Date().toISOString(),
    }

    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, JSON.stringify(payload))
    } else {
      var xhr = new XMLHttpRequest()
      xhr.open('POST', endpoint, true)
      xhr.setRequestHeader('Content-Type', 'application/json')
      xhr.send(JSON.stringify(payload))
    }
  }

  // Auto-track pageview
  track('pageview')

  // Auto-track clicks
  if (autoClicks) {
    document.addEventListener(
      'click',
      function (e) {
        var el = e.target.closest('a, button, [data-track]')
        if (!el) return
        var props = {
          tag: el.tagName.toLowerCase(),
          text: (el.innerText || '').substring(0, 100),
          href: el.getAttribute('href') || null,
          trackId: el.getAttribute('data-track') || null,
        }
        track('click', null, props)
      },
      true
    )
  }

  // Auto-track form submissions
  if (autoForms) {
    document.addEventListener(
      'submit',
      function (e) {
        var form = e.target
        if (form.tagName !== 'FORM') return
        track('form_submit', null, {
          action: form.action || null,
          id: form.id || null,
          name: form.name || null,
        })
      },
      true
    )
  }

  // SPA support: track on pushState/popstate
  var origPush = history.pushState
  history.pushState = function () {
    origPush.apply(this, arguments)
    setTimeout(function () {
      track('pageview')
    }, 0)
  }
  window.addEventListener('popstate', function () {
    setTimeout(function () {
      track('pageview')
    }, 0)
  })

  // Error tracking
  window.addEventListener('error', function (e) {
    track('error', e.message, {
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno,
      stack: e.error && e.error.stack ? e.error.stack.substring(0, 500) : null,
    })
  })

  window.addEventListener('unhandledrejection', function (e) {
    var msg = e.reason ? String(e.reason) : 'Unhandled Promise Rejection'
    track('error', msg, {
      stack:
        e.reason && e.reason.stack
          ? e.reason.stack.substring(0, 500)
          : null,
    })
  })

  // Public API
  window.AnalyticsProduct = {
    track: function (eventName, properties) {
      track('custom', eventName, properties)
    },
    identify: function (userId) {
      // Store for future events
      window._ap_uid = userId
    },
  }
})()
