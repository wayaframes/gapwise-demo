/*
 * Gapwise landing page: link attribution engine.
 *
 * What it does, in plain words:
 *  - Reads the tracking tags (utm_source, utm_medium, utm_campaign, utm_content, utm_term)
 *    from the address a visitor arrives on.
 *  - Remembers the FIRST visit's tags in the browser (localStorage). Works without it.
 *  - Adds those tags to every booking and payment link on the page, keeping the
 *    utm_button tag that is written on each button.
 *  - No data is sent anywhere by this file. It only rewrites links.
 */

/* ------------------------------------------------------------------
 * CONFIG. PLACEHOLDERS. The Build skill's register step replaces both
 * values with the real booking and payment links.
 * ------------------------------------------------------------------ */
var GAPWISE_CONFIG = {
  BOOKING_URL: 'https://wayaframes.github.io/gapwise-demo/simulated.html',
  PAYMENT_URL: 'https://wayaframes.github.io/gapwise-demo/simulated.html'
};
/* ---------------------------- end CONFIG --------------------------- */

(function (root, factory) {
  var api = factory(root);
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.GapwiseAttribution = api;
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { api.init(); });
    } else {
      api.init();
    }
  }
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  var STORAGE_KEY = 'gapwise_first_touch';
  // Order in which tags appear on a link. utm_button is last.
  var TOUCH_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var ALL_KEYS = TOUCH_KEYS.concat(['utm_button']);
  var MAX_LEN = 100;

  function clean(value) {
    if (value === undefined || value === null) return '';
    return String(value).trim().slice(0, MAX_LEN);
  }

  function safeDecode(s) {
    try { return decodeURIComponent(s.replace(/\+/g, ' ')); } catch (e) { return s; }
  }

  // "?a=1&b=2" or "a=1&b=2" -> [['a','1'], ['b','2']] (decoded)
  function parsePairs(query) {
    var q = String(query || '').replace(/^\?/, '');
    if (!q) return [];
    return q.split('&').filter(Boolean).map(function (pair) {
      var i = pair.indexOf('=');
      if (i === -1) return [safeDecode(pair), ''];
      return [safeDecode(pair.slice(0, i)), safeDecode(pair.slice(i + 1))];
    });
  }

  // Only the five touch tags, only non-empty. First occurrence of a repeated key wins.
  function parseTouch(search) {
    var out = {};
    parsePairs(search).forEach(function (p) {
      if (TOUCH_KEYS.indexOf(p[0]) !== -1 && !(p[0] in out)) {
        var v = clean(p[1]);
        if (v) out[p[0]] = v;
      }
    });
    return out;
  }

  function hasTouch(t) {
    return !!t && TOUCH_KEYS.some(function (k) { return !!clean(t[k]); });
  }

  function normalise(t) {
    var out = {};
    TOUCH_KEYS.forEach(function (k) {
      var v = clean(t && t[k]);
      if (v) out[k] = v;
    });
    return out;
  }

  function readStored(storage) {
    try {
      if (!storage) return null;
      var raw = storage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var t = normalise(JSON.parse(raw));
      return hasTouch(t) ? t : null;
    } catch (e) {
      return null;
    }
  }

  function writeStored(storage, touch) {
    try {
      if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(touch));
    } catch (e) { /* storage blocked: carry on without it */ }
  }

  /*
   * resolveTouch: decide which tags to use on links.
   *  1. A tag set remembered from the first visit always wins (first touch).
   *  2. Otherwise tags on the current address are used and remembered.
   *  3. Otherwise the direct-visit defaults are used (not remembered, so a later
   *     real touch can still become the first touch).
   * Returns { touch, source } where source is 'stored' | 'incoming' | 'defaults' | 'none'.
   */
  function resolveTouch(search, storage, defaults) {
    var stored = readStored(storage);
    if (stored) return { touch: stored, source: 'stored' };
    var incoming = parseTouch(search);
    if (hasTouch(incoming)) {
      writeStored(storage, incoming);
      return { touch: incoming, source: 'incoming' };
    }
    var d = normalise(defaults);
    if (hasTouch(d)) return { touch: d, source: 'defaults' };
    return { touch: {}, source: 'none' };
  }

  /*
   * buildLink(root, parts): add tags to a link.
   *  - root: the link, may already have a ?query and/or a #fragment.
   *  - parts: { utm_source, utm_medium, utm_campaign, utm_content, utm_term, utm_button }
   * Rules: exactly one '?', params joined with '&', no repeated tag, tags before any
   * #fragment, other existing params kept, an existing utm_button kept unless
   * parts gives a new one. Empty values are skipped.
   */
  function buildLink(rootUrl, parts) {
    var url = String(rootUrl || '');
    var fragment = '';
    var h = url.indexOf('#');
    if (h !== -1) { fragment = url.slice(h); url = url.slice(0, h); }
    var query = '';
    var q = url.indexOf('?');
    if (q !== -1) { query = url.slice(q + 1); url = url.slice(0, q); }

    var wanted = {};
    ALL_KEYS.forEach(function (k) {
      var v = clean(parts && parts[k]);
      if (v) wanted[k] = v;
    });

    var seen = {};
    var kept = [];
    parsePairs(query).forEach(function (p) {
      var k = p[0];
      if (!k || seen[k]) return;          // drop repeats
      seen[k] = true;
      if (k in wanted) return;            // replaced below
      kept.push([k, p[1]]);
    });

    // Rebuild: other params first (as they were), then tags in a fixed order.
    var others = kept.filter(function (p) { return ALL_KEYS.indexOf(p[0]) === -1; });
    var existingUtm = {};
    kept.forEach(function (p) { if (ALL_KEYS.indexOf(p[0]) !== -1) existingUtm[p[0]] = p[1]; });

    var pairs = others.slice();
    ALL_KEYS.forEach(function (k) {
      if (k in wanted) pairs.push([k, wanted[k]]);
      else if (k in existingUtm && clean(existingUtm[k])) pairs.push([k, clean(existingUtm[k])]);
    });

    var qs = pairs.map(function (p) {
      return encodeURIComponent(p[0]) + '=' + encodeURIComponent(p[1]);
    }).join('&');

    return url + (qs ? '?' + qs : '') + fragment;
  }

  // Read the utm_button already written on a link, if any.
  function buttonOf(href) {
    var s = String(href || '');
    var h = s.indexOf('#'); if (h !== -1) s = s.slice(0, h);
    var q = s.indexOf('?');
    if (q === -1) return '';
    var found = '';
    parsePairs(s.slice(q + 1)).forEach(function (p) {
      if (p[0] === 'utm_button' && !found) found = clean(p[1]);
    });
    return found;
  }

  // Rewrite every booking and payment link on the page.
  function decorateLinks(doc, touch, config) {
    var links = doc.querySelectorAll('a[data-cta]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var kind = a.getAttribute('data-cta');
      var base = kind === 'pay' ? config.PAYMENT_URL : config.BOOKING_URL;
      if (!base) continue;
      var parts = {};
      TOUCH_KEYS.forEach(function (k) { if (touch[k]) parts[k] = touch[k]; });
      parts.utm_button = buttonOf(a.getAttribute('href'));
      a.setAttribute('href', buildLink(base, parts));
    }
  }

  function getStorage() {
    try { return root.localStorage || null; } catch (e) { return null; }
  }

  function init() {
    var cfg = (typeof GAPWISE_CONFIG !== 'undefined') ? GAPWISE_CONFIG : {};
    var search = (root.location && root.location.search) || '';
    var result = resolveTouch(search, getStorage(), root.GAPWISE_ATTR_DEFAULTS);
    decorateLinks(root.document, result.touch, cfg);
    return result;
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    TOUCH_KEYS: TOUCH_KEYS,
    parseTouch: parseTouch,
    resolveTouch: resolveTouch,
    buildLink: buildLink,
    buttonOf: buttonOf,
    decorateLinks: decorateLinks,
    init: init
  };
});
