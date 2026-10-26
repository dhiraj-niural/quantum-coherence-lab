"""Render this article's headings, paragraphs and fenced code with escaped HTML."""
from pathlib import Path
from html import escape
root = Path(__file__).resolve().parents[1]
blocks, paragraph, code = [], [], None

def flush():
    if paragraph:
        blocks.append('<p>' + escape(' '.join(paragraph)) + '</p>')
        paragraph.clear()

for line in (root / 'docs/explainer.md').read_text().splitlines():
    if line.startswith('```'):
        flush()
        if code is None:
            code = []
        else:
            blocks.append('<pre><code>' + escape('\n'.join(code)) + '</code></pre>')
            code = None
    elif code is not None:
        code.append(line)
    elif line.startswith('#'):
        flush()
        level = len(line) - len(line.lstrip('#'))
        blocks.append(f'<h{level}>' + escape(line[level:].strip()) + f'</h{level}>')
    elif not line.strip():
        flush()
    else:
        paragraph.append(line)
flush()
assert code is None
page = '''<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>What can a quantum measurement hide? — Dhiraj Khanal</title>
<style>body{max-width:760px;margin:48px auto;padding:0 24px;background:#faf9f5;color:#202a30;font:19px/1.75 Georgia,serif}h1{font-size:2.3em;line-height:1.15}h2{font-size:1.4em;line-height:1.3;margin-top:2.5em}a{color:#235f59}pre{font:13px/1.6 monospace;background:#edf0ed;padding:20px;overflow:auto}nav,.note{font:15px/1.5 Arial,sans-serif}nav{display:flex;justify-content:space-between;gap:24px}footer{margin:48px 0;border-top:1px solid #ccd2cf;padding-top:20px}@media(max-width:500px){body{font-size:17px;margin-top:24px}h1{font-size:2em}}</style></head><body>
<nav><span>Dhiraj Khanal · Physics notes</span><a href="index.html#experiment">Open the experiment →</a></nav>
<p class="note">Working draft · 26 October 2026 · Basic algebra and a little Python</p><main>'''
page += '\n'.join(blocks)
page += '</main><footer><a href="index.html#experiment">Try the experiment</a> · <a href="learn_measurement.py" download>Download the Python example</a></footer></body></html>'
(root / 'site/dist/article.html').write_text(page)
(root / 'site/dist/learn_measurement.py').write_text((root / 'scripts/learn_measurement.py').read_text())
