# CLOCK OUT! 배포 및 품질검증 가이드

작성일: 2026-10-14 · 저장소: beerAndNacho/game_enjoy

## 1. 배포 주소

- 공개 게임 주소(정상 배포 후): https://beerandnacho.github.io/game_enjoy/aftergrow/
- 프로젝트 주소: https://beerandnacho.github.io/game_enjoy/ (게임 경로로 자동 이동)
- 편집용 원본: `aftergrow/src/`
- 배포용 단일 HTML: `aftergrow/index.html`

GitHub Actions는 게임 HTML과 루트 이동 페이지만 사이트에 업로드합니다. 테스트·소스 코드 파일은 공개 사이트의 배포 아티팩트에 넣지 않습니다.

**주의:** Pages가 활성화되고 배포가 성공해야 위 주소가 실제로 열립니다. 워크플로 파일만 올린 것으로 활성화되는 것은 아닙니다.

## 2. 최초 한 번 필요한 GitHub 설정

1. 저장소 **Settings** 탭을 엽니다.
2. 좌측 메뉴 **Pages**를 선택합니다.
3. **Build and deployment → Source**를 **GitHub Actions**로 설정합니다.
4. **Actions**에서 `CLOCK OUT! verify and deploy` 최신 실행을 확인합니다. 이전 실행이 실패했으면 **Re-run jobs**, 실행이 없다면 **Run workflow → main**으로 다시 실행할 수 있습니다.
5. **Publish tested game to GitHub Pages** 작업이 성공하면 게임 주소를 열어 실제 동작을 점검합니다.

Pages 설정 변경은 GitHub 저장소 코드 작성 권한과 별도의 관리 권한이 필요할 수 있습니다.

## 3. 자동화

워크플로: `.github/workflows/clockout-pages.yml`

- 게임이나 워크플로가 변경된 Pull Request: **verify** 작업만 실행, 공개 사이트 변경 없음.
- `main` 브랜치에 게임 변경 반영: **verify** 통과 시 **deploy** 실행.
- 수동 실행: Actions의 `workflow_dispatch` 지원.
- **재현 가능한 빌드:** `python aftergrow/build.py`가 생성하는 HTML과 커밋된 `aftergrow/index.html`을 `cmp`로 비교.
- **Chromium 회귀:** `python aftergrow/tests/browser_checks.py --smoke`로 31개 시나리오 검증.
- **실제 브라우저 저장:** `python aftergrow/tests/http_smoke.py`로 로컬 HTTP 서버를 연 뒤 native localStorage가 새로고침 후 복원되는지 확인.
- **QA 산출물:** `aftergrow/tests/last-run.json`을 Actions 아티팩트로 14일간 보관.
- **배포:** 최신 통과 빌드의 게임 HTML만 정적 사이트에 게시.

`--smoke`는 실행 시간이 긴 캐릭터 자동 전투 시뮬레이션 1개를 제외합니다. **전체 32개 검증**은 개발 환경에서 `python aftergrow/tests/browser_checks.py`로 수동 수행하세요. 스테이지/밸런스 변경 전후에 전체 검증을 권장합니다.

## 4. 로컬 개발

```bash
python aftergrow/build.py
python -m pip install playwright==1.57.0
python -m playwright install chromium
python aftergrow/tests/browser_checks.py --smoke
python aftergrow/tests/http_smoke.py
```

CI의 Linux 환경에서는 브라우저 시스템 라이브러리를 위해 `python -m playwright install --with-deps chromium`을 실행합니다.

## 5. 배포 후 실제 QA

- [ ] 공개 URL에서 PC Chrome/Edge/Firefox가 게임을 실행하는지 확인
- [ ] iPhone Safari와 Android Chrome의 가상 조이스틱·스킬·돌진 확인
- [ ] 4명의 직장인 및 3개의 층에서 전투·보스·결과 동작 확인
- [ ] 실제 공개 URL에서 업무 포인트, 강화, 클리어 기록이 새로고침 후에도 남는지 확인
- [ ] 백그라운드·화면 회전·일시정지·사운드 설정을 검사
- [ ] 오래된 휴대전화에서 프레임 드롭과 입력 지연 점검

테스트 스크립트의 HTTP 저장 검증은 **로컬호스트** 기반으로 실제 GitHub Pages 배포 도메인에 대한 검증을 대체하지 않습니다. 이 도메인에서도 수동 점검해야 합니다.

## 6. 문제 발생 시

| 문제 | 가능한 원인 | 해결 |
| --- | --- | --- |
| Configure GitHub Pages 단계 404 | Pages 미활성/Source 불일치 | Settings → Pages → Source: GitHub Actions |
| 빌드 `cmp` 실패 | 수정된 원본과 게임 HTML 불일치 | `python aftergrow/build.py` 실행 및 결과 파일 커밋 |
| Chromium을 찾을 수 없음 | Playwright 브라우저 미설치 | `python -m playwright install chromium` |
| 저장 데이터가 초기화됨 | 브라우저 저장 정책 또는 데이터 삭제 | 일반 모드 재현 여부, 해당 브라우저·OS 기록 |
| 공개 화면이 예전 버전 | 배포 실패/캐시 | Actions 배포 결과와 브라우저 캐시 확인 |

**롤백:** 문제가 된 커밋을 되돌리는 Revert PR을 만들어 검증 후 `main`에 병합합니다. 강제 푸시로 기존 기록을 덮어쓰지 않습니다.

## 7. 아직 완료된 것으로 볼 수 없는 것

Pages의 사이트 설정/실제 공개 URL 검증, iPhone/Android 실기기 테스트, 외부 플레이테스트는 자동 워크플로와 별도의 단계입니다. 기획서 `docs/CLOCK_OUT_RELEASE_PLAN.md`의 R01~R10을 순서대로 진행하세요.
