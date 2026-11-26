#!/usr/bin/env node
// screendoro render check. Opens a page in Playwright at several widths, takes screenshots,
// runs house-check.js, design-check.js, and launch-check.js, and sorts findings into
// "required" (fix before done) and "recommended" (fix if easy, else report).
// Read-only: it never changes the page. It writes screenshots and a JSON report only.
//
//   node render.cjs <url or html file> [options]
//
//   --name <name>          file name prefix (default: page)
//   --out <dir>            output folder (default: screendoro/render)
//   --widths 375,768,1280  widths to check (default: 375,768,1280)
//   --public               public page (landing, marketing): also measure LCP/CLS and check meta tags
//   --dark                 one more pass at 1280 in dark mode
//   --font <regex>         fonts house-check allows besides Gyeonggi, e.g. "경기천년|Pretendard"
//   --no-full              capture the first screen only
//   --executable <path>    Chromium binary (or env SCREENDORO_CHROMIUM)
//
// Exit codes: 0 no required items, 3 required items found, 1 page did not open, 2 Playwright missing.
'use strict';
const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');

const args = process.argv.slice(2);
const flag = n => args.includes('--' + n);
const opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d; };
const valued = new Set(['--name', '--out', '--widths', '--executable', '--font']);
const target = args.find((a, i) => !a.startsWith('--') && !valued.has(args[i - 1]));
if (!target) { console.error('usage: node render.cjs <url or html file> [--name home] [--public]'); process.exit(1); }

// Use the project's Playwright, then a global one. Never install it.
let playwright;
for (const base of [path.join(process.cwd(), 'noop.js'), __filename]) {
  try { playwright = createRequire(base)('playwright'); break; } catch { /* next */ }
}
if (!playwright) { try { playwright = require('playwright'); } catch { /* none */ } }
if (!playwright) {
  console.log(JSON.stringify({ ok: false, reason: 'playwright not found', next: 'Ask the user whether to install it. Without it, report rendering as unverified.' }, null, 1));
  process.exit(2);
}

const name = opt('name', 'page').replace(/[^\w.-]+/g, '-');
const outDir = path.resolve(opt('out', 'screendoro/render'));
const widths = opt('widths', '375,768,1280').split(',').map(Number).filter(Boolean);
const url = /^(https?|file):/.test(target) ? target : 'file://' + path.resolve(target);
const readScript = f => { try { return fs.readFileSync(path.join(__dirname, f), 'utf8'); } catch { return null; } };
const houseCheck = readScript('house-check.js');
const designCheck = readScript('design-check.js');
const launchCheck = readScript('launch-check.js');
fs.mkdirSync(outDir, { recursive: true });

const layoutJs = `(() => { const d = document.documentElement; const w = d.clientWidth; const over = d.scrollWidth > w + 1;
  const vp = document.querySelector('meta[name=viewport]');
  return { horizontalScroll: over, scrollWidth: d.scrollWidth, clientWidth: w, viewportMeta: vp ? vp.content : null,
    overflowing: over ? [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > w + 1).slice(0, 5).map(e => e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\\s+/)[0] : '')) : [] }; })()`;

const smallTargetsJs = `(() => [...document.querySelectorAll('a, button, input, select, textarea, [role=button]')]
  .filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.width < 24 || r.height < 24); })
  .slice(0, 10).map(e => { const r = e.getBoundingClientRect(); return e.tagName.toLowerCase() + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) + ' ' + (e.innerText || e.value || e.getAttribute('aria-label') || '').trim().slice(0, 20); }))()`;

const focusJs = `(() => { const e = document.activeElement; if (!e || e === document.body) return null; const s = getComputedStyle(e);
  const visible = (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || s.boxShadow !== 'none';
  return { idx: [...document.querySelectorAll('*')].indexOf(e), el: e.tagName.toLowerCase() + (e.id ? '#' + e.id : ''), text: (e.innerText || e.value || e.getAttribute('aria-label') || '').trim().slice(0, 20), visible }; })()`;

const perfJs = `(async () => { await new Promise(r => setTimeout(r, 3000));
  const buffered = type => new Promise(r => { const o = new PerformanceObserver(l => { r(l.getEntries()); o.disconnect(); }); o.observe({ type, buffered: true }); setTimeout(() => r([]), 500); });
  const lcp = (await buffered('largest-contentful-paint')).at(-1);
  let cls = 0; for (const e of await buffered('layout-shift')) if (!e.hadRecentInput) cls += e.value;
  const res = performance.getEntriesByType('resource');
  return { lcpMs: lcp ? Math.round(lcp.startTime) : null, lcpEl: lcp && lcp.element ? lcp.element.tagName : null, cls: +cls.toFixed(3),
    transferKB: Math.round(res.reduce((s, r) => s + (r.transferSize || 0), 0) / 1024) }; })()`;

