// screendoro design-check: 만든 화면이 DESIGN.md 토큰과 레이아웃 문법을 지키는지 재는 스크립트.
// 이 파일 내용을 그대로 javascript_tool(또는 Playwright page.evaluate)에 넣는다.
// 읽기 전용: 페이지를 바꾸지 않는다 (잴 때 보이지 않는 측정용 요소를 잠깐 붙였다가 바로 지운다).
// 기준은 :root(또는 html, @theme/@layer 안)에 선언된 CSS 변수다. 이름 규칙은 design-setup.md 6절:
//   색 --color-*, 글자 크기 --text-*, 간격 --space-* (또는 Tailwind v4의 --spacing 배수), 반경 --radius-*
(() => {
  // ---------- 1. 토큰 모으기 ----------
  const vars = new Map();
  const walk = rules => {
    for (const r of rules) {
      if (r.cssRules && !(r instanceof CSSStyleRule)) { walk(r.cssRules); continue; }
      if (r instanceof CSSStyleRule && /(^|,)\s*(:root|html|:host)\b/.test(r.selectorText)) {
        for (const p of r.style) if (p.startsWith('--')) vars.set(p, r.style.getPropertyValue(p).trim());
        if (r.cssRules) walk(r.cssRules);
      }
    }
  };
  for (const sh of document.styleSheets) { try { walk(sh.cssRules); } catch { /* 다른 출처 스타일시트는 건너뜀 */ } }

  const probe = document.createElement('div');
  probe.setAttribute('aria-hidden', 'true');
  probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;left:-9999px;top:0;';
  document.body.appendChild(probe);
  const resolve = (prop, value) => { probe.style[prop] = ''; probe.style[prop] = value; return getComputedStyle(probe)[prop]; };

  const names = [...vars.keys()];
  const pick = re => names.filter(n => re.test(n) && !/^--[a-z]+-.*--/.test(n));
  // 색을 sRGB 정수로 바꾼다. rgb()는 바로 읽고, oklch()·color(srgb …)·color-mix 결과처럼
  // 계산값이 rgb가 아닌 색은 1x1 캔버스에 칠해 픽셀을 읽는다 (Tailwind v4 기본 팔레트가 oklch다).
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  const colorCache = new Map();
  const rgbOf = c => {
    if (!c || c === 'transparent') return null;
    if (colorCache.has(c)) return colorCache.get(c);
    let res = null;
    const m = c.match(/^rgba?\(([^)]+)\)$/);
    if (m) {
      const [r, g, b, a = '1'] = m[1].split(/[ ,/]+/).filter(Boolean);
      res = { r: Math.round(r), g: Math.round(g), b: Math.round(b), a: parseFloat(a) };
    } else if (cx) {
      cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1);
      const d = cx.getImageData(0, 0, 1, 1).data;
      res = d[3] === 0 ? { r: 0, g: 0, b: 0, a: 0 } : { r: d[0], g: d[1], b: d[2], a: Math.round(d[3] / 255 * 100) / 100 };
    }
    if (res) res.key = `${res.r},${res.g},${res.b}`;
    colorCache.set(c, res);
    return res;
  };
  // 변환 오차(투명도 섞인 색, 색역 변환)를 감안해 채널마다 2까지 같은 색으로 본다.
  const tokenFor = (map, rgb) => { if (map.has(rgb.key)) return map.get(rgb.key); for (const [k, n] of map) { const [r, g, b] = k.split(',').map(Number); if (Math.abs(r - rgb.r) <= 2 && Math.abs(g - rgb.g) <= 2 && Math.abs(b - rgb.b) <= 2) return n; } return null; };

  const colorTokens = new Map();
  for (const n of pick(/^--(color|clr)-/)) { const c = rgbOf(resolve('color', `var(${n})`)); if (c) colorTokens.set(c.key, n); }
  const sizeTokens = new Map();
  for (const n of pick(/^--(text|font-size|fs)-/)) { const v = parseFloat(resolve('fontSize', `var(${n})`)); if (v > 0) sizeTokens.set(Math.round(v * 10) / 10, n); }
  const spaceTokens = new Set([0]);
  for (const n of pick(/^--(space|spacing|gap)-/)) { const v = parseFloat(resolve('paddingLeft', `var(${n})`)); if (v >= 0) spaceTokens.add(Math.round(v * 10) / 10); }
  const spacingUnit = vars.has('--spacing') ? parseFloat(resolve('paddingLeft', 'var(--spacing)')) : 0;
  const radiusTokens = new Set([0]);
  for (const n of pick(/^--(radius|rounded)-/)) { const v = parseFloat(resolve('borderTopLeftRadius', `var(${n})`)); if (v >= 0) radiusTokens.add(Math.round(v * 10) / 10); }
  const accentName = names.find(n => /^--color-(primary|accent|brand)$/.test(n)) || names.find(n => /^--color-(primary|accent|brand)/.test(n));
  const accentKey = accentName ? rgbOf(resolve('color', `var(${accentName})`))?.key : null;
  probe.remove();

  // ---------- 2. 화면 요소 ----------
  const vis = e => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const name = e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
  const skip = e => e.closest('code, pre, kbd, samp, svg, iframe, video, canvas, [data-screendoro-ignore]');
  const all = [...document.querySelectorAll('body *')].filter(e => vis(e) && !skip(e)).slice(0, 5000);
  const hasText = e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(e.tagName);
  const group = () => new Map();
  const add = (m, k, el) => { const v = m.get(k) || { n: 0, els: [] }; v.n++; if (v.els.length < 3) v.els.push(name(el)); m.set(k, v); };
  const out = m => [...m.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 12).map(([k, v]) => [k, v.n, v.els]);
  const near = (set, v, tol = 0.6) => [...set].some(t => Math.abs(t - v) <= tol);
  const onSpacing = v => v <= 1 || near(spaceTokens, v) || (spacingUnit > 0 && Math.abs(v / spacingUnit - Math.round(v / spacingUnit)) < 0.05);

  const offSize = group(), offColor = group(), offSpace = group(), offRadius = group();
  const accentUse = { elements: 0, kinds: new Set() };
  for (const e of all) {
    const s = getComputedStyle(e);
    if (sizeTokens.size && hasText(e)) { const fs = parseFloat(s.fontSize); if (!near(new Set(sizeTokens.keys()), fs)) add(offSize, fs + 'px', e); }
    if (colorTokens.size) {
      const checks = [];
      if (hasText(e)) checks.push(['글자', s.color]);
      if (s.backgroundColor && !/rgba\(0, 0, 0, 0\)|transparent/.test(s.backgroundColor)) checks.push(['배경', s.backgroundColor]);
      for (const k of ['Top', 'Right', 'Bottom', 'Left']) if (parseFloat(s['border' + k + 'Width']) > 0 && s['border' + k + 'Style'] !== 'none') { checks.push(['테두리', s['border' + k + 'Color']]); break; }
      let usedAccent = false;
      for (const [kind, c] of checks) {
        const rgb = rgbOf(c); if (!rgb || rgb.a === 0) continue;
        const tok = tokenFor(colorTokens, rgb);
        if (!tok) add(offColor, `${kind} rgb(${rgb.key})${rgb.a < 1 ? ' a' + rgb.a : ''}`, e);
        if (accentName && tok === accentName) { usedAccent = true; accentUse.kinds.add(kind); }
      }
      if (usedAccent) accentUse.elements++;
    }
    if (spaceTokens.size > 1 || spacingUnit) {
      const vals = [['padding', s.paddingTop], ['padding', s.paddingRight], ['padding', s.paddingBottom], ['padding', s.paddingLeft], ['margin', s.marginTop], ['margin', s.marginBottom]];
      if (/grid|flex/.test(s.display)) vals.push(['gap', s.rowGap], ['gap', s.columnGap]);
      for (const [k, v] of vals) { const n = parseFloat(v); if (!isNaN(n) && n > 0 && !onSpacing(n)) add(offSpace, `${k} ${Math.round(n * 10) / 10}px`, e); }
    }
    if (radiusTokens.size > 1) {
      const r = parseFloat(s.borderTopLeftRadius);
      const h = e.getBoundingClientRect().height;
      const surfaced = !/rgba\(0, 0, 0, 0\)|transparent/.test(s.backgroundColor) || parseFloat(s.borderTopWidth) > 0 || s.boxShadow !== 'none';
      if (surfaced && r > 0 && r < h / 2 - 1 && r < 999 && !near(radiusTokens, r)) add(offRadius, Math.round(r * 10) / 10 + 'px', e);
    }
  }

  // ---------- 3. 레이아웃 반복 ----------
  const sig = (e, depth = 2) => {
    const s = getComputedStyle(e);
    const cols = s.display.includes('grid') ? s.gridTemplateColumns.split(' ').filter(Boolean).length : (s.display.includes('flex') ? s.flexDirection : '');
    const kids = [...e.children].filter(vis);
    return `${e.tagName}[${s.display}${cols ? ':' + cols : ''}]` + (depth > 0 ? '(' + kids.slice(0, 6).map(k => sig(k, depth - 1)).join(',') + (kids.length > 6 ? ',+' + (kids.length - 6) : '') + ')' : '');
  };
  // 섹션을 담은 상자를 찾는다. <main>이 없는 React/Vite 앱은 body 아래가 <div id="root"> 하나뿐이므로,
  // 보이는 큰 자식이 하나뿐인 동안 안으로 내려간다 (최대 6단계).
  const bigKids = el => [...el.children].filter(e => vis(e) && e.getBoundingClientRect().height > 120 && !/^(HEADER|FOOTER|NAV|SCRIPT|STYLE|ASIDE)$/.test(e.tagName));
  let root = document.querySelector('main') || document.body;
  for (let i = 0; i < 6; i++) { const k = bigKids(root); if (k.length !== 1) break; root = k[0].querySelector(':scope > main') || k[0]; }
  const sections = bigKids(root);
  const sectionSigs = sections.map(e => sig(e, 3));
  const repeatedNeighbours = [];
  for (let i = 1; i < sections.length; i++) if (sectionSigs[i] === sectionSigs[i - 1]) repeatedNeighbours.push(`${name(sections[i - 1])} = ${name(sections[i])}`);
  const pads = sections.map(e => { const s = getComputedStyle(e); return `${s.paddingTop}/${s.paddingBottom}`; });
  const uniformSectionPadding = sections.length >= 4 && new Set(pads).size === 1 ? pads[0] : null;
  const centeredGridSections = sections.filter(sec => {
    const h = sec.querySelector('h1, h2, h3'); if (!h || getComputedStyle(h).textAlign !== 'center') return false;
    return [...sec.querySelectorAll('*')].some(g => /grid|flex/.test(getComputedStyle(g).display) && [...g.children].filter(vis).length >= 3);
  }).map(name);

  const cardLike = e => { const s = getComputedStyle(e); return !/rgba\(0, 0, 0, 0\)|transparent/.test(s.backgroundColor) || parseFloat(s.borderTopWidth) > 0 || s.boxShadow !== 'none'; };
  const identicalCardGroups = [];
  for (const g of all) {
    if (!/grid|flex/.test(getComputedStyle(g).display)) continue;
    const kids = [...g.children].filter(vis);
    if (kids.length < 3 || !kids.every(cardLike)) continue;
    const rs = kids.map(k => k.getBoundingClientRect());
    const sameSize = rs.every(r => Math.abs(r.width - rs[0].width) < 2 && Math.abs(r.height - rs[0].height) < 2);
    const s0 = sig(kids[0], 2);
    if (sameSize && kids.every(k => sig(k, 2) === s0)) identicalCardGroups.push(`${name(g)} 안 ${kids.length}개`);
  }

  return JSON.stringify({
    viewport: `${innerWidth}x${innerHeight}`,
    tokens: { colors: colorTokens.size, sizes: sizeTokens.size, spaces: `${spaceTokens.size - 1}${spacingUnit ? ` + --spacing ${spacingUnit}px 배수` : ''}`, radii: radiusTokens.size - 1, accent: accentName || null },
    note: (colorTokens.size + sizeTokens.size + spaceTokens.size - 1 + radiusTokens.size - 1) === 0 && !spacingUnit ? '토큰 변수를 찾지 못해 값 검사를 건너뜀. design-setup.md 6절 이름 규칙으로 :root에 토큰을 선언했는지 확인한다.' : undefined,
    offScaleFontSize: out(offSize),
    offPaletteColor: out(offColor),
    offScaleSpacing: out(offSpace),
    offScaleRadius: out(offRadius),
    accentUsage: accentKey ? { elements: accentUse.elements, kinds: [...accentUse.kinds] } : null,
    sections: sections.length,
    distinctSectionShapes: new Set(sectionSigs).size,
    repeatedNeighbourSections: repeatedNeighbours,
    uniformSectionPadding,
    centeredTitleGridSections: centeredGridSections,
    identicalCardGroups: identicalCardGroups.slice(0, 10)
  }, null, 1);
})()
