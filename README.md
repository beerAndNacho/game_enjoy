# CLOCK OUT! — 퇴근 전쟁

> 퇴근 3분 전, 회사가 미쳐버렸다. 직장인 4명이 업무 괴물을 뚫고 야근 알고리즘을 종료하는 2D 브라우저 생존 액션.

- **공개 게임 주소(GitHub Pages 활성화 후):** https://beerandnacho.github.io/game_enjoy/aftergrow/
- **게임 소스·조작 안내:** [aftergrow/README.md](aftergrow/README.md)
- **제품화·출시 기획서:** [docs/CLOCK_OUT_RELEASE_PLAN.md](docs/CLOCK_OUT_RELEASE_PLAN.md)
- **자동 배포 설정·테스트 방법:** [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## 로컬 실행

```bash
python -m http.server 5173
```

브라우저에서 http://localhost:5173/aftergrow/ 에 접속합니다. 서버 없이 `aftergrow/index.html`을 직접 열어도 됩니다.

## 개발 및 테스트

```bash
python aftergrow/build.py
python -m pip install playwright==1.57.0
python -m playwright install chromium
python aftergrow/tests/browser_checks.py --smoke
python aftergrow/tests/http_smoke.py
```

`--smoke`는 긴 자동 전투 밸런스 시뮬레이션을 제외한 33개 브라우저 시나리오를 실행합니다. 전체 34개 검증은 `--smoke` 옵션 없이 실행합니다. HTTP 저장 테스트는 localhost 접속이 허용되는 환경에서 실행합니다.

`main`에 게임 코드가 반영되면 GitHub Actions가 빌드·테스트 후 Pages 배포를 시도합니다. **최초 한 번** 저장소 **Settings → Pages → Build and deployment → Source: GitHub Actions** 선택이 필요할 수 있습니다. 자세한 안내는 [배포 문서](docs/DEPLOYMENT.md)를 참고하세요.
