#!/usr/bin/env node
// screendoro 렌더링 검증 폴백 (render-check.md 1절). 브라우저 패널이 없는 환경에서 Playwright로 같은 항목을 확인한다.
// 읽기 전용: 페이지 내용을 바꾸지 않는다. 캡처와 결과 JSON만 --out 폴더에 쓴다.
//
// 쓰는 법 (프로젝트 루트에서):
//   node <이 파일> <URL 또는 HTML 파일 경로> [옵션]
// 옵션:
//   --name <이름>        캡처 파일 이름 앞부분 (기본: page)
//   --out <폴더>         캡처와 결과를 쓸 폴더 (기본: .claude/screendoro-render)
//   --widths 375,768,1280  확인할 폭 (기본: 375,768,1280)
//   --dark               1280 폭에서 다크 모드로 한 번 더
//   --perf               1280 폭에서 LCP·CLS·전송량 측정 (랜딩·공개 페이지)
//   --approved           1280·375 캡처를 .claude/screendoro-approved/ 에 복사 (index.md는 직접 고친다)
//   --no-full            페이지 전체가 아니라 첫 화면만 캡처
//   --executable <경로>  Chromium 실행 파일 (환경 변수 SCREENDORO_CHROMIUM 도 된다)
//   --font <정규식>      house-check가 허용할 폰트 (폰트 예외 프로젝트, house-rules.md 1-1절). 예: --font "경기천년|Pretendard"
// 종료 코드: 0 실행됨(결과는 JSON으로 판단), 1 페이지를 열지 못함, 2 Playwright 없음
'use strict';
const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');

const args = process.argv.slice(2);
const flag = n => args.includes('--' + n);
const opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d; };
const valued = new Set(['--name', '--out', '--widths', '--executable', '--font']);
const target = args.find((a, i) => !a.startsWith('--') && !valued.has(args[i - 1]));
if (!target) { console.error('대상 URL이나 HTML 파일 경로가 필요하다. 예: node render-pw.cjs http://localhost:5173 --name home'); process.exit(1); }

// 프로젝트에 설치된 playwright를 먼저 찾고, 없으면 전역 설치를 찾는다. 설치는 하지 않는다.
let playwright;
for (const base of [path.join(process.cwd(), 'noop.js'), __filename]) {
  try { playwright = createRequire(base)('playwright'); break; } catch { /* 다음 후보 */ }
}
if (!playwright) { try { playwright = require('playwright'); } catch { /* 없음 */ } }
if (!playwright) {
  console.log(JSON.stringify({ ok: false, reason: 'playwright 없음', next: '사용자에게 설치를 묻는다. 묻지 않고 설치하지 않는다. 설치하지 않으면 렌더링 미검증으로 보고한다.' }, null, 1));
  process.exit(2);
}

const name = opt('name', 'page').replace(/[^\w.-]+/g, '-');
const outDir = path.resolve(opt('out', '.claude/screendoro-render'));
const widths = opt('widths', '375,768,1280').split(',').map(Number).filter(Boolean);
const url = /^(https?|file):/.test(target) ? target : 'file://' + path.resolve(target);
const here = __dirname;
const readScript = f => { try { return fs.readFileSync(path.join(here, f), 'utf8'); } catch { return null; } };
const houseCheck = readScript('house-check.js');
const designCheck = readScript('design-check.js');
fs.mkdirSync(outDir, { recursive: true });

const overflowJs = `(() => { const d = document.documentElement; const w = d.clientWidth;
  const over = d.scrollWidth > w + 1;
  const vp = document.querySelector('meta[name=viewport]');
  return { scrollWidth: d.scrollWidth, clientWidth: w, horizontalScroll: over, viewportMeta: vp ? vp.content : null,
    overflowing: over ? [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > w + 1).slice(0, 10).map(e => e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\\s+/).slice(0, 2).join('.') : '')) : [] }; })()`;

const smallTargetsJs = `(() => [...document.querySelectorAll('a, button, input, select, textarea, [role=button]')]
  .filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.width < 24 || r.height < 24); })
  .slice(0, 10).map(e => { const r = e.getBoundingClientRect(); return e.tagName.toLowerCase() + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) + ' ' + (e.innerText || e.value || e.getAttribute('aria-label') || '').trim().slice(0, 20); }))()`;

const focusJs = `(() => { const e = document.activeElement; if (!e || e === document.body) return null; const s = getComputedStyle(e);
  const visible = (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || s.boxShadow !== 'none';
  return { el: e.tagName.toLowerCase() + (e.id ? '#' + e.id : ''), text: (e.innerText || e.value || e.getAttribute('aria-label') || '').trim().slice(0, 20), focusVisible: visible }; })()`;

const perfJs = `(async () => { await new Promise(r => setTimeout(r, 3000));
  const buffered = type => new Promise(r => { const o = new PerformanceObserver(l => { r(l.getEntries()); o.disconnect(); }); o.observe({ type, buffered: true }); setTimeout(() => r([]), 500); });
  const lcp = (await buffered('largest-contentful-paint')).at(-1);
  let cls = 0; for (const e of await buffered('layout-shift')) if (!e.hadRecentInput) cls += e.value;
  const res = performance.getEntriesByType('resource');
  return { lcpMs: lcp ? Math.round(lcp.startTime) : null, lcpEl: lcp && lcp.element ? lcp.element.tagName : null, cls: +cls.toFixed(3),
    transferKB: Math.round(res.reduce((s, r) => s + (r.transferSize || 0), 0) / 1024),
    biggest: res.sort((a, b) => b.transferSize - a.transferSize).slice(0, 5).map(r => [r.name.split('/').pop(), Math.round(r.transferSize / 1024) + 'KB']) }; })()`;

