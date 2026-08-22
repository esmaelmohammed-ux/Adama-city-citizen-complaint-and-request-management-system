"""Export the project proposal Markdown to the Word file opened in File Explorer."""

from __future__ import annotations

import re
import urllib.error
import urllib.request
from pathlib import Path

from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Inches, Pt, RGBColor

ROOT = Path(__file__).resolve().parents[1]
MD_PATH = ROOT / "Project_Proposal_Web_Based_Citizen_Complaint_and_Service_Request.md"
DIAGRAM_DIR = ROOT / "scripts" / "assets" / "diagrams"
NAVY = RGBColor(0x00, 0x33, 0x66)
WORD_NAMES = [
    "ADAMA CITY CITIZEN COMPLIANT AND SERVICE REQUEST MANAGEMENT SYSTEM DOCUMENTATION.docx",
    "ADAMA CITY CITIZEN COMPLAINT MANAGEMENT SYSTEM DOCUMENTATION.docx",
]


def set_run_font(run, name="Times New Roman", size=12, bold=False, italic=False, color=None):
    run.font.name = name
    run._element.rPr.rFonts.set(qn("w:eastAsia"), name)
    run.font.size = Pt(size)
    run.bold = bold
    run.italic = italic
    if color is not None:
        run.font.color.rgb = color


def set_paragraph_spacing(paragraph, before=0, after=8, line=1.15):
    pf = paragraph.paragraph_format
    pf.space_before = Pt(before)
    pf.space_after = Pt(after)
    pf.line_spacing = line
    pf.line_spacing_rule = WD_LINE_SPACING.MULTIPLE


def add_bottom_border(paragraph):
    pPr = paragraph._p.get_or_add_pPr()
    pBdr = OxmlElement("w:pBdr")
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), "12")
    bottom.set(qn("w:space"), "1")
    bottom.set(qn("w:color"), "003366")
    pBdr.append(bottom)
    pPr.append(pBdr)


def shade_cell(cell, fill="003366"):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), fill)
    shd.set(qn("w:val"), "clear")
    tcPr.append(shd)


def add_formatted_runs(paragraph, text, size=12, color=None):
    pattern = re.compile(r"(\*\*[^*]+?\*\*|\*[^*]+?\*|`[^`]+?`)")
    pos = 0
    for match in pattern.finditer(text):
        if match.start() > pos:
            run = paragraph.add_run(text[pos : match.start()])
            set_run_font(run, size=size, color=color)
        token = match.group(0)
        if token.startswith("**"):
            run = paragraph.add_run(token[2:-2])
            set_run_font(run, size=size, bold=True, color=color)
        elif token.startswith("`"):
            run = paragraph.add_run(token[1:-1])
            set_run_font(run, name="Consolas", size=max(10, size - 1), color=color)
        else:
            run = paragraph.add_run(token[1:-1])
            set_run_font(run, size=size, italic=True, color=color)
        pos = match.end()
    if pos < len(text):
        run = paragraph.add_run(text[pos:])
        set_run_font(run, size=size, color=color)


def add_heading(doc, text, level):
    sizes = {0: 22, 1: 16, 2: 14, 3: 12}
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT if level else WD_ALIGN_PARAGRAPH.CENTER
    set_paragraph_spacing(p, before=16 if level else 6, after=8 if level else 4)
    run = p.add_run(text)
    set_run_font(run, size=sizes.get(level, 12), bold=True, color=NAVY)
    if level == 0:
        add_bottom_border(p)
    return p


def add_body(doc, text, italic=False, center=False, size=12):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER if center else WD_ALIGN_PARAGRAPH.JUSTIFY
    set_paragraph_spacing(p, after=8)
    if italic:
        run = p.add_run(text)
        set_run_font(run, size=size, italic=True)
    else:
        add_formatted_runs(p, text, size=size)
    return p


def add_list_item(doc, text, ordered=False, number=1):
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Cm(1.0)
    set_paragraph_spacing(p, after=4)
    prefix = f"{number}. " if ordered else "• "
    run = p.add_run(prefix)
    set_run_font(run, size=12)
    add_formatted_runs(p, text, size=12)
    return p


def add_code_block(doc, text):
    for line in text.splitlines() or [""]:
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Cm(0.5)
        set_paragraph_spacing(p, after=0, line=1.0)
        run = p.add_run(line)
        set_run_font(run, name="Consolas", size=9)


def add_table(doc, rows):
    if not rows:
        return
    cols = max(len(r) for r in rows)
    table = doc.add_table(rows=len(rows), cols=cols)
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for r_idx, row in enumerate(rows):
        for c_idx in range(cols):
            cell = table.cell(r_idx, c_idx)
            cell.text = ""
            p = cell.paragraphs[0]
            set_paragraph_spacing(p, before=2, after=2, line=1.0)
            value = row[c_idx] if c_idx < len(row) else ""
            if r_idx == 0:
                shade_cell(cell, "003366")
                add_formatted_runs(p, value, size=10, color=RGBColor(255, 255, 255))
                for run in p.runs:
                    run.bold = True
            else:
                add_formatted_runs(p, value, size=10)
    doc.add_paragraph()


