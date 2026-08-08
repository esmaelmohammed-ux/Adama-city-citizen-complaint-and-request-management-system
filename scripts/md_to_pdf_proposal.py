"""Convert proposal Markdown to HTML then PDF via Microsoft Edge (no extra deps)."""
from __future__ import annotations

import html
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(r"c:\Users\HP\Desktop\Citizen")
MD_PATH = ROOT / "Project_Proposal_Web_Based_Citizen_Complaint_and_Service_Request.md"
HTML_PATH = ROOT / "_proposal_export.html"
PDF_PATH = ROOT / "Project_Proposal_Web_Based_Citizen_Complaint_and_Service_Request.pdf"
PDF_PATH_FRONTEND = ROOT / "frontend" / "Project_Proposal_Web_Based_Citizen_Complaint_and_Service_Request.pdf"
EDGE = Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe")


def convert_inline(text: str) -> str:
    text = html.escape(text)
    text = re.sub(r"`([^`]+)`", r"<code>\1</code>", text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<em>\1</em>", text)
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', text)
    return text


def md_to_html(md: str) -> str:
    lines = md.splitlines()
    out: list[str] = []
    i = 0
    in_code = False
    code_lang = ""
    code_buf: list[str] = []
    in_ul = False
    in_ol = False
    in_table = False
    table_rows: list[list[str]] = []

    def close_lists():
        nonlocal in_ul, in_ol
        if in_ul:
            out.append("</ul>")
            in_ul = False
        if in_ol:
            out.append("</ol>")
            in_ol = False

    def flush_table():
        nonlocal in_table, table_rows
        if not table_rows:
            in_table = False
            return
        out.append('<table>')
        for ridx, row in enumerate(table_rows):
            tag = "th" if ridx == 0 else "td"
            # skip separator row like ---|---
            if ridx == 1 and all(re.fullmatch(r":?-{3,}:?", c.strip()) for c in row):
                continue
            cells = "".join(f"<{tag}>{convert_inline(c.strip())}</{tag}>" for c in row)
            out.append(f"<tr>{cells}</tr>")
        out.append("</table>")
        table_rows = []
        in_table = False

    while i < len(lines):
        line = lines[i]

        if line.startswith("```"):
            close_lists()
            flush_table()
            if not in_code:
                in_code = True
                code_lang = line[3:].strip()
                code_buf = []
            else:
                code = "\n".join(code_buf)
                if code_lang == "mermaid":
                    out.append(
                        '<div class="mermaid-wrap"><div class="mermaid-label">[Diagram]</div>'
                        f'<pre class="mermaid-code">{html.escape(code)}</pre></div>'
                    )
                else:
                    out.append(f'<pre><code class="lang-{html.escape(code_lang)}">{html.escape(code)}</code></pre>')
                in_code = False
                code_lang = ""
            i += 1
            continue

        if in_code:
            code_buf.append(line)
            i += 1
            continue

        if not line.strip():
            close_lists()
            flush_table()
            i += 1
            continue

        if line.strip() == "---":
            close_lists()
            flush_table()
            out.append("<hr />")
            i += 1
            continue

        # tables
        if "|" in line and line.strip().startswith("|"):
            close_lists()
            cells = [c for c in line.strip().strip("|").split("|")]
            table_rows.append(cells)
            in_table = True
            i += 1
            continue
        elif in_table:
            flush_table()

        m = re.match(r"^(#{1,6})\s+(.*)$", line)
        if m:
            close_lists()
            level = len(m.group(1))
            text = convert_inline(m.group(2).strip())
            # strip trailing anchor markdown like {#id} if any
            text = re.sub(r"\s*\{#[^}]+\}\s*$", "", text)
            out.append(f"<h{level}>{text}</h{level}>")
            i += 1
            continue

        m = re.match(r"^[-*]\s+(.*)$", line)
        if m:
            flush_table()
            if in_ol:
                out.append("</ol>")
                in_ol = False
            if not in_ul:
                out.append("<ul>")
                in_ul = True
            out.append(f"<li>{convert_inline(m.group(1))}</li>")
            i += 1
            continue

        m = re.match(r"^(\d+)\.\s+(.*)$", line)
        if m:
            flush_table()
            if in_ul:
                out.append("</ul>")
                in_ul = False
            if not in_ol:
                out.append("<ol>")
                in_ol = True
            out.append(f"<li>{convert_inline(m.group(2))}</li>")
            i += 1
            continue

        close_lists()
        flush_table()
        out.append(f"<p>{convert_inline(line.strip())}</p>")
        i += 1

    close_lists()
    flush_table()

    body = "\n".join(out)
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Project Proposal — Citizen Complaint and Service Request System</title>
<style>
  @page {{ size: A4; margin: 18mm 16mm; }}
  body {{
    font-family: "Segoe UI", Calibri, Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.45;
    color: #1a2332;
  }}
  h1 {{ font-size: 20pt; color: #002868; margin-top: 0; page-break-after: avoid; }}
  h2 {{ font-size: 15pt; color: #003399; border-bottom: 1px solid #c5d4e8; padding-bottom: 0.2em; margin-top: 1.4em; page-break-after: avoid; }}
  h3 {{ font-size: 12.5pt; color: #002868; margin-top: 1.1em; page-break-after: avoid; }}
  h4 {{ font-size: 11.5pt; color: #003399; page-break-after: avoid; }}
  p, li {{ orphans: 3; widows: 3; }}
  table {{
    border-collapse: collapse;
    width: 100%;
    margin: 0.8em 0 1em;
    font-size: 9.5pt;
    page-break-inside: avoid;
  }}
  th, td {{
    border: 1px solid #b8c7db;
    padding: 0.35em 0.5em;
    text-align: left;
    vertical-align: top;
  }}
  th {{ background: #e8eef6; color: #002868; }}
  code {{
    font-family: Consolas, "Courier New", monospace;
    font-size: 0.9em;
    background: #f1f5f9;
    padding: 0.05em 0.3em;
    border-radius: 3px;
  }}
  pre {{
    background: #f1f5f9;
    border: 1px solid #d4deea;
    border-radius: 6px;
    padding: 0.75em 0.9em;
    overflow-x: auto;
    font-size: 8.5pt;
    white-space: pre-wrap;
    word-break: break-word;
    page-break-inside: avoid;
  }}
  .mermaid-wrap {{
    border: 1px dashed #6b8ab1;
    background: #f8fafc;
    padding: 0.6em 0.75em;
    margin: 0.8em 0;
    page-break-inside: avoid;
  }}
  .mermaid-label {{
    font-size: 9pt;
    font-weight: 600;
    color: #003399;
    margin-bottom: 0.35em;
  }}
  .mermaid-code {{
    margin: 0;
    border: none;
    background: transparent;
    padding: 0;
  }}
  hr {{ border: none; border-top: 1px solid #d4deea; margin: 1.5em 0; }}
  a {{ color: #003399; }}
  strong {{ color: #002868; }}
</style>
</head>
<body>
{body}
</body>
</html>
"""


def main() -> int:
    if not MD_PATH.exists():
        print(f"Missing markdown: {MD_PATH}", file=sys.stderr)
        return 1
    if not EDGE.exists():
        print(f"Edge not found: {EDGE}", file=sys.stderr)
        return 1

    md = MD_PATH.read_text(encoding="utf-8")
    HTML_PATH.write_text(md_to_html(md), encoding="utf-8")

    # Edge --print-to-pdf needs a file URL
    file_url = HTML_PATH.resolve().as_uri()
    cmd = [
        str(EDGE),
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={PDF_PATH}",
        file_url,
    ]
    print("Generating PDF with Edge...")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(result.stderr or result.stdout, file=sys.stderr)
        return result.returncode

    if not PDF_PATH.exists() or PDF_PATH.stat().st_size < 1000:
        print("PDF was not created successfully.", file=sys.stderr)
        return 1

    PDF_PATH_FRONTEND.write_bytes(PDF_PATH.read_bytes())
    print(f"Wrote {PDF_PATH} ({PDF_PATH.stat().st_size:,} bytes)")
    print(f"Wrote {PDF_PATH_FRONTEND}")
    # keep HTML for debugging optional; remove temp
    HTML_PATH.unlink(missing_ok=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
