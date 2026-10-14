"""Smoke-test the shipped HTML over a real HTTP origin with native localStorage.

Unlike browser_checks.py's in-memory storage adapter, this test reloads and
verifies browser persistence at an actual localhost HTTP origin. This does not
replace iOS/Android testing or a check against the deployed GitHub Pages URL.
"""
from __future__ import annotations

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from shutil import which

from playwright.sync_api import sync_playwright

REPO = Path(__file__).resolve().parents[2]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args: object) -> None:
        pass


def main() -> None:
    handler = partial(QuietHandler, directory=str(REPO))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    server_thread = Thread(target=server.serve_forever, daemon=True)
    server_thread.start()
    origin = f"http://127.0.0.1:{server.server_port}"
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(
                headless=True,
                executable_path=which("chromium"),
                args=["--no-sandbox"],
            )
            try:
                context = browser.new_context(viewport={"width": 1366, "height": 768})
                page = context.new_page()
                page.goto(origin + "/aftergrow/", wait_until="load")
                page.wait_for_function("window.AG && AG.Store && document.querySelector('.hero')")
                assert "CLOCK OUT!" in page.title(), "Unexpected game title"
                assert page.locator(".hero").is_visible(), "Game lobby did not render"
                assert page.evaluate("AG.Store.available"), "Local storage unavailable at HTTP origin"
                before = page.evaluate("""() => {
                    AG.Store.data.selected='io';
                    AG.Store.data.seeds=137;
                    AG.Store.data.research.focus=2;
                    AG.Store.data.settings.tutorialSeen=true;
                    AG.Store.save();
                    return JSON.parse(localStorage.getItem('clockout.office.v1'));
                }""")
                assert before["seeds"] == 137 and before["selected"] == "io"
                page.reload(wait_until="load")
                page.wait_for_function("window.AG && AG.Store && document.querySelector('.hero')")
                after = page.evaluate("""() => ({
                    selected: AG.Store.data.selected,
                    seeds: AG.Store.data.seeds,
                    focus: AG.Store.data.research.focus,
                    tutorialSeen: AG.Store.data.settings.tutorialSeen
                })""")
                assert after == {"selected": "io", "seeds": 137, "focus": 2, "tutorialSeen": True}, after
                assert page.evaluate("location.pathname") == "/aftergrow/"
                context.close()

                mobile = browser.new_context(
                    viewport={"width": 390, "height": 844},
                    is_mobile=True, has_touch=True, device_scale_factor=2,
                )
                mobile_page = mobile.new_page()
                mobile_page.goto(origin + "/aftergrow/", wait_until="load")
                mobile_page.wait_for_function("window.AG && document.querySelector('.hero')")
                assert mobile_page.evaluate(
                    "document.documentElement.scrollWidth <= innerWidth + 1"
                ), "Mobile layout overflows horizontally"
                mobile.close()
                print("PASS HTTP-origin game load, real localStorage reload, and mobile layout")
            finally:
                browser.close()
    finally:
        server.shutdown()
        server.server_close()
        server_thread.join(timeout=5)


if __name__ == "__main__":
    main()
