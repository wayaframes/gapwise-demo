/* Landing page analytics: PostHog, started only after the visitor says yes.
   Loaded with <script defer src="assets/analytics.js"></script>. Filled in by website-kit init
   from kit.config.json (posthog.key and posthog.host). Do not edit the two lines below by hand.

   It never records a visitor's screen (no session recordings). What it records (names only, never what a visitor types):
     $pageview and $pageleave (PostHog does these), scroll_depth (25, 50, 75, 100 percent),
     booking_clicked, payment_clicked (which button, from data-utm-button), outbound_click, faq_opened.
   Every event carries the visit's first-touch tags (utm_source ... utm_term) so a booking click can be
   tied to the campaign that brought the visitor. */
(function () {
  'use strict';

  var POSTHOG_KEY  = 'phc_D6sEsVbEV2QjBJkjEvkFRqXMJAHYkWuzjSUbLAZXqVdu';
  var POSTHOG_HOST = 'https://us.i.posthog.com';
  var CONSENT_KEY  = 'site_analytics_consent';
  var TOUCH_KEY    = 'site_first_touch';   // written by attribution.js

  function getConsent() { try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; } }
  function setConsent(v) { try { localStorage.setItem(CONSENT_KEY, v); } catch (e) {} }
  function firstTouch() { try { return JSON.parse(localStorage.getItem(TOUCH_KEY) || 'null') || {}; } catch (e) { return {}; } }

  function assetHost() { return POSTHOG_HOST.replace('://us.i.', '://us-assets.i.').replace('://eu.i.', '://eu-assets.i.'); }

  function buttonOf(href) {
    var m = String(href || '').match(/[?&]utm_button=([a-z0-9_]+)/i);
    return m ? m[1] : '';
  }

  function wire(ph) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a') : null;
      if (!a) return;
      var kind = a.getAttribute('data-cta');
      var href = a.getAttribute('href') || '';
      var props = firstTouch();
      props.button = a.getAttribute('data-utm-button') || buttonOf(href) || a.id || '';
      props.path = location.pathname;
      // The visitor leaves the page right after these clicks, so send them at once instead of in the next batch.
      var now = { send_instantly: true };
      if (kind === 'book') ph.capture('booking_clicked', props, now);
      else if (kind === 'pay') ph.capture('payment_clicked', props, now);
      else if (/^https?:/i.test(href) && href.indexOf(location.host) === -1) { props.href = href.split('?')[0]; ph.capture('outbound_click', props); }
    }, true);

    var seen = {};
    function onScroll() {
      var h = document.documentElement;
      var total = h.scrollHeight - h.clientHeight;
      if (total <= 0) return;
      var pct = Math.round(((h.scrollTop || document.body.scrollTop) / total) * 100);
      [25, 50, 75, 100].forEach(function (m) {
        if (pct >= m && !seen[m]) { seen[m] = true; var p = firstTouch(); p.percent = m; p.path = location.pathname; ph.capture('scroll_depth', p); }
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    document.addEventListener('toggle', function (e) {
      var d = e.target;
      if (d && d.tagName === 'DETAILS' && d.open) {
        var q = d.querySelector('summary');
        var p = firstTouch(); p.question = q ? q.textContent.trim().slice(0, 120) : ''; ph.capture('faq_opened', p);
      }
    }, true);
  }

  function load() {
    if (window.__sitePHLoaded) return;
    if (!/^phc_/.test(POSTHOG_KEY)) return;          // no key set: record nothing
    window.__sitePHLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = assetHost() + '/static/array.js';
    s.onload = function () {
      window.posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        autocapture: false,                          // only the named events above, nothing typed into forms
        disable_session_recording: true,             // never record a visit as a video, even if the project has it switched on
        capture_pageview: true,
        capture_pageleave: true,
        persistence: 'localStorage+cookie',
        loaded: function (ph) { var t = firstTouch(); if (t.utm_source || t.utm_campaign) ph.register(t); wire(ph); }
      });
    };
    document.head.appendChild(s);
  }

  function banner() {
    var b = document.createElement('div');
    b.setAttribute('role', 'dialog');
    b.setAttribute('aria-label', 'Visit counting');
    b.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:9999;display:flex;gap:12px;flex-wrap:wrap;align-items:center;justify-content:space-between;padding:14px 16px;background:#fff;color:#111;border-top:1px solid #ccc;font:16px/1.4 system-ui,sans-serif';
    b.innerHTML = '<span>We count visits to this page to see what works. Nothing you type is recorded.</span>' +
      '<span><button type="button" data-c="no" style="min-height:44px;padding:0 16px;margin-right:8px">No thanks</button>' +
      '<button type="button" data-c="yes" style="min-height:44px;padding:0 16px;font-weight:600">OK</button></span>';
    b.addEventListener('click', function (e) {
      var c = e.target.getAttribute && e.target.getAttribute('data-c');
      if (!c) return;
      setConsent(c === 'yes' ? 'granted' : 'denied');
      b.remove();
      if (c === 'yes') load();
    });
    document.body.appendChild(b);
  }

  function start() {
    var c = getConsent();
    if (c === 'granted') load();
    else if (c !== 'denied' && /^phc_/.test(POSTHOG_KEY)) banner();   // with no key set there is nothing to ask about
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