const parse = v => { try { return typeof v === 'string' ? JSON.parse(v) : v; } catch { return v; } };
// design-check items look like [value, count, [elements]]; house-check items like [element, reason, text].
const item = x => {
  if (!Array.isArray(x)) return String(x);
  if (typeof x[1] === 'number' && Array.isArray(x[2])) return `${x[0]} ×${x[1]} (${[...new Set(x[2])].join(', ')})`;
  return x.filter(Boolean).join(' ');
};
const short = list => list.slice(0, 3).map(item).join('; ') + (list.length > 3 ? ` (+${list.length - 3})` : '');

// Findings are keyed by message so the same issue at several widths becomes one line.
const found = { required: new Map(), recommended: new Map() };
const note = (level, msg, where) => { const m = found[level]; if (!m.has(msg)) m.set(msg, new Set()); if (where) m.get(msg).add(where); };

function grade(w, r) {
  const L = r.layout || {};
  if (L.horizontalScroll) note('required', `horizontal scroll (${L.scrollWidth}px > ${L.clientWidth}px): ${L.overflowing.join(', ')}`, w);
  if (w < 600 && L.viewportMeta === null) note('required', 'no <meta name="viewport">; phones render the page at 980px', w);
  if (r.smallTouchTargets && r.smallTouchTargets.length) note('recommended', `touch targets under 24px: ${short(r.smallTouchTargets)}`, w);

  const h = r.houseCheck;
  if (h && typeof h === 'object') {
    if (h.doubleBorder.length) note('required', `house rule, double border: ${short(h.doubleBorder)}`, w);
    if (h.underline.length) note('required', `house rule, decorative underline: ${short(h.underline)}`, w);
    if (h.squareButtons.length) note('required', `house rule, button radius under 8px: ${short(h.squareButtons)}`, w);
    if (h.nonGyeonggiFont.length) note('required', `house rule, font other than Gyeonggi: ${short(h.nonGyeonggiFont.map(([f, n]) => `${f} (${n})`))}`, w);
    if (h.buttonRadii && h.buttonRadii.length > 1) note('recommended', `buttons use several radii: ${h.buttonRadii.join(', ')}`, w);
  } else if (h) note('recommended', String(h), w);

  const d = r.designCheck;
  if (d && typeof d === 'object') {
    if (d.note) note('recommended', 'token checks skipped: no --color-*/--text-*/--space-*/--radius-* variables on :root', w);
    for (const [k, label] of [['offScaleFontSize', 'font size'], ['offPaletteColor', 'color'], ['offScaleSpacing', 'spacing'], ['offScaleRadius', 'radius']]) {
      if (d[k] && d[k].length) note('required', `${label} outside tokens: ${short(d[k])}`, w);
    }
    if (d.repeatedNeighbourSections.length) note('recommended', `neighbouring sections have the same structure: ${short(d.repeatedNeighbourSections)}`, w);
    if (d.uniformSectionPadding) note('recommended', `every section has the same padding (${d.uniformSectionPadding})`, w);
    if (d.centeredTitleGridSections.length >= 3) note('recommended', `${d.centeredTitleGridSections.length} sections are centered title + grid`, w);
    if (d.identicalCardGroups.length) note('recommended', `identical card groups: ${short(d.identicalCardGroups)}`, w);
  } else if (d) note('recommended', String(d), w);

  if (r.keyboardFocus) {
    const hidden = r.keyboardFocus.filter(f => !f.visible);
    if (hidden.length) note('required', `no visible focus ring: ${short(hidden.map(f => `${f.el} "${f.text}"`))}`, w);
  }
  if (r.perf && typeof r.perf === 'object' && r.perf.cls > 0.1) note('required', `CLS ${r.perf.cls} (over 0.1)`, w);
}

function gradeLaunch(l) {
  if (!l || typeof l !== 'object') return;
  if (!l.title) note('required', 'page has no <title>');
  if (l.imgNoAlt.length) note('required', `images without alt: ${short(l.imgNoAlt)}`);
  if (l.deadLinks.length) note('required', `links that go nowhere (href missing, "#", or javascript:): ${short(l.deadLinks)}`);
  if (l.unnamedControls.length) note('required', `controls without an accessible name: ${short(l.unnamedControls)}`);
  if (!l.lang) note('recommended', '<html> has no lang attribute');
  if (flag('public')) {
    if (!l.description) note('recommended', 'public page: no meta description');
    if (!l.ogImage) note('recommended', 'public page: no og:image');
    if (!l.favicon) note('recommended', 'public page: no favicon');
    if (!l.legalLinks) note('recommended', 'public page: no privacy or terms link');
  }
}

