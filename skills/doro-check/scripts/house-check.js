// screendoro house-rules 점검 스크립트. 이 파일 내용을 그대로 javascript_tool에 넣는다.
// 읽기 전용: 페이지를 바꾸지 않는다. 결과의 각 목록이 비어 있어야 통과다.
// 폰트 예외(house-rules.md)가 기록된 프로젝트면 실행 전에 허용 폰트를 정규식 문자열로 준다:
//   window.__screendoroFont = '경기천년|gyeonggi|Pretendard';   (render.cjs는 --font 옵션)
(() => {
  const fontRe = new RegExp(window.__screendoroFont || '경기천년|gyeonggi', 'i');
  const surfaced = s => (s.backgroundColor !== 'rgba(0, 0, 0, 0)' && s.backgroundColor !== 'transparent') || s.backgroundImage !== 'none' || borderSides(s).length > 0 || s.boxShadow !== 'none';
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
    // 표의 칸 테두리는 표 테두리와 붙어 있는 것이 정상이라 겹침 검사에서 뺀다.
    if (fullBorder(s) && !/^(TD|TH|TR|THEAD|TBODY|TFOOT|CAPTION|COL|COLGROUP)$/.test(e.tagName)) {
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
  // 본문 문장 속 링크: 링크를 감싼 가장 가까운 블록에 링크 글자 말고도 문장이 있으면 본문으로 본다 (p가 아닌 div 안의 문장도 포함).
  const inProse = e => {
    if (e.tagName !== 'A' || e.closest('nav, header, footer, button, [role=button], [role=navigation], [role=tablist], [role=menu]')) return false;
    let b = e.parentElement;
    while (b && b !== document.body && /^inline/.test(getComputedStyle(b).display)) b = b.parentElement;
    if (!b) return false;
    const own = (e.innerText || '').trim().length, around = (b.innerText || '').trim().length;
    return around - own >= 20;
  };
  // 탭·현재 위치 표시처럼 상태를 알리는 선은 기능이라 밑줄로 보지 않는다.
  const isStateMark = e => e.matches('[aria-selected=true], [aria-current]:not([aria-current=false]), [role=tab], [data-state=active]') || !!e.closest('[role=tablist]');
  const underline = [];
  for (const e of all) {
    const s = getComputedStyle(e);
    if (/underline|line-through|overline/.test(s.textDecorationLine) && !inProse(e) && !/^(DEL|S|INS)$/.test(e.tagName)) underline.push([name(e), 'text-decoration: ' + s.textDecorationLine, (e.innerText || '').trim().slice(0, 20)]);
    const bs = borderSides(s);
    if (bs.length === 1 && bs[0] === 'Bottom' && /^(H[1-6]|A|SPAN|BUTTON|LABEL|STRONG|EM)$/.test(e.tagName) && !isStateMark(e)) underline.push([name(e), 'border-bottom 밑줄', (e.innerText || '').trim().slice(0, 20)]);
    for (const pe of ['::before', '::after']) {
      const ps = getComputedStyle(e, pe);
      if (ps.content === 'none' || ps.content === 'normal') continue;
      const h = parseFloat(ps.height), w = parseFloat(ps.width);
      const filled = ps.backgroundColor !== 'rgba(0, 0, 0, 0)' || ps.backgroundImage !== 'none' || borderSides(ps).length;
      if (filled && h > 0 && h <= 6 && w > h * 3) underline.push([name(e) + pe, `장식 막대 ${Math.round(w)}x${Math.round(h)}`, (e.innerText || '').trim().slice(0, 20)]);
    }
  }

  // 3. 버튼 반경
  // 버튼 후보: 버튼 요소 + 버튼처럼 보이는 링크(클래스 이름과 상관없이 면이 있고 안쪽 여백이 있는 a).
  // 면(배경·테두리·그림자)이 없는 버튼(아코디언 머리, 탭, 아이콘 버튼 등)은 모서리가 보이지 않으므로 반경 검사에서 뺀다.
  const linkButton = e => { const s = getComputedStyle(e); return surfaced(s) && parseFloat(s.paddingLeft) >= 8 && parseFloat(s.paddingTop) >= 4 && !inProse(e); };
  const candidates = [...document.querySelectorAll('button, [role=button], input[type=submit], input[type=button], input[type=reset], a')].filter(vis).filter(e => e.tagName !== 'A' || e.matches('[role=button]') || linkButton(e));
  const btns = candidates.filter(e => surfaced(getComputedStyle(e)));
  const radiusOf = e => { const s = getComputedStyle(e); return Math.min(...['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'].map(k => parseFloat(s['border' + k + 'Radius']) || 0)); };
  const squareButtons = btns.filter(e => radiusOf(e) < 8).map(e => [name(e), radiusOf(e) + 'px', (e.innerText || e.value || '').trim().slice(0, 20)]);
  const radii = [...new Set(btns.map(e => Math.round(radiusOf(e)) + 'px'))];

  // 4. 폰트
  const textEls = all.filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()));
  const isGG = f => fontRe.test(f);
  // 아이콘 폰트는 글자가 아니라 그림이고, 고정폭 폰트는 house-rules 1절 예외(숫자·코드)라 위반이 아니라 참고로 따로 낸다.
  const isIconFont = f => /icon|symbol|awesome|phosphor|remix|bootstrap-icons|ionicons|lucide|tabler/i.test(f);
  const isMono = f => /mono|code|consol|courier|menlo|^monospace$/i.test(f);
  const otherFont = {}, monoFont = {};
  for (const e of textEls) {
    if (/^(CODE|PRE|KBD|SAMP)$/.test(e.tagName) || e.closest('svg, [aria-hidden=true]')) continue;
    const f = getComputedStyle(e).fontFamily.split(',')[0].replace(/["']/g, '').trim();
    if (isGG(f) || isIconFont(f)) continue;
    const bucket = isMono(f) ? monoFont : otherFont;
    (bucket[f] = bucket[f] || []).push(name(e));
  }
  const fontLoaded = [...document.fonts].filter(f => /경기천년|gyeonggi/i.test(f.family)).map(f => `${f.family} ${f.weight} ${f.status}`);

  return JSON.stringify({
    viewport: `${innerWidth}x${innerHeight}`,
    doubleBorder: doubleBorder.slice(0, 20),
    underline: underline.slice(0, 20),
    squareButtons: squareButtons.slice(0, 20),
    buttonRadii: radii,
    allowedFont: fontRe.source,
    nonGyeonggiFont: Object.entries(otherFont).map(([f, els]) => [f, els.length, els.slice(0, 3)]),
    monospaceFont_참고: Object.entries(monoFont).map(([f, els]) => [f, els.length, els.slice(0, 3)]),
    unsurfacedButtonsSkipped: candidates.length - btns.length,
    gyeonggiFontFaces: fontLoaded.length ? fontLoaded : (window.__screendoroFont ? '경기천년체 없음 (폰트 예외 프로젝트면 정상)' : '없음 (경기천년체 @font-face가 선언되지 않음)'),
    note: '불필요한 장식 요소(eyebrow, 블롭, 장식 아이콘 등)는 스크립트로 다 잡히지 않는다. 캡처를 보고 house-rules.md로 확인한다.'
  }, null, 1);
})()
