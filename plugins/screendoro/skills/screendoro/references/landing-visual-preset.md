# 시각 프리셋 (landing-visual-preset)

screendoro 1단계(`impeccable`)에서 디자인 방향을 정할 때 **고를 수 있는 선택지 하나**다. 강제 규칙이 아니다. 사용자가 이 프리셋을 고른 경우에만 쓴다.
출처: elayadesign/ai-design-skills `landing-page-design` (MIT)의 B1~B7. 한국어 작업과 antislop 검증에 맞게 고쳤다. 라이선스는 `LICENSE-landing-page-design` 참고.

**성격**: Tailwind 기반, 무채색 중심, 다크 톤 SaaS 랜딩. 절제된 타이포, 촘촘한 간격 체계, 무게감 있게 감속하는 모션.

## 쓰는 법

1. 사용자에게 다른 방향과 함께 이 프리셋을 한 줄 설명으로 제시한다.
2. 고르면 아래 값을 프로젝트 `DESIGN.md`에 옮겨 적는다. **값마다 고른 이유를 한 줄씩** 붙인다. 이유가 적혀 있어야 4단계 antislop이 "기본값을 그냥 쓴 것"이 아니라 "목적 있는 선택"으로 판단한다.
3. 이후 화면 작업은 이 파일이 아니라 `DESIGN.md`를 따른다.
4. `.claude/screendoro.json` 마커에 `"visualPreset": "landing-visual-preset"`을 기록한다.

---

## 1. 타이포그래피

**폰트**
- 라틴 전용 사이트: Geist, Manrope, Poppins 중 하나.
- **한국어가 들어가는 사이트**: 위 폰트에는 한글이 없다. Pretendard 같은 한글 지원 폰트를 주 폰트로 쓴다.
- Geist Mono는 코드, 데이터, 숫자 UI처럼 고정폭이 기능상 필요할 때만 주 폰트와 함께 쓴다.
- 피할 폰트: Inter, Roboto, Arial, Open Sans, Helvetica (이 프리셋의 취향).

**규칙**
- 사이트당 폰트 하나. 사용자가 요청하지 않으면 두 폰트를 섞지 않는다.
- 이탤릭 쓰지 않음.
- 900(black) 굵기 쓰지 않음. semibold나 bold까지.
- 한 단어만 마지막 줄에 남지 않게 한다: 제목은 `text-wrap: balance`, 본문은 `text-wrap: pretty`. 한국어 본문은 `word-break: keep-all`을 함께 쓴다.

**크기 단계**

글자 크기는 Tailwind 기본 단계로만 쓴다. `text-[19px]`, `font-size: 22px`, `1.4rem` 같은 임의 값은 남기지 않는다. 단계에 정확히 맞지 않으면 **바로 아래 단계**로 내리고, 그 단계의 행간도 함께 쓴다.

| 클래스 | 크기 | 행간 |
|---|---|---|
| `text-xs` | 12px | 16px |
| `text-sm` | 14px | 20px |
| `text-base` | 16px | 24px |
| `text-lg` | 18px | 28px |
| `text-xl` | 20px | 28px |
| `text-2xl` | 24px | 32px |
| `text-3xl` | 30px | 36px |
| `text-4xl` | 36px | 40px |
| `text-5xl` | 48px | 1 |
| `text-6xl` | 60px | 1 |
| `text-7xl` | 72px | 1 |
| `text-8xl` | 96px | 1 |
| `text-9xl` | 128px | 1 |

자간과 행간은 해당 단계가 주는 값 **안에서만** 조절한다.

**버튼 글자**
- 주 버튼: `text-base`, semibold
- 헤더의 작은 버튼: `text-sm`, semibold

## 2. 간격

이 값만 쓴다. 사이 값도, 바깥 값도 없다.

| 토큰 | 값 |
|---|---|
| Spacing-0 | 0 |
| Spacing-25 | 2px |
| Spacing-50 | 4px |
| Spacing-75 | 8px |
| Spacing-100 | 12px |
| Spacing-200 | 16px |
| Spacing-300 | 24px |
| Spacing-400 | 32px |
| Spacing-500 | 40px |
| Spacing-600 | 48px |
| Spacing-700 | 64px |
| Spacing-800 | 80px |
| Spacing-900 | 96px |

주 버튼 패딩: 세로 8px, 가로 12px.

## 3. 모서리

Tailwind 반경 값만 쓴다.

**겹친 도형 공식**: 도형 안에 도형이 있고 둘 사이 간격이 **32px 미만**이면