(async () => {
  let browser;
  try { browser = await playwright.chromium.launch({ executablePath: opt('executable', process.env.SCREENDORO_CHROMIUM) || undefined }); }
  catch (e) {
    console.log(JSON.stringify({ ok: false, reason: 'Chromium failed to start', detail: String(e.message).split('\n')[0], next: 'Pass --executable <path>, or ask the user to install a browser for Playwright.' }, null, 1));
    process.exit(2);
  }

  const report = { ok: true, url, widths: {}, consoleErrors: [], failedRequests: [] };
  const passes = widths.map(w => ({ w, dark: false }));
  if (flag('dark')) passes.push({ w: 1280, dark: true });
  let launch = null;

  for (const { w, dark } of passes) {
    const mobile = w < 600;
    const context = await browser.newContext({ viewport: { width: w, height: mobile ? 812 : (w < 1000 ? 1024 : 800) }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1, colorScheme: dark ? 'dark' : 'light' });
    const page = await context.newPage();
    const key = w + (dark ? '-dark' : '');
    // "Failed to load resource" carries no URL; real failures show up in failedRequests with one.
    // Browser-initiated requests such as /favicon.ico produce this message without a page request event.
    page.on('console', m => {
      const t = m.text().slice(0, 200);
      if (m.type() === 'error' && !/^Failed to load resource/.test(t) && !report.consoleErrors.includes(t)) report.consoleErrors.push(t);
    });
    page.on('pageerror', e => report.consoleErrors.push('pageerror: ' + String(e.message).slice(0, 200)));
    page.on('requestfailed', r => report.failedRequests.push(`${r.failure() ? r.failure().errorText : 'failed'} ${r.url().slice(0, 160)}`));
    page.on('response', r => { if (r.status() >= 400) report.failedRequests.push(`${r.status()} ${r.url().slice(0, 160)}`); });

    try { await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }); }
    catch { try { await page.goto(url, { waitUntil: 'load', timeout: 30000 }); } catch (e) {
      report.widths[key] = { error: 'page did not open: ' + String(e.message).split('\n')[0] }; await context.close(); continue; } }
    await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
    await page.waitForTimeout(500);

    const r = {};
    r.screenshot = path.join(outDir, `${name}-${key}.png`);
    await page.screenshot({ path: r.screenshot, fullPage: !flag('no-full') });
    r.layout = await page.evaluate(layoutJs);
    if (mobile) r.smallTouchTargets = await page.evaluate(smallTargetsJs);
    const fontAllow = opt('font', null);
    if (fontAllow) await page.evaluate(f => { window.__screendoroFont = f; }, fontAllow);
    if (houseCheck) r.houseCheck = parse(await page.evaluate(houseCheck).catch(e => 'house-check failed: ' + e.message));
    if (designCheck) r.designCheck = parse(await page.evaluate(designCheck).catch(e => 'design-check failed: ' + e.message));
    if (launchCheck && !launch) launch = parse(await page.evaluate(launchCheck).catch(() => null));

    if (w >= 1000 && !dark) {
      const order = [];
      for (let i = 0; i < 8; i++) {
        await page.keyboard.press('Tab');
        const f = await page.evaluate(focusJs);
        if (!f) continue;
        if (order.some(o => o.idx === f.idx)) break; // wrapped around
        order.push(f);
      }
      r.keyboardFocus = order;
      if (order.length) { r.focusScreenshot = path.join(outDir, `${name}-${key}-focus.png`); await page.screenshot({ path: r.focusScreenshot }); }
      if (flag('public')) {
        // Measure in a fresh context so cached resources do not shrink the numbers.
        const perfCtx = await browser.newContext({ viewport: { width: w, height: 800 }, deviceScaleFactor: 1 });
        const p2 = await perfCtx.newPage();
        await p2.goto(url, { waitUntil: 'load', timeout: 30000 }).catch(() => {});
        r.perf = await p2.evaluate(perfJs).catch(e => 'perf failed: ' + e.message);
        r.perfNote = 'First visit, empty cache, local server: real numbers will differ.';
        await perfCtx.close();
      }
    }
    report.widths[key] = r;
    grade(key, r);
    await context.close();
  }
  await browser.close();

  gradeLaunch(launch);
  report.launch = launch;
  report.failedRequests = [...new Set(report.failedRequests)];
  for (const e of report.consoleErrors) note('required', `console error: ${e}`);
  for (const f of report.failedRequests) note('required', `failed request: ${f}`);

  if (Object.values(report.widths).every(v => v.error)) report.ok = false;
  const list = m => [...m].map(([msg, ws]) => ws.size ? `${msg} [${[...ws].join(', ')}]` : msg);
  report.required = list(found.required);
  report.recommended = list(found.recommended);
  report.notChecked = 'Decorative elements, overlaps, clipped text, Korean line breaks, and interactions: look at the screenshots and click through. Fixed or sticky bars show up mid-page in full-page screenshots; that is the capture, not an overlap.';

  const reportPath = path.join(outDir, `${name}-report.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 1));
  console.log(JSON.stringify({ ok: report.ok, report: reportPath, screenshots: Object.values(report.widths).map(v => v.screenshot).filter(Boolean), required: report.required, recommended: report.recommended }, null, 1));
  process.exit(!report.ok ? 1 : report.required.length ? 3 : 0);
})();
