# screendoro-skills

screendoro 스킬을 Claude Code 플러그인으로 설치하기 위한 마켓플레이스 저장소입니다.

## 설치

```bash
claude plugin marketplace add jungjae0821/screendoro-skills
claude plugin install screendoro@screendoro-skills
```

screendoro를 설치하면 아래 플러그인도 각 원작자 저장소에서 함께 설치됩니다.

| 플러그인 | 원작자 저장소 | 라이선스 |
|---|---|---|
| impeccable | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | Apache-2.0 |
| antislop | [miqdadbadjuber/anti-slop](https://github.com/miqdadbadjuber/anti-slop) | MIT |
| web-quality-skills | [addyosmani/web-quality-skills](https://github.com/addyosmani/web-quality-skills) | MIT |
| frontend-design | [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) | 원 저장소 참고 |

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
