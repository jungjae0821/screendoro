// screendoro house-rules 5절 점검 스크립트. 이 파일 내용을 그대로 javascript_tool에 넣는다.
// 읽기 전용: 페이지를 바꾸지 않는다. 결과의 각 목록이 비어 있어야 통과다.
(() => {
  const vis = e => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const name = e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
  const sides = ['Top', 'Right', 'Bottom', 'Left'];
  const borderSides = s => sides.filter(k => parseFloat(s['border' + k + 'Width']) > 0 && s['border' + k + 'Style'] !== 'none' && s['border' + k + 'Style'] !== 'hidden');
  const fullBorder = s => borderSides(s).length === 4;
  // 블러 0, 퍼짐 1px 이상인 그림자 = 테두리 역할
  const ringShadow = s => s.boxShadow !== 'none' && s.boxShadow.split(/,(?![^(]*\))/).some(p => /(^|\s)0px 0px 0px [1-9][\d.]*px/.test(p.trim()) || /(^|\s)-?[\d.]+px -?[\d.]+px 0px [1-9][\d.]*px/.test(p.trim()));
  const all = [...document.querySelectorAll('body *')].filter(vis).slice(0, 5000);
  const active = document.activeElement;

  // 1. 이중 테두리
  const doubleBorder = [];
  for (const e of all) {
    const s = getComputedStyle(e);
    const bs = borderSides(s);
    if (bs.some(k => s['border' + k + 'Style'] === 'double')) { doubleBorder.push([name(e), 'border-style: double']); continue; }
    if (bs.length && e !== active && s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) doubleBorder.push([name(e), 'border + outline']);
    if (bs.length && ringShadow(s)) doubleBorder.push([name(e), 'border + 테두리형 box-shadow']);
    if (bs.length && /inset/.test(s.boxShadow)) doubleBorder.push([name(e), 'border + inset shadow']);
    if (fullBorder(s)) {
      let p = e.parentElement;
      while (p && p !== document.body && !fullBorder(getComputedStyle(p))) p = p.parentElement;
      if (p && p !== document.body) {
        const a = p.getBoundingClientRect(), b = e.getBoundingClientRect();
        const gap = Math.min(b.top - a.top, a.right - b.right, a.bottom - b.bottom, b.left - a.left);
        if (gap >= 0 && gap < 16) doubleBorder.push([name(e), `${name(p)} 안 ${Math.round(gap)}px 간격 테두리`]);
      }
    }
  }

  // 2. 밑줄 (본문 문장 속 링크는 예외)
  const inProse = e => e.tagName === 'A' && e.closest('p, li, dd, td, blockquote, figcaption') && !e.closest('nav, header, footer, button, [role=button], [role=navigation]');
  const underline = [];
  for (const e of all) {
    const s = getComputedStyle(e);
    if (/underline|line-through|overline/.test(s.textDecorationLine) && !inProse(e)) underline.push([name(e), 'text-decoration: ' + s.textDecorationLine, (e.innerText || '').trim().slice(0, 20)]);
    const bs = borderSides(s);
    if (bs.length === 1 && bs[0] === 'Bottom' && /^(H[1-6]|A|SPAN|BUTTON|LABEL|STRONG|EM)$/.test(e.tagName)) underline.push([name(e), 'border-bottom 밑줄', (e.innerText || '').trim().slice(0, 20)]);
    for (const pe of ['::before', '::after']) {
      const ps = getComputedStyle(e, pe);
      if (ps.content === 'none' || ps.content === 'normal') continue;
      const h = parseFloat(ps.height), w = parseFloat(ps.width);
      const filled = ps.backgroundColor !== 'rgba(0, 0, 0, 0)' || ps.backgroundImage !== 'none' || borderSides(ps).length;
      if (filled && h > 0 && h <= 6 && w > h * 3) underline.push([name(e) + pe, `장식 막대 ${Math.round(w)}x${Math.round(h)}`, (e.innerText || '').trim().slice(0, 20)]);
    }
  }

  // 3. 버튼 반경
  const btns = [...document.querySelectorAll('button, [role=button], input[type=submit], input[type=button], input[type=reset], a[class*=btn], a[class*=button]')].filter(vis);
  const radiusOf = e => { const s = getComputedStyle(e); return Math.min(...['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'].map(k => parseFloat(s['border' + k + 'Radius']) || 0)); };
  const squareButtons = btns.filter(e => radiusOf(e) < 8).map(e => [name(e), radiusOf(e) + 'px', (e.innerText || e.value || '').trim().slice(0, 20)]);
  const radii = [...new Set(btns.map(e => Math.round(radiusOf(e)) + 'px'))];

  // 4. 폰트
  const textEls = all.filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()));
  const isGG = f => /경기천년|gyeonggi/i.test(f);
  const otherFont = {};
  for (const e of textEls) { const f = getComputedStyle(e).fontFamily.split(',')[0].replace(/["']/g, '').trim(); if (!isGG(f) && !/^(CODE|PRE|KBD|SAMP)$/.test(e.tagName)) (otherFont[f] = otherFont[f] || []).push(name(e)); }
  const fontLoaded = [...document.fonts].filter(f => isGG(f.family)).map(f => `${f.family} ${f.weight} ${f.status}`);

  return JSON.stringify({
    viewport: `${innerWidth}x${innerHeight}`,
    doubleBorder: doubleBorder.slice(0, 20),
    underline: underline.slice(0, 20),
    squareButtons: squareButtons.slice(0, 20),
    buttonRadii: radii,
    nonGyeonggiFont: Object.entries(otherFont).map(([f, els]) => [f, els.length, els.slice(0, 3)]),
    gyeonggiFontFaces: fontLoaded.length ? fontLoaded : '없음 (경기천년체 @font-face가 선언되지 않음)',
    note: '불필요한 장식 요소(eyebrow, 블롭, 장식 아이콘 등)는 스크립트로 다 잡히지 않는다. 캡처를 보고 house-rules.md 4절로 확인한다.'
  }, null, 1);
})()