```
안쪽 반경 = 바깥 반경 − 간격
```

결과가 **2보다 클 때만** 적용한다. 그 이하면 안쪽 도형은 각지게 두거나 그대로 둔다.

예: `rounded-2xl`(16px) 카드 안에 8px 패딩 → 안쪽 요소는 8px(`rounded-lg`).

## 4. 테두리와 배경

- 카드 한쪽에만 테두리를 두지 않는다. 사방에 두거나 아예 없거나.
- 배경에 그라디언트를 쓰지 않는다. 배경은 단색.

**다크 모드 배경색** (이것만)

`#000000` · `#181818` · `#1F1F1F` · `#272727` · `#313131` · `#131209`

## 5. 히어로

**헤드라인 색** (그라디언트는 이곳에서만, 글자에만)
- 다크: 왼쪽→오른쪽 `#FFFFFF` → `#9B9B9B`
- 라이트: 왼쪽→오른쪽 `#000000` → `#666666`
- 그라디언트의 **가장 옅은 끝**도 배경 대비를 통과해야 한다. 4단계 `antislop-human` 대비 검사로 확인한다.

**레이아웃**
- 헤드라인과 서브헤드 모두 최대 너비 680px.
- 헤드라인은 의미 단위에서 줄을 끊는다. 구절을 어색하게 자르지 않는다.

## 6. 아이콘

- 쓸 것: Phosphor, Solar, Iconamoon
- 쓰지 않을 것: Material Icons, Material Symbols

## 7. 모션

움직임은 무게감 있게 감속하며 자리에 들어앉아야 한다. 브라우저 기본 곡선(`ease`, `linear`, `ease-in-out`)은 쓰지 않는다.

- **기본 곡선**: `ease-[cubic-bezier(0.22,1,0.36,1)]`, 레이아웃과 위치 변화는 `duration-500`.
- hover의 색과 불투명도 변화는 `duration-300`까지 줄일 수 있다. 200ms보다 짧게는 안 된다.
- `transform`과 `opacity`만 움직인다. `top`, `left`, `width`, `height`는 움직이지 않는다.
- `prefers-reduced-motion`이면 움직임을 단순한 불투명도 변화로 바꾼다.

**내비게이션**
- 평소 상태: 화면 위 끝에 붙지 않고 살짝 떠 있는 작은 바. 가운데 정렬, 내용 크기에 맞춤. 반투명 표면 + 배경 블러. 간격은 2절, 반경은 3절. (antislop 글래스 사용량 기준: 이 바 하나로 제한한다.)
- 메뉴 토글: 열기/닫기 아이콘이 즉시 바뀌지 않고 기본 곡선으로 변형된다.
- 모바일 메뉴: 작은 드롭다운이 아니라 전체 높이 패널. 기본 표면색을 높은 불투명도로, 강한 블러와 함께.
- 링크 등장: 메뉴 안 링크가 읽는 순서대로 하나씩, 24px 올라오며 나타난다. 항목 간격 60ms, 전체 최대 400ms.

**스크롤 등장**
- 화면에 들어오는 섹션은 32px 올라오며 600~800ms 동안 불투명도 0→1로 나타난다. 기본 곡선을 쓴다.
- 섹션마다 한 번만. 위로 다시 스크롤해도 반복하지 않는다.
- `IntersectionObserver`나 Framer Motion `whileInView`로 구현한다. 조절 없는 `window.addEventListener('scroll')`은 금지.

---

## 원본에서 뺀 것

- 문장 안 하이픈 금지, sentence case: 한국어에 해당 없음.
- 영어 과장어 금지 목록: `antislop-copywriting`이 맡는다.
- "이 파일이 프레임워크 기본값보다 우선한다": 우선순위는 screendoro가 정한다.

## 체크리스트 (프리셋을 고른 프로젝트에서 4단계 때)

- [ ] 승인된 폰트 하나, 이탤릭 없음, 900 굵기 없음
- [ ] 모든 글자 크기가 Tailwind 단계에 맞음
- [ ] 모든 간격이 간격 표에서 나옴
- [ ] 겹친 반경이 공식을 따름
- [ ] 한쪽 테두리 없음, 배경 그라디언트 없음
- [ ] 히어로 헤드라인과 서브헤드가 680px 이하, 의미 단위 줄바꿈, 그라디언트 옅은 끝 대비 통과
- [ ] 아이콘이 Phosphor, Solar, Iconamoon 중 하나
- [ ] 모든 전환이 기본 곡선, 스크롤 등장은 IntersectionObserver
