"""Rebuild standalone aftergrow/index.html from the editable CLOCK OUT! source."""
from __future__ import annotations
import argparse
import base64
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"

def build(output: Path) -> Path:
    html = (SRC / "index.html").read_text(encoding="utf-8")
    css = (SRC / "styles.css").read_text(encoding="utf-8")
    html = html.replace('<link rel="stylesheet" href="styles.css">', '<style>\n'+css+'\n</style>')
    scripts = re.findall(r'<script src="([^"]+)"></script>',html)
    for relative in scripts:
        source=(SRC / relative).resolve()
        if SRC not in source.parents or source.suffix!='.js':
            raise ValueError(f'Unexpected script path: {relative}')
        code=source.read_text(encoding="utf-8").replace('</script',r'<\/script')
        html=html.replace(f'<script src="{relative}"></script>', '<script>\n'+code+'\n</script>')
    favicon=base64.b64encode((SRC/'assets/favicon.svg').read_bytes()).decode('ascii')
    html=html.replace('href="assets/favicon.svg"',f'href="data:image/svg+xml;base64,{favicon}"')
    if re.search(r'<(?:script|link)\b[^>]*(?:src|href)="(?!data:)', html):
        raise ValueError('External asset remains in self-contained build')
    output.parent.mkdir(parents=True,exist_ok=True)
    output.write_text(html,encoding='utf-8')
    return output

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out',type=Path,default=ROOT/'index.html')
    path=build(parser.parse_args().out.resolve())
    print(f'Built {path} ({path.stat().st_size:,} bytes)')
