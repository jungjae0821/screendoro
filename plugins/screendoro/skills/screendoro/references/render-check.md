# 렌더링 검증 (render-check)

screendoro 4단계에서 **실제로 화면을 띄워서** 확인하는 절차다. antislop은 코드를 읽고 판단하지만, 가로 스크롤, 겹침, 콘솔 오류, 깨진 이미지, 레이아웃 밀림은 띄워 봐야 확실히 잡힌다.

## 1. 띄우기

- 개발 서버가 있는 프로젝트: `.claude/launch.json`에 설정을 두고 브라우저 패널 `preview_start`(name)로 띄운다. 실행 방법을 모르면 `run` 스킬을 쓴다.
- 정적 HTML: 브라우저 패널로 파일을 바로 연다.
- 브라우저 패널이 없는 환경(터미널 CLI 등): `webapp-testing` 스킬(Playwright)이 설치돼 있으면 그것으로 같은 항목을 확인한다. 둘 다 없으면 렌더링 검증을 **미검증**으로 남기고 완료 보고에 적는다. 확인하지 않은 것을 확인했다고 쓰지 않는다.

## 2. 화면 폭별 확인

이번 작업에서 만든 화면마다 아래 세 폭에서 본다. 페이지 끝까지 스크롤하며 캡처한다.

| 폭 | 방법 |
|---|---|
| 모바일 375px | `resize_window` preset `mobile`, 그다음 새로고침 |
| 태블릿 768px | `resize_window` preset `tablet` |
| 데스크톱 | `resize_window` preset `desktop` |

`DESIGN.md`에 다크 모드가 있으면 `colorScheme: "dark"`로 한 번 더 본다.
끝나면 반드시 preset `desktop`으로 되돌린다.

폭마다 볼 것:

- 가로 스크롤: 아래 스크립트로 확인한다. 캡처에서는 멀쩡해 보여도 `true`면 필수 항목이다. 모바일 에뮬레이션에서는 넘친 내용만큼 `innerWidth`가 늘어나 버리므로 반드시 `clientWidth`와 비교한다.
  ```js
  const d = document.documentElement; [d.scrollWidth, d.clientWidth, d.scrollWidth > d.clientWidth]
  ```
- 넘치는 요소 찾기 (가로 스크롤이 있을 때):
  ```js
  const w = document.documentElement.clientWidth; [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > w + 1).slice(0, 10).map(e => e.tagName + '.' + e.className)
  ```
- 고정 규칙: `references/house-check.js`를 실행해 이중 테두리, 밑줄, 각진 버튼, 경기천년체 적용 여부를 확인한다 (`house-rules.md` 5절).
- 글자·요소 겹침, 잘린 문구, 화면 밖으로 나간 버튼
- 한국어 줄바꿈이 단어 중간에서 끊기지 않는지 (`word-break: keep-all`)
- 모바일 터치 대상이 손가락으로 누를 만한 크기인지

## 3. 콘솔과 네트워크

- `read_console_messages` (onlyErrors)로 오류를 확인한다. 이 작업에서 생긴 오류는 필수 항목이다. 이전부터 있던 오류는 보고에만 적는다.
- `read_network_requests`로 4xx/5xx 응답을 확인한다. 깨진 이미지, 폰트, 스크립트는 필수 항목이다.

## 4. 상호작용

화면 하나에 대해 짧게만 한다.

- 핵심 CTA나 주요 버튼을 hover하고 클릭해서 상태 변화와 동작을 확인한다.
- Tab 키를 몇 번 눌러 포커스 링이 보이는지, 순서가 읽는 순서와 맞는지 캡처로 확인한다.
- 폼이 있으면 빈 값으로 제출해서 오류 표시가 해당 위치에 나오는지 확인한다.
- 모바일 폭에서 메뉴가 있으면 열고 닫아 본다.

## 5. 성능 측정 (랜딩·공개 페이지일 때)

`web-quality-audit` 스킬의 측정 방식을 따른다. Lighthouse가 이미 설치돼 있으면 쓴다. 설치돼 있지 않으면 사용자에게 묻기 전에는 설치하지 않고, 아래 스크립트로 브라우저 패널에서 실험실 값만 잰다. 새로고침 직후 실행한다.

```js
await new Promise(r => setTimeout(r, 3000));
const buffered = type => new Promise(r => { const o = new PerformanceObserver(l => { r(l.getEntries()); o.disconnect(); }); o.observe({ type, buffered: true }); setTimeout(() => r([]), 500); });
const lcp = (await buffered('largest-contentful-paint')).at(-1);
let cls = 0; for (const e of await buffered('layout-shift')) if (!e.hadRecentInput) cls += e.value;
const res = performance.getEntriesByType('resource');
({
  lcpMs: lcp ? Math.round(lcp.startTime) : null,
  lcpEl: lcp?.element?.tagName,
  cls: +cls.toFixed(3),
  transferKB: Math.round(res.reduce((s, r) => s + (r.transferSize || 0), 0) / 1024),
  biggest: res.sort((a, b) => b.transferSize - a.transferSize).slice(0, 5).map(r => [r.name.split('/').pop(), Math.round(r.transferSize / 1024) + 'KB'])
})
```

LCP와 layout-shift는 `getEntriesByType`로는 나오지 않아서 `buffered: true` 옵저버로 읽는다. 밀림이 하나도 없으면 `cls`는 0이 정상이다. 페이지가 백그라운드 탭이면 LCP가 기록되지 않으므로 `lcpMs`가 null이면 탭을 앞으로 가져와 다시 잰다.

판정:

- **CLS 0.1 초과**: 필수. 크기 없는 이미지, 늦게 들어오는 폰트, 위에 끼어드는 요소가 흔한 원인이다.
- **LCP**: 개발 서버 값은 실제 배포와 다르므로 권장 항목으로만 적고, "개발 서버 측정값"이라고 밝힌다. 다만 LCP 요소가 `loading="lazy"` 이미지거나, 첫 화면 이미지가 수백 KB를 넘으면 필수로 고친다.
- **한글 웹폰트**: Pretendard 같은 한글 폰트를 통째로 받고 있으면(전체 1MB 이상) 서브셋이나 dynamic subset 버전으로 바꾸는 것을 권장 항목에 넣는다.
- 측정값은 완료 보고에 그대로 적는다. 측정하지 않은 값을 추정해서 적지 않는다.

## 6. 기록

각 폭에서 찍은 캡처와 확인 결과는 4단계 항목 정리에 그대로 쓴다. 필수 항목을 고친 뒤 재점검할 때는 **고친 화면과 폭만** 다시 띄워 본다.
