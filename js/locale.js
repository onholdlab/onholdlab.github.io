/* Text catalogs only; existing language menus own their UI. */
(function () {
  'use strict';
  var base = new URL('../i18n/', document.currentScript.src);
  var catalogs = Object.create(null), language = 'en', hasSavedLanguage = false;
  var legacy = null;
  function normalize(code) { return code === 'zh' ? 'zh-Hant' : code; }
  function valid(code) { return typeof code === 'string' && /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(code); }
  function selected() {
    var saved;
    try { saved = localStorage.getItem('ohl_lang'); try { saved = JSON.parse(saved); } catch (_) {} } catch (_) {}
    if (valid(saved)) { hasSavedLanguage = true; return normalize(saved); }
    return /^zh/i.test(navigator.language || '') ? 'zh-Hant' : 'en';
  }
  function load(code) {
    if (!valid(code)) return Promise.resolve();
    return fetch(new URL(code + '.json', base)).then(function (r) {
      if (!r.ok) throw new Error('catalog');
      return r.json();
    }).then(function (data) { catalogs[code] = data; }).catch(function () {});
  }
  function t(key, params, locale) {
    var code = normalize(locale || language), data = catalogs[code] || {};
    var value = Object.prototype.hasOwnProperty.call(data, key) ? data[key] : undefined;
    if (value == null && legacy) value = legacy(key, code);
    if (value == null) value = Object.prototype.hasOwnProperty.call(catalogs.en || {}, key) ? catalogs.en[key] : key;
    if (typeof value !== 'string') return value;
    return value.replace(/\{([A-Za-z][A-Za-z0-9_]*)\}/g, function (match, name) {
      return params && Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match;
    });
  }
  function setLanguage(code, persist) {
    language = normalize(code);
    if (persist === false) return;
    try { localStorage.setItem('ohl_lang', JSON.stringify(code)); } catch (_) {}
  }
  language = selected();
  // Keep language links while giving the player's saved preference priority.
  try { var requested = new URLSearchParams(location.search).get('lang'); if (!hasSavedLanguage && valid(requested)) language = normalize(requested); } catch (_) {}
  window.OHLi18n = { t: t, setLanguage: setLanguage, get language() { return language; },
    legacy: function (lookup) { legacy = lookup; },
    load: load, ready: Promise.all(['en', 'zh-Hant'].concat(language === 'en' || language === 'zh-Hant' ? [] : [language]).map(load)) };
})();
