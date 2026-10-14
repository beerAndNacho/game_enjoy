# CLOCK OUT! — 퇴근 전쟁

**퇴근 3분 전, 회사가 미쳐버렸다.** 직장인 4명이 오픈 오피스, 무한 회의실, 심야 서버실을 돌파하는 2D 브라우저 생존 액션 게임입니다. 게임은 한국어로 제공되며 GTA 같은 도심 액션 포스터의 강한 대비에서 영감을 받은 **독자적인 오피스 코믹 아트**를 사용합니다. GTA의 공식 아트, 로고, 캐릭터, 음원을 복제하지 않았습니다.

## 실행하기

**[게임 실행 파일](index.html)** 을 웹 브라우저에서 열면 됩니다. HTML 한 파일 안에 CSS·JavaScript·SVG·사운드 합성 코드가 모두 들어 있으므로 별도 서버나 외부 라이브러리가 필요하지 않습니다.

웹 서버를 이용하려면 저장소 루트에서 다음을 실행합니다.

```bash
python -m http.server 5173
```

주소: `http://localhost:5173/aftergrow/`

## 게임 콘텐츠

- **직장인 4명:** 차대리(결재 서류), 한기획(호밍 포스트잇), 박팀장(결재판 스윙), 윤개발(디버그 체인). 각각 고유 스킬, 패시브, 공격 패턴과 결말이 있습니다.
- **3개 사무실 층:** 오픈 오피스(마감 관리자), 무한 회의실(회의 소집자), 심야 서버실(야근 알고리즘)
- **전투:** 자동 공격, 적 이동/사격/보스 패턴, 레벨업, 무기 진화, 스토리 선택, 커피 머신 회복
- **성장:** 12가지 장비 모듈, 3가지 진화 조합, 업무 포인트로 구매하는 3가지 영구 강화
- **기록:** 사내 기록 9종, 챕터별 선택과 엔딩, 브라우저 로컬 저장
- **환경:** 모바일 가상 조이스틱, 키보드, 축소 모션, Web Audio 효과음(기본 꺼짐)

## 조작

| 조작 | 기능 |
| --- | --- |
| WASD / 방향키 | 이동 (공격은 자동) |
| E | 직장인 고유 필살기 |
| Space | 무적 돌진 |
| P / Esc | 일시정지 |
| F1 | 도움말 |
| M | 사운드 토글 |
| 1 / 2 / 3 | 레벨업 카드 선택 |
| 모바일 | 화면 드래그 이동, 우측 하단 스킬·돌진 버튼 |

각 스테이지에서 **3분간 생존**하고 2분 25초경 등장하는 보스를 처치하면 성공입니다. 체력·경험치·충격파는 커피 머신 원 안에서 2초간 머물면 얻을 수 있습니다.

## 소스 수정 / 빌드

GitHub Pages에 바로 배포할 수 있는 **단일 파일**은 `aftergrow/index.html`입니다. 편집하기 좋은 원본은 `aftergrow/src/` 폴더에 있습니다.

```text
aftergrow/
  index.html          완성된 단독 실행 파일 (배포용)
  build.py            배포 파일 재생성
  README.md           이 설명
  src/
    index.html        HTML 구조
    styles.css        레이아웃과 오피스 코믹 디자인
    assets/favicon.svg
    js/content.js     직장인, 스토리, 구역, 장비
    js/art.js         원본 SVG 캐릭터/적/배경
    js/engine.js      Canvas 전투 및 사무실 플로어 렌더링
    js/app.js         UI 및 입력 제어
    js/storage.js     저장/업그레이드
    js/audio.js       효과음
  tests/browser_checks.py
```

코드를 수정한 후 저장소 루트에서 다음 명령을 실행하여 배포 파일을 갱신하세요.

```bash
python aftergrow/build.py
```

## 검증

Playwright와 Chromium이 설치된 개발 환경에서:

```bash
python aftergrow/tests/browser_checks.py --browser /usr/bin/chromium
```

오피스 테마 변환 이후 **32개 시나리오 통과**: 메뉴/이미지 로드, 4명 무기·스킬, 3개 보스, 세 가지 진화, 6개 스토리 선택, 저장, 터치 이동, 작은 화면, 장시간 자동 전투, 엔딩 기록 등.

테스트는 브라우저 내 메모리 저장 어댑터를 사용하며, GitHub Pages 도메인에서의 실제 영구 저장이나 모든 휴대전화 기종을 보장하지 않습니다.

## 저장 데이터

신규 저장 키는 `clockout.office.v1`입니다. 기존 AFTERGROW 원예 게임의 `aftergrow.garden.v2` 진행 기록을 변경하거나 지우지 않습니다.

## 라이선스

원본 코드와 SVG 일러스트는 프로젝트 전용으로 제작되었습니다. 자세한 조건은 상위 저장소 정책을 확인하세요.

## GitHub Pages / CI

배포용 HTML은 `aftergrow/index.html`, 편집 소스는 `aftergrow/src/`입니다. `.github/workflows/clockout-pages.yml`에서 PR마다 빠른 회귀 테스트를 실행하고 `main`에 반영된 변경을 GitHub Pages로 배포하도록 구성했습니다. 최초 Pages 활성화와 문제 해결은 [배포 가이드](../docs/DEPLOYMENT.md)를 확인하세요.

빠른 테스트: `python aftergrow/tests/browser_checks.py --smoke` (31개). 전체 테스트: `python aftergrow/tests/browser_checks.py` (32개, 장시간 시뮬레이션 포함). 실제 HTTP 저장 테스트: `python aftergrow/tests/http_smoke.py`.
