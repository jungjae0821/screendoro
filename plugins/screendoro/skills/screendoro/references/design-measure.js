// screendoro design-reference D단계 측정 스크립트. 이 파일 내용을 그대로 javascript_tool에 넣는다.
// 읽기 전용: 페이지를 바꾸지 않는다. 뷰포트 1280x800, 쿠키 배너를 닫은 뒤 실행한다.
(() => {
  const vis = e => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0'; };
  const hasText = e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
  const top = (arr, n = 6) => Object.entries(arr.reduce((m, v) => (m[v] = (m[v] || 0) + 1, m), {})).sort((a, b) => b[1] - a[1]).slice(0, n);
  const all = [...document.querySelectorAll('body *')].filter(vis).slice(0, 4000);
  const textEls = all.filter(hasText);
  const st = e => getComputedStyle(e);

  // 별칭 폰트 이름을 실제 파일로 풀기
  const faces = [];
  for (const sh of document.styleSheets) { let rules; try { rules = sh.cssRules; } catch { continue; }
    for (const r of rules) if (r.constructor.name === 'CSSFontFaceRule') faces.push([r.style.getPropertyValue('font-family').replace(/["']/g, ''), (r.style.getPropertyValue('src').match(/url\(["']?([^"')]+)/) || [])[1]?.split('/').pop()?.slice(0, 50), r.style.getPropertyValue('font-weight')]); }
  const usedFams = top(textEls.map(e => st(e).fontFamily.split(',')[0].replace(/["']/g, '').trim()), 5);
  const fontFiles = usedFams.map(([f]) => [f, [...new Set(faces.filter(x => x[0].trim() === f).map(x => `${x[2] || ''} ${x[1] || ''}`))].slice(0, 3)]);

  // 글자 크기 단계: 크기별 대표 요소
  const bySize = {};
  for (const e of textEls) { const s = st(e); const k = s.fontSize; if (!bySize[k]) bySize[k] = { n: 0, weight: s.fontWeight, lh: s.lineHeight, ls: s.letterSpacing, tt: s.textTransform, sample: e.innerText.trim().slice(0, 24) }; bySize[k].n++; }
  const scale = Object.entries(bySize).sort((a, b) => parseFloat(b[0]) - parseFloat(a[0])).slice(0, 10);

  const pageBg = (() => { for (const e of [document.body, document.documentElement, document.querySelector('main')]) { if (!e) continue; const c = st(e).backgroundColor; if (c !== 'rgba(0, 0, 0, 0)') return c; } return 'transparent(흰색 추정)'; })();
  const header = document.querySelector('header, [class*=header]');
  const firstFold = [...document.querySelectorAll('img, video')].filter(vis).filter(e => e.getBoundingClientRect().top < innerHeight).map(e => { const r = e.getBoundingClientRect(); return `${Math.round(r.width)}x${Math.round(r.height)}@${Math.round(r.left)},${Math.round(r.top)}`; }).slice(0, 6);

  return JSON.stringify({
    host: location.host, viewport: `${innerWidth}x${innerHeight}`, pageBg,
    fonts: fontFiles,
    scale,
    textColors: top(textEls.map(e => st(e).color)),
    bgColors: top(all.map(e => st(e).backgroundColor).filter(c => c !== 'rgba(0, 0, 0, 0)')),
    radii: top(all.map(e => st(e).borderRadius).filter(r => r !== '0px'), 4),
    motion: top(all.map(e => { const s = st(e); return s.transitionDuration === '0s' ? null : `${s.transitionDuration} ${s.transitionTimingFunction}`; }).filter(Boolean), 4),
    maxWidths: top(all.filter(e => st(e).maxWidth !== 'none' && e.getBoundingClientRect().width > 500).map(e => st(e).maxWidth), 4),
    gaps: top(all.filter(e => /grid|flex/.test(st(e).display) && e.children.length > 2).map(e => st(e).gap).filter(g => g !== 'normal' && g !== '0px'), 5),
    headerH: header ? Math.round(header.getBoundingClientRect().height) : null,
    firstFoldMedia: firstFold,
  });
})()