def add_image(doc, path: Path, caption: str | None = None):
    if not path.exists():
        add_body(doc, f"[Missing image: {path.name}]", italic=True)
        return
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_paragraph_spacing(p, before=8, after=4)
    run = p.add_run()
    run.add_picture(str(path), width=Inches(6.2))
    if caption:
        cap = doc.add_paragraph()
        cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        set_paragraph_spacing(cap, after=10)
        run = cap.add_run(caption)
        set_run_font(run, size=10, italic=True)


def render_mermaid(source: str, index: int) -> Path | None:
    DIAGRAM_DIR.mkdir(parents=True, exist_ok=True)
    out = DIAGRAM_DIR / f"figure-{index:02d}.png"
    cleaned = re.sub(r"%%\{.*?\}%%", "", source, flags=re.S).strip()
    try:
        req = urllib.request.Request(
            "https://kroki.io/mermaid/png",
            data=cleaned.encode("utf-8"),
            headers={"Content-Type": "text/plain", "Accept": "image/png"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=45) as resp:
            data = resp.read()
        if data[:8] == b"\x89PNG\r\n\x1a\n":
            out.write_bytes(data)
            return out
    except (urllib.error.URLError, TimeoutError, OSError):
        return None
    return None


def parse_table_row(line: str) -> list[str]:
    cells = [c.strip() for c in line.strip().strip("|").split("|")]
    return cells


def is_table_sep(line: str) -> bool:
    return bool(re.match(r"^\|?\s*:?-{3,}", line.strip()))


def convert():
    text = MD_PATH.read_text(encoding="utf-8")
    lines = text.splitlines()
    doc = Document()

    section = doc.sections[0]
    section.page_width = Inches(8.5)
    section.page_height = Inches(11)
    section.left_margin = Inches(1)
    section.right_margin = Inches(1)
    section.top_margin = Inches(0.9)
    section.bottom_margin = Inches(0.9)

    style = doc.styles["Normal"]
    style.font.name = "Times New Roman"
    style.font.size = Pt(12)

    i = 0
    mermaid_index = 0
    pending_caption = None

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        if not stripped:
            i += 1
            continue

        if stripped == "---":
            p = doc.add_paragraph()
            set_paragraph_spacing(p, before=4, after=8)
            add_bottom_border(p)
            i += 1
            continue

        if stripped.startswith("```"):
            fence = stripped[3:].strip()
            block = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith("```"):
                block.append(lines[i])
                i += 1
            if i < len(lines):
                i += 1
            content = "\n".join(block)
            if fence.lower() == "mermaid":
                mermaid_index += 1
                image = render_mermaid(content, mermaid_index)
                caption = None
                if i < len(lines) and lines[i].strip().startswith("*Figure"):
                    caption = lines[i].strip().strip("*")
                    i += 1
                if image:
                    add_image(doc, image, caption)
                else:
                    add_body(doc, f"Figure diagram {mermaid_index} (see source Markdown if image did not render).", italic=True)
                    add_code_block(doc, content)
                    if caption:
                        add_body(doc, caption, italic=True, center=True, size=10)
            else:
                add_code_block(doc, content)
            continue

        img = re.match(r"^!\[([^\]]*)\]\(([^)]+)\)$", stripped)
        if img:
            rel = img.group(2).strip()
            path = (ROOT / rel).resolve()
            i += 1
            caption = None
            if i < len(lines) and lines[i].strip().startswith("*Figure"):
                caption = lines[i].strip().strip("*")
                i += 1
            add_image(doc, path, caption)
            continue

        if stripped.startswith("*Figure") and stripped.endswith("*"):
            add_body(doc, stripped.strip("*"), italic=True, center=True, size=10)
            i += 1
            continue

        if stripped.startswith("|") and i + 1 < len(lines) and is_table_sep(lines[i + 1].strip()):
            rows = [parse_table_row(stripped)]
            i += 2
            while i < len(lines) and lines[i].strip().startswith("|"):
                rows.append(parse_table_row(lines[i]))
                i += 1
            add_table(doc, rows)
            continue

        heading = re.match(r"^(#{1,4})\s+(.*)$", stripped)
        if heading:
            level = len(heading.group(1)) - 1
            add_heading(doc, heading.group(2).strip(), level)
            i += 1
            continue

        bullet = re.match(r"^[-*]\s+(.*)$", stripped)
        if bullet:
            add_list_item(doc, bullet.group(1))
            i += 1
            continue

        numbered = re.match(r"^(\d+)\.\s+(.*)$", stripped)
        if numbered:
            add_list_item(doc, numbered.group(2), ordered=True, number=int(numbered.group(1)))
            i += 1
            continue

        add_body(doc, stripped)
        i += 1

    if pending_caption:
        add_body(doc, pending_caption, italic=True, center=True, size=10)

    written = []
    errors = []
    for name in WORD_NAMES:
        dest = ROOT / name
        try:
            doc.save(str(dest))
            written.append((dest, dest.stat().st_size, dest.stat().st_mtime))
        except PermissionError as err:
            fallback = ROOT / name.replace(".docx", " - UPDATED 22 AUG 2026.docx")
            doc.save(str(fallback))
            written.append((fallback, fallback.stat().st_size, fallback.stat().st_mtime))
            errors.append(f"{name} is open in Word ({err}). Saved fallback: {fallback.name}")

    print("WROTE")
    for path, size, mtime in written:
        print(f"{path.name} | {size} bytes")
    for err in errors:
        print("WARN", err)


if __name__ == "__main__":
    convert()
