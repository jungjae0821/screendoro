# screendoro-skills

screendoro 스킬을 Claude Code 플러그인으로 설치하기 위한 마켓플레이스 저장소입니다.

## 설치

```bash
claude plugin marketplace add jungjae0821/screendoro-skills
claude plugin install screendoro@screendoro-skills
```

## 들어 있는 플러그인

**screendoro** (이 저장소)
프론트엔드 화면 작업 순서를 강제하는 워크플로 스킬입니다. 새 화면·페이지를 만들거나 화면을 크게 재구성할 때 씁니다.

| 단계 | 하는 일 | 쓰는 플러그인 |
|---|---|---|
| 0 | 프로젝트 마커(`.claude/screendoro.json`)로 최초 구성 여부 확인 | — |
| 0-1 | 초안 맞추기: 사용자의 초안(요소와 순서, 가장 중요한 것, 레퍼런스)을 먼저 받고, AI 구조안과 다른 부분을 사용자가 판정 (새 화면마다, "초안 없이"로 건너뛸 수 있음) | — |
| 1 | 랜딩·마케팅 페이지면 기획·구조·문구를 먼저 정리 | — |
| 2 | 최초 환경 구성: 페이지 전체 구조 와이어프레임을 먼저 확정하고, 디자인 방향을 시안 HTML(첫 화면 + 대표 섹션)로 비교해 고른 뒤 `DESIGN.md`·토큰·레이아웃 문법과 코드 키트(부품, 섹션 틀)로 굳힘 (프로젝트당 1회, 원하면 갤러리 레퍼런스 활용) | — (자체 절차 `references/design-setup.md`, `references/consistency.md`) |
| 3 | 화면 작성: 생성 전에 슬롭 징후 목록을 읽고, 화면별 계획(레이아웃 문법의 섹션 유형 선택) → 뻔함 점검 → 코드 키트로 조립 → 캡처·`design-check.js`·승인 화면 비교로 자기 비평 1회. 거절하면 문제인 축만 바꿔 다시 만듦 (고정 규칙 적용: 경기천년체, 둥근 버튼, 이중 테두리·불필요한 밑줄·장식 금지) | frontend-design |
| 4 | 슬롭 점검, 고정 규칙 위반 점검·삭제, 토큰·레이아웃 문법 측정(`design-check.js`), 실제 렌더링 검증(모바일·태블릿·데스크톱), 공개 페이지면 웹 품질 점검 | antislop, web-quality-skills |

같은 요청에도 화면이 매번 다르게 나오는 "뽑기"를 줄이려고 탐색(시안)은 여러 개를 만들어 고르고, 생산(화면)은 고른 결정을 굳힌 키트와 규칙으로 조립합니다. 절차는 `references/consistency.md`에 있습니다.

초안 절차는 `references/draft-first.md`에, 브라우저 패널이 없는 환경의 렌더링 검증 폴백은 `references/render-pw.cjs`(Playwright, 설치돼 있을 때만)에, 생성 전에 피할 슬롭 징후는 `references/slop-tells.md`에, 고정 규칙은 `references/house-rules.md`에 있고, 4단계 점검 스크립트는 `references/house-check.js`입니다.

**Astryx (선택)**
React 19 이상 프로젝트에서는 최초 구성 때 [Astryx](https://github.com/meta/astryx)(Meta의 오픈소스 디자인 시스템, 베타, MIT)를 컴포넌트 라이브러리로 쓸지 한 번 묻습니다. 기본값은 쓰지 않음입니다. 쓰기로 하면 0단계에서 마커에 기록하고, 2단계에서 `DESIGN.md`와 고정 규칙을 Astryx 테마 토큰으로 옮기고, 3단계에서 CLI로 컴포넌트를 조회해 조립하고, 4단계에서 Astryx 컴포넌트에도 고정 규칙을 똑같이 검사합니다. 절차는 `references/astryx.md`에 있습니다. Astryx는 플러그인이 아니라 프로젝트의 npm 의존성으로 설치되므로 아래 의존 플러그인 목록에는 없습니다.

screendoro를 설치하면 아래 플러그인도 각 원작자 저장소에서 함께 설치됩니다.

| 플러그인 | 하는 일 | 원작자 저장소 | 라이선스 |
|---|---|---|---|
| antislop | AI 티가 나는 패턴을 잡는 점검 스킬 6종: 코어, UI, 문구, 모바일 레이아웃, 접근성(명암비 검사 MCP 포함), 코드 주석 | [miqdadbadjuber/anti-slop](https://github.com/miqdadbadjuber/anti-slop) | MIT |
| web-quality-skills | 웹 품질 점검 스킬 6종: 종합 감사, 성능, Core Web Vitals, 접근성(WCAG 2.2), SEO, best practices | [addyosmani/web-quality-skills](https://github.com/addyosmani/web-quality-skills) | MIT |
| frontend-design | Anthropic 공식 프론트엔드 디자인 지침: 미적 방향, 타이포그래피, 템플릿 느낌 피하기 | [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) | Apache-2.0 |

플러그인으로 설치한 스킬은 `antislop:antislop-ui`처럼 앞에 플러그인 이름이 붙습니다.

이 저장소에는 원작자 코드를 복사해 두지 않았고, `marketplace.json`에서 원작자 저장소를 가리키기만 합니다. 버전을 고정하지 않아서 항상 원작자의 최신판이 설치됩니다.

## 업데이트

스킬을 고친 뒤 `plugins/screendoro/.claude-plugin/plugin.json`의 `version`을 올리고 push합니다. 설치한 쪽에서는 아래 명령으로 받습니다.

```bash
claude plugin marketplace update screendoro-skills
claude plugin update screendoro@screendoro-skills
```

## 제거

```bash
claude plugin uninstall screendoro@screendoro-skills --prune
```

`--prune`은 함께 설치된 의존 플러그인 중 더 이상 필요 없는 것을 같이 지웁니다.

## 라이선스 고지

`plugins/screendoro/skills/screendoro/references/landing-strategy.md`와 `landing-visual-preset.md`는 [elayadesign/ai-design-skills](https://github.com/elayadesign/ai-design-skills)의 `landing-page-design`(MIT)을 번역·수정한 것입니다. 원문 고지는 같은 폴더의 `LICENSE-landing-page-design`에 있습니다.