const parse = v => { try { return typeof v === 'string' ? JSON.parse(v) : v; } catch { return v; } };

(async () => {
  const executablePath = opt('executable', process.env.SCREENDORO_CHROMIUM) || undefined;
  let browser;
  try { browser = await playwright.chromium.launch({ executablePath }); }
  catch (e) {
    console.log(JSON.stringify({ ok: false, reason: 'Chromium 실행 실패', detail: String(e.message).split('\n')[0], next: '--executable 로 Chromium 경로를 주거나, 사용자에게 브라우저 설치를 묻는다.' }, null, 1));
    process.exit(2);
  }

  const report = { ok: true, url, outDir, widths: {}, consoleErrors: [], failedRequests: [] };
  const passes = widths.map(w => ({ w, dark: false }));
  if (flag('dark')) passes.push({ w: 1280, dark: true });

  for (const { w, dark } of passes) {
    const mobile = w < 600;
    const context = await browser.newContext({ viewport: { width: w, height: mobile ? 812 : (w < 1000 ? 1024 : 800) }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1, colorScheme: dark ? 'dark' : 'light' });
    const page = await context.newPage();
    const key = w + (dark ? '-dark' : '');
    const errors = [], failed = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
    page.on('pageerror', e => errors.push('pageerror: ' + String(e.message).slice(0, 200)));
    page.on('requestfailed', r => failed.push(`${r.failure() ? r.failure().errorText : 'failed'} ${r.url().slice(0, 160)}`));
    page.on('response', r => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url().slice(0, 160)}`); });

    try { await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }); }
    catch { try { await page.goto(url, { waitUntil: 'load', timeout: 30000 }); } catch (e) {
      report.widths[key] = { error: '페이지를 열지 못함: ' + String(e.message).split('\n')[0] }; await context.close(); continue; } }
    await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
    await page.waitForTimeout(500);

    const r = {};
    const shot = path.join(outDir, `${name}-${key}.png`);
    await page.screenshot({ path: shot, fullPage: !flag('no-full') });
    r.screenshot = shot;
    r.layout = await page.evaluate(overflowJs);
    if (mobile) {
      r.smallTouchTargets = await page.evaluate(smallTargetsJs);
      if (!r.layout.viewportMeta) r.layout.warning = 'meta viewport 없음: 휴대폰에서 980px 폭으로 축소돼 보인다. <meta name="viewport" content="width=device-width, initial-scale=1">를 넣는다.';
    }
    const fontAllow = opt('font', null);
    if (fontAllow) await page.evaluate(f => { window.__screendoroFont = f; }, fontAllow);
    if (houseCheck) r.houseCheck = parse(await page.evaluate(houseCheck).catch(e => 'house-check 실패: ' + e.message));
    if (designCheck) r.designCheck = parse(await page.evaluate(designCheck).catch(e => 'design-check 실패: ' + e.message));

    if (w >= 1000 && !dark) {
      const order = [];
      for (let i = 0; i < 8; i++) {
        await page.keyboard.press('Tab');
        const f = await page.evaluate(focusJs);
        if (!f) continue;
        if (order.length && f.el === order[0].el && f.text === order[0].text) break; // 한 바퀴 돌았다
        order.push(f);
      }
      r.keyboardFocus = order;
      if (order.length) { const fshot = path.join(outDir, `${name}-${key}-focus.png`); await page.screenshot({ path: fshot }); r.focusScreenshot = fshot; }
      if (flag('perf')) {
        // 같은 컨텍스트는 방금 불러온 자원이 캐시에 있어 전송량·LCP가 실제보다 작게 나온다. 캐시가 빈 새 컨텍스트에서 잰다.
        const perfCtx = await browser.newContext({ viewport: { width: w, height: 800 }, deviceScaleFactor: 1 });
        const p2 = await perfCtx.newPage();
        await p2.goto(url, { waitUntil: 'load', timeout: 30000 }).catch(() => {});
        r.perf = await p2.evaluate(perfJs).catch(e => 'perf 실패: ' + e.message);
        r.perf_note = '캐시 없는 첫 방문 기준. 개발 서버나 로컬 파일 측정값이라 실제 배포 값과 다르다.';
        await perfCtx.close();
      }
    }
    report.widths[key] = r;
    for (const e of errors) if (!report.consoleErrors.includes(e)) report.consoleErrors.push(e);
    for (const f of failed) if (!report.failedRequests.includes(f)) report.failedRequests.push(f);
    await context.close();
  }
  await browser.close();

  if (flag('approved')) {
    const dir = path.resolve('.claude/screendoro-approved');
    fs.mkdirSync(dir, { recursive: true });
    report.approvedCopies = [];
    for (const w of [1280, 375]) {
      const src = path.join(outDir, `${name}-${w}.png`);
      if (fs.existsSync(src)) { const dst = path.join(dir, `${name}-${w}.png`); fs.copyFileSync(src, dst); report.approvedCopies.push(dst); }
    }
    report.approved_note = 'index.md 표에 이 화면을 "승인 대기"(시안이면 "승인")로 직접 적는다.';
  }

  if (Object.values(report.widths).every(v => v.error)) report.ok = false;
  const json = JSON.stringify(report, null, 1);
  fs.writeFileSync(path.join(outDir, `${name}-report.json`), json);
  console.log(json);
  process.exit(report.ok ? 0 : 1);
})();
