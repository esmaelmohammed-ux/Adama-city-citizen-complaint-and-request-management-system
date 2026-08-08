"""Generate a clear, page-fit UML-style use case diagram PNG."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent / "assets" / "use-case-diagram.png"


def font(size: int, bold: bool = False):
    for name in (
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/calibrib.ttf" if bold else "C:/Windows/Fonts/calibri.ttf",
    ):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def text_size(draw: ImageDraw.ImageDraw, text: str, fnt) -> tuple[int, int]:
    box = draw.textbbox((0, 0), text, font=fnt)
    return box[2] - box[0], box[3] - box[1]


def draw_actor(draw, cx, top_y, label, fnt):
    head_r = 16
    hy = top_y
    draw.ellipse((cx - head_r, hy, cx + head_r, hy + 2 * head_r), outline="#111111", width=2)
    body_top = hy + 2 * head_r
    body_bot = body_top + 36
    draw.line((cx, body_top, cx, body_bot), fill="#111111", width=2)
    draw.line((cx - 24, body_top + 14, cx + 24, body_top + 14), fill="#111111", width=2)
    draw.line((cx, body_bot, cx - 18, body_bot + 28), fill="#111111", width=2)
    draw.line((cx, body_bot, cx + 18, body_bot + 28), fill="#111111", width=2)
    tw, th = text_size(draw, label, fnt)
    ly = body_bot + 34
    draw.text((cx - tw / 2, ly), label, fill="#111111", font=fnt)
    # association origin near torso
    return cx, body_top + 14, ly + th


def draw_uc(draw, cx, cy, text, fnt):
    pad_x, pad_y = 16, 10
    tw, th = text_size(draw, text, fnt)
    w = tw + pad_x * 2
    h = max(34, th + pad_y * 2)
    x0, y0 = cx - w / 2, cy - h / 2
    draw.ellipse((x0, y0, x0 + w, y0 + h), fill="#E8EEF7", outline="#003366", width=2)
    draw.text((cx - tw / 2, cy - th / 2 - 1), text, fill="#111111", font=fnt)
    return {"cx": cx, "cy": cy, "w": w, "h": h, "left": x0, "right": x0 + w, "top": y0, "bottom": y0 + h}


def line(draw, a, b, width=2, fill="#333333"):
    draw.line((a[0], a[1], b[0], b[1]), fill=fill, width=width)


def dashed_line(draw, a, b, dash=8, gap=6, fill="#555555"):
    x1, y1 = a
    x2, y2 = b
    length = ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5 or 1
    dx, dy = (x2 - x1) / length, (y2 - y1) / length
    pos = 0
    draw_on = True
    while pos < length:
        seg = dash if draw_on else gap
        end = min(pos + seg, length)
        if draw_on:
            line(
                draw,
                (x1 + dx * pos, y1 + dy * pos),
                (x1 + dx * end, y1 + dy * end),
                width=2,
                fill=fill,
            )
        pos = end
        draw_on = not draw_on


def main() -> None:
    W, H = 1300, 1680
    img = Image.new("RGB", (W, H), "white")
    draw = ImageDraw.Draw(img)

    title_f = font(20, bold=True)
    uc_f = font(14)
    actor_f = font(13, bold=True)
    note_f = font(12)

    # System boundary
    left, top, right, bottom = 200, 60, W - 200, H - 70
    draw.rectangle((left, top, right, bottom), outline="#003366", width=3)
    title = "Citizen Complaint and Service Request Management System"
    tw, th = text_size(draw, title, title_f)
    draw.rectangle(((W - tw) / 2 - 8, top + 10, (W + tw) / 2 + 8, top + 18 + th), fill="white")
    draw.text(((W - tw) / 2, top + 12), title, fill="#003366", font=title_f)

    # Actors outside boundary
    c_anchor = draw_actor(draw, 95, 380, "Citizen", actor_f)
    a_anchor = draw_actor(draw, W // 2, 8, "Administrator", actor_f)
    o_anchor = draw_actor(draw, W - 95, 380, "Department\nOfficer", actor_f)

    # Fix multi-line officer label: redraw cleanly
    draw.rectangle((W - 180, 470, W - 10, 530), fill="white")
    for i, part in enumerate(["Department", "Officer"]):
        pw, _ = text_size(draw, part, actor_f)
        draw.text((W - 95 - pw / 2, 478 + i * 18), part, fill="#111111", font=actor_f)

    col_c, col_s, col_a = 360, 650, 940
    y0, gap = 200, 58

    citizen_only = [
        "Register Account",
        "Submit Complaint",
        "Submit Service Request",
        "Track Submissions Status",
        "Update Profile",
    ]
    shared = [
        "Login",
        "View Notifications",
        "Update Status",
        "Search and Filter Submissions",
    ]
    admin_only = [
        "Manage Users",
        "Manage Departments",
        "Assign Submissions",
        "Generate Reports",
        "Monitor System Activities",
    ]
    officer_only = [
        "View Assigned Tasks",
        "Process Assigned Work",
        "Add Resolution Note",
    ]

    ucs = {}

    def place(items, x, start, prefix):
        for i, name in enumerate(items):
            ucs[f"{prefix}:{name}"] = draw_uc(draw, x, start + i * gap, name, uc_f)

    place(citizen_only, col_c, y0, "C")
    place(shared, col_s, y0 + 40, "S")
    place(admin_only, col_a, y0, "A")
    place(officer_only, col_a, y0 + len(admin_only) * gap + 30, "O")

    def link_left(actor_xy, uc):
        line(draw, (actor_xy[0] + 30, actor_xy[1]), (uc["left"], uc["cy"]))

    def link_right(actor_xy, uc):
        line(draw, (actor_xy[0] - 30, actor_xy[1]), (uc["right"], uc["cy"]))

    def link_top(actor_xy, uc):
        line(draw, (actor_xy[0], actor_xy[1] + 55), (uc["cx"], uc["top"]))

    # Citizen -> citizen + shared
    for name in citizen_only:
        link_left((c_anchor[0], c_anchor[1]), ucs[f"C:{name}"])
    for name in ("Login", "View Notifications"):
        link_left((c_anchor[0], c_anchor[1]), ucs[f"S:{name}"])

    # Admin -> admin + shared
    for name in admin_only:
        link_top((a_anchor[0], a_anchor[1]), ucs[f"A:{name}"])
    for name in shared:
        link_top((a_anchor[0], a_anchor[1]), ucs[f"S:{name}"])

    # Officer -> officer + shared (except maybe Register etc.)
    for name in officer_only:
        link_right((o_anchor[0], o_anchor[1]), ucs[f"O:{name}"])
    for name in ("Login", "View Notifications", "Update Status", "Search and Filter Submissions"):
        link_right((o_anchor[0], o_anchor[1]), ucs[f"S:{name}"])

    # <<include>> relationships
    includes = [
        ("C:Submit Complaint", "S:Login"),
        ("C:Submit Service Request", "S:Login"),
        ("A:Assign Submissions", "S:Update Status"),
        ("O:Process Assigned Work", "S:Update Status"),
    ]
    for src, dst in includes:
        a, b = ucs[src], ucs[dst]
        dashed_line(draw, (a["right"], a["cy"]), (b["left"], b["cy"]))
        mx = (a["right"] + b["left"]) / 2
        my = (a["cy"] + b["cy"]) / 2 - 10
        label = "<<include>>"
        lw, lh = text_size(draw, label, note_f)
        draw.rectangle((mx - lw / 2 - 3, my - 2, mx + lw / 2 + 3, my + lh + 2), fill="white")
        draw.text((mx - lw / 2, my), label, fill="#444444", font=note_f)

    footnote = "Figure: Use Case Diagram — associations from actors to use cases; dashed arrows are <<include>>"
    fw, _ = text_size(draw, footnote, note_f)
    draw.text(((W - fw) / 2, H - 42), footnote, fill="#444444", font=note_f)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, "PNG")
    print(f"Wrote {OUT} ({img.size[0]}x{img.size[1]}, {OUT.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
