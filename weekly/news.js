// The table of contents defaults to open in HTML; retain the reader's toggle choice.
function revealPrinciples() {
  if (location.hash === '#why') {
    const details = document.querySelector('#why details');
    if (details) details.open = true;
  }
}
revealPrinciples();
addEventListener('hashchange', revealPrinciples);
function applyWeeklyLanguage() {
  const switchLink = document.querySelector('a.lang');
  if (!switchLink) return;
  const weeklyLanguage = code => /^zh(?:-|$)/i.test(code) ? 'zh' : 'en';
  const current = weeklyLanguage(document.documentElement.lang);
  const other = weeklyLanguage(switchLink.hreflang);
  switchLink.addEventListener('click', () => {
    try { localStorage.setItem('ohl_lang', JSON.stringify(other)); } catch {}
  });

  const requested = new URLSearchParams(location.search).get('lang');
  let saved;
  try {
    saved = localStorage.getItem('ohl_lang');
    try { saved = JSON.parse(saved); } catch {}
  } catch {}
  const preference = requested === 'en' || /^zh(?:-|$)/i.test(requested) ? requested : saved;
  if (typeof preference === 'string' && preference && weeklyLanguage(preference) !== current) {
    location.replace(switchLink.href + location.search + location.hash);
  }
}
applyWeeklyLanguage();
