// screendoro launch check: things that make a page look unfinished.
// Runs inside the page (render.cjs injects it). Read-only.
(() => {
  const vis = e => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const name = e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
  const text = e => (e.innerText || e.value || '').trim().slice(0, 30);

  const imgNoAlt = [...document.images].filter(i => !i.hasAttribute('alt')).map(i => (i.getAttribute('src') || '').split('/').pop().slice(0, 40));

  const deadLinks = [...document.querySelectorAll('a')].filter(vis).filter(a => {
    if (a.matches('[role=button], [aria-disabled=true]')) return false;
    const h = a.getAttribute('href');
    return h === null || h.trim() === '' || h.trim() === '#' || /^javascript:/i.test(h.trim());
  }).map(a => `${name(a)} "${text(a)}"`);

  const labelled = e => {
    if ((e.getAttribute('aria-label') || '').trim() || (e.getAttribute('title') || '').trim()) return true;
    const by = e.getAttribute('aria-labelledby');
    if (by && by.split(/\s+/).some(id => (document.getElementById(id)?.innerText || '').trim())) return true;
    if (e.labels && [...e.labels].some(l => l.innerText.trim())) return true;
    if (/^(BUTTON|A)$/.test(e.tagName) || e.getAttribute('role') === 'button') {
      if ((e.innerText || '').trim()) return true;
      if ([...e.querySelectorAll('img[alt], svg title')].some(x => (x.getAttribute('alt') || x.textContent || '').trim())) return true;
    }
    if (e.matches('input[type=submit], input[type=button], input[type=reset]') && (e.value || '').trim()) return true;
    return false;
  };
  const unnamedControls = [...document.querySelectorAll('button, a[href], input:not([type=hidden]), select, textarea, [role=button]')]
    .filter(vis).filter(e => !labelled(e)).slice(0, 15).map(e => `${name(e)}${e.placeholder ? ` (placeholder only: "${e.placeholder.slice(0, 20)}")` : ''}`);

  const linkText = [...document.querySelectorAll('a')].map(a => `${a.innerText} ${a.getAttribute('href') || ''}`).join(' ');

  return JSON.stringify({
    title: document.title.trim() || null,
    lang: document.documentElement.lang || null,
    description: !!document.querySelector('meta[name=description]')?.content?.trim(),
    ogImage: !!document.querySelector('meta[property="og:image"]')?.content?.trim(),
    favicon: !!document.querySelector('link[rel~=icon]'),
    legalLinks: /개인정보|privacy|이용약관|terms/i.test(linkText),
    imgNoAlt: imgNoAlt.slice(0, 15),
    deadLinks: deadLinks.slice(0, 15),
    unnamedControls
  });
})()
