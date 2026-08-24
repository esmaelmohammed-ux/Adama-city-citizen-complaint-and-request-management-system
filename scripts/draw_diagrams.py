"""Draw academic UML/design diagrams for the Word documentation."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parents[1] / "scripts" / "assets" / "diagrams"
NAVY = (0, 51, 102)
NAVY2 = (16, 72, 128)
FILL = (247, 250, 252)
OVAL = (255, 255, 255)
LINE = (34, 34, 34)
GOLD = (184, 134, 11)
CTA = (229, 160, 16)
WHITE = (255, 255, 255)
HEADER = (0, 51, 102)
SOFT = (232, 238, 247)
ETH_GREEN = (7, 137, 48)
ETH_YELLOW = (252, 209, 22)
ETH_RED = (218, 18, 26)


def fonts():
    regular = ImageFont.truetype(r"C:\Windows\Fonts\arial.ttf", 16)
    small = ImageFont.truetype(r"C:\Windows\Fonts\arial.ttf", 13)
    tiny = ImageFont.truetype(r"C:\Windows\Fonts\arial.ttf", 11)
    bold = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 18)
    title = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 22)
    h = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 14)
    return regular, small, tiny, bold, title, h


def canvas(w, h, title):
    img = Image.new("RGB", (w, h), WHITE)
    draw = ImageDraw.Draw(img)
    _, _, _, _, title_f, _ = fonts()
    draw.rectangle((0, 0, w, 52), fill=NAVY)
    draw.text((24, 14), title, fill=WHITE, font=title_f)
    return img, draw


def text_size(draw, text, font):
    box = draw.textbbox((0, 0), text, font=font)
    return box[2] - box[0], box[3] - box[1]


def center_text(draw, xy, text, font, fill=LINE):
    x1, y1, x2, y2 = xy
    tw, th = text_size(draw, text, font)
    draw.text(((x1 + x2 - tw) / 2, (y1 + y2 - th) / 2), text, fill=fill, font=font)


def rounded(draw, xy, fill, outline=NAVY, width=2, radius=12):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def oval(draw, xy, text, font):
    draw.ellipse(xy, fill=OVAL, outline=NAVY, width=2)
    center_text(draw, xy, text, font, NAVY)


def actor(draw, cx, cy, label, font, bold):
    r = 16
    draw.ellipse((cx - r, cy - 58, cx + r, cy - 26), outline=NAVY, width=3)
    draw.line((cx, cy - 26, cx, cy + 8), fill=NAVY, width=3)
    draw.line((cx - 22, cy - 10, cx + 22, cy - 10), fill=NAVY, width=3)
    draw.line((cx, cy + 8, cx - 16, cy + 40), fill=NAVY, width=3)
    draw.line((cx, cy + 8, cx + 16, cy + 40), fill=NAVY, width=3)
    tw, _ = text_size(draw, label, bold)
    draw.text((cx - tw / 2, cy + 46), label, fill=NAVY, font=bold)


def arrow(draw, a, b, color=LINE, width=2):
    draw.line((a, b), fill=color, width=width)
    ang_x = b[0] - a[0]
    ang_y = b[1] - a[1]
    length = max((ang_x**2 + ang_y**2) ** 0.5, 1)
    ux, uy = ang_x / length, ang_y / length
    px, py = -uy, ux
    tip = b
    left = (tip[0] - 10 * ux + 5 * px, tip[1] - 10 * uy + 5 * py)
    right = (tip[0] - 10 * ux - 5 * px, tip[1] - 10 * uy - 5 * py)
    draw.polygon([tip, left, right], fill=color)


def crowfoot(draw, start, end, one_side="left"):
    draw.line((start, end), fill=NAVY, width=2)
    # simple 1 and many marks near the many end
    x, y = end
    draw.line((x - 10, y - 8, x, y), fill=NAVY, width=2)
    draw.line((x - 10, y + 8, x, y), fill=NAVY, width=2)
    draw.line((x - 10, y - 8, x - 10, y + 8), fill=NAVY, width=2)


def draw_use_case():
    regular, small, tiny, bold, title, h = fonts()
    img, draw = canvas(2000, 1320, "Figure 2.2  Use Case Diagram — Citizen Complaint System")
    actor(draw, 120, 640, "Citizen", small, bold)
    actor(draw, 1000, 130, "Administrator", small, bold)
    actor(draw, 1880, 640, "Department Officer", small, bold)

    rounded(draw, (250, 210, 1750, 1240), FILL, NAVY, 3, 8)
    draw.text((270, 222), "Web-Based Citizen Complaint Management System", fill=NAVY, font=h)

    citizen_uc = [
        (520, 310, "Register Account"),
        (520, 400, "Login"),
        (520, 490, "Submit Complaint"),
        (520, 580, "Edit Pending Complaint"),
        (520, 670, "Track Complaint Status"),
        (520, 760, "Update Profile"),
        (520, 850, "View Notifications"),
    ]
    admin_uc = [
        (1000, 310, "Manage Users"),
        (1000, 400, "Manage Departments"),
        (1000, 490, "Assign Complaints"),
        (1000, 580, "Search / Filter Complaints"),
        (1000, 670, "Generate Reports"),
        (1000, 760, "Monitor Activity Log"),
        (1000, 850, "Update Status"),
    ]
    officer_uc = [
        (1480, 400, "View Assigned Tasks"),
        (1480, 490, "Process Assigned Work"),
        (1480, 580, "Add Resolution Note"),
        (1480, 670, "View Notifications"),
        (1480, 760, "Update Status"),
    ]

    def box(cx, cy, label):
        w, ht = 230, 54
        xy = (cx - w, cy - ht / 2, cx + w, cy + ht / 2)
        oval(draw, xy, label, small)
        return xy

    c_xy = [box(x, y, t) for x, y, t in citizen_uc]
    a_xy = [box(x, y, t) for x, y, t in admin_uc]
    o_xy = [box(x, y, t) for x, y, t in officer_uc]

    def left_of(xy):
        return (xy[0], (xy[1] + xy[3]) / 2)

    def right_of(xy):
        return (xy[2], (xy[1] + xy[3]) / 2)

    def top_of(xy):
        return ((xy[0] + xy[2]) / 2, xy[1])

    for xy in c_xy:
        draw.line(((175, 640), left_of(xy)), fill=NAVY, width=2)
    for xy in a_xy:
        draw.line(((1000, 185), top_of(xy)), fill=NAVY, width=2)
    for xy in o_xy:
        draw.line(((1755, 640), right_of(xy)), fill=NAVY, width=2)

    draw.text((80, 1265), "Actors: Citizen, Administrator, Department Officer. Scope: complaints only (no service-request module).", fill=LINE, font=small)
    img.save(OUT / "fig-2-2-use-case.png", optimize=True)
    return OUT / "fig-2-2-use-case.png"


def entity_box(draw, x, y, w, title, fields, bold, tiny, small):
    row_h = 22
    h = 36 + row_h * len(fields) + 10
    rounded(draw, (x, y, x + w, y + h), WHITE, NAVY, 2, 6)
    draw.rectangle((x, y, x + w, y + 32), fill=NAVY)
    center_text(draw, (x, y, x + w, y + 32), title, bold, WHITE)
    for i, field in enumerate(fields):
        fy = y + 36 + i * row_h
        draw.text((x + 10, fy), field, fill=LINE, font=tiny)
    return x, y, x + w, y + h, (x + w / 2, y + h), (x + w / 2, y), (x, y + h / 2), (x + w, y + h / 2)


def label_mid(draw, a, b, text, font):
    mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
    tw, th = text_size(draw, text, font)
    draw.rectangle((mx - tw / 2 - 4, my - th / 2 - 2, mx + tw / 2 + 4, my + th / 2 + 2), fill=WHITE)
    draw.text((mx - tw / 2, my - th / 2), text, fill=NAVY, font=font)


def draw_er():
    regular, small, tiny, bold, title, h = fonts()
    img, draw = canvas(2000, 1280, "Figure 2.3  Entity-Relationship Diagram")
    user = entity_box(draw, 80, 90, 300, "USER", [
        "PK  _id", "UK  email", "fullName", "passwordHash", "role (citizen/admin/officer)",
        "phoneNumber", "FK  departmentId", "isActive", "createdAt / updatedAt",
    ], h, tiny, small)
    dept = entity_box(draw, 80, 560, 300, "DEPARTMENT", [
        "PK  _id", "UK  name", "description", "isActive", "createdAt",
    ], h, tiny, small)
    complaint = entity_box(draw, 820, 280, 360, "COMPLAINT", [
        "PK  _id", "UK  referenceId (CMP-YYYY-NNNN)", "title / description",
        "category", "location (Adama key)", "landmark", "status",
        "FK  citizenId", "FK  departmentId", "FK  assignedOfficerId",
        "photoUrl / resolutionNote", "createdAt / resolvedAt",
    ], h, tiny, small)
    notif = entity_box(draw, 1480, 80, 430, "NOTIFICATION", [
        "PK  _id", "FK  userId", "title / message", "relatedEntityType / Id",
        "isRead (auto-seen on open)", "createdAt",
    ], h, tiny, small)
    hist = entity_box(draw, 1480, 430, 430, "STATUS_HISTORY", [
        "PK  _id", "entityType / FK entityId", "fromStatus → toStatus",
        "note", "FK  changedBy", "changedAt",
    ], h, tiny, small)
    log = entity_box(draw, 1480, 780, 430, "ACTIVITY_LOG", [
        "PK  _id", "FK  userId", "action (assign / status_update)",
        "entityType / FK entityId", "details (names, not IDs)", "createdAt",
    ], h, tiny, small)

    draw.line((user[7], (complaint[0], complaint[1] + 80)), fill=NAVY, width=2)
    label_mid(draw, user[7], (complaint[0], complaint[1] + 80), "1  submits  *", tiny)
    draw.line((dept[7], (complaint[0], complaint[1] + 200)), fill=NAVY, width=2)
    label_mid(draw, dept[7], (complaint[0], complaint[1] + 200), "1  assigned to  *", tiny)
    draw.line((user[5], dept[4]), fill=NAVY, width=2)
    label_mid(draw, user[5], dept[4], "officer belongs to", tiny)
    draw.line((complaint[7], hist[6]), fill=NAVY, width=2)
    label_mid(draw, complaint[7], hist[6], "1  has  *", tiny)
    draw.line((user[7][0], user[1] + 40, notif[6][0], notif[6][1]), fill=NAVY, width=2)
    label_mid(draw, (user[7][0], user[1] + 40), notif[6], "1  receives  *", tiny)
    draw.line((user[5][0] + 80, user[3], log[6][0], log[6][1]), fill=NAVY, width=2)
    label_mid(draw, (user[5][0] + 80, user[3]), log[6], "1  performs  *", tiny)

    draw.text((80, 1220), "Cardinality: 1 = one, * = many. Implemented in MongoDB with Mongoose references (no SERVICE_REQUEST entity).", fill=LINE, font=small)
    img.save(OUT / "fig-2-3-er.png", optimize=True)
    return OUT / "fig-2-3-er.png"


def draw_architecture():
    regular, small, tiny, bold, title, h = fonts()
    img, draw = canvas(1600, 900, "Figure 2.1  System Architecture")
    layers = [
        (80, 90, 1440, 230, "Client Layer", ["Web Browser — React SPA (Vite)", "EN / Amharic / Afaan Oromo", "Guest UI, Login, Role dashboards"]),
        (80, 320, 900, 560, "Application Layer", ["Express REST API", "JWT Auth + RBAC", "Complaints, Users, Departments, Notifications"]),
        (980, 320, 1520, 560, "Optional AI sidecar", ["Writing assist / triage", "Resolution draft / chatbot", "Gemini / OpenAI / heuristic"]),
        (80, 650, 1520, 840, "Data Layer", ["MongoDB (users, complaints, departments, status history, notifications, activity logs)", "File storage for complaint photos"]),
    ]
    for x1, y1, x2, y2, name, items in layers:
        rounded(draw, (x1, y1, x2, y2), SOFT, NAVY, 2, 10)
        draw.rectangle((x1, y1, x2, y1 + 36), fill=NAVY)
        draw.text((x1 + 16, y1 + 8), name, fill=WHITE, font=h)
        for i, item in enumerate(items):
            draw.text((x1 + 20, y1 + 50 + i * 28), "•  " + item, fill=LINE, font=small)
    arrow(draw, (800, 230), (800, 320), NAVY, 3)
    arrow(draw, (1100, 230), (1220, 320), NAVY, 3)
    arrow(draw, (800, 560), (800, 650), NAVY, 3)
    img.save(OUT / "fig-2-1-architecture.png", optimize=True)
    return OUT / "fig-2-1-architecture.png"


def draw_dfd():
    regular, small, tiny, bold, title, h = fonts()
    img, draw = canvas(1600, 900, "Figure 2.4  Level-0 Data Flow Diagram")
    # external entities
    boxes = [
        (80, 360, 300, 500, "Citizen"),
        (1300, 120, 1520, 260, "Administrator"),
        (1300, 620, 1520, 760, "Department Officer"),
    ]
    for x1, y1, x2, y2, name in boxes:
        rounded(draw, (x1, y1, x2, y2), WHITE, NAVY, 3, 6)
        center_text(draw, (x1, y1, x2, y2), name, bold, NAVY)
    draw.ellipse((620, 300, 980, 620), fill=SOFT, outline=NAVY, width=3)
    center_text(draw, (620, 360, 980, 440), "Complaint", bold, NAVY)
    center_text(draw, (620, 430, 980, 510), "Web System", bold, NAVY)
    rounded(draw, (680, 720, 920, 840), WHITE, NAVY, 3, 4)
    center_text(draw, (680, 720, 920, 840), "MongoDB", h, NAVY)
    arrow(draw, (300, 410), (620, 430), NAVY, 2)
    draw.text((330, 380), "Submit / track complaint", fill=NAVY, font=tiny)
    arrow(draw, (620, 470), (300, 470), NAVY, 2)
    draw.text((330, 488), "Status / notifications", fill=NAVY, font=tiny)
    arrow(draw, (1300, 200), (980, 360), NAVY, 2)
    draw.text((1040, 240), "Assign / report", fill=NAVY, font=tiny)
    arrow(draw, (980, 400), (1300, 230), NAVY, 2)
    arrow(draw, (1300, 680), (980, 540), NAVY, 2)
    draw.text((1040, 620), "Process tasks", fill=NAVY, font=tiny)
    arrow(draw, (980, 560), (1300, 710), NAVY, 2)
    arrow(draw, (800, 620), (800, 720), NAVY, 2)
    arrow(draw, (820, 720), (820, 620), NAVY, 2)
    img.save(OUT / "fig-2-4-dfd.png", optimize=True)
    return OUT / "fig-2-4-dfd.png"


def flow_box(draw, xy, text, font, fill=WHITE):
    rounded(draw, xy, fill, NAVY, 2, 8)
    center_text(draw, xy, text, font, NAVY)


def diamond(draw, cx, cy, text, font):
    pts = [(cx, cy - 46), (cx + 150, cy), (cx, cy + 46), (cx - 150, cy)]
    draw.polygon(pts, fill=(255, 250, 235), outline=NAVY)
    tw, th = text_size(draw, text, font)
    draw.text((cx - tw / 2, cy - th / 2), text, fill=NAVY, font=font)


def draw_workflow():
    regular, small, tiny, bold, title, h = fonts()
    img, draw = canvas(1100, 1680, "Figure 2.5  Complaint Workflow")
    boxes = [
        (300, 80, 800, 140, "Citizen registers and logs in"),
        (300, 180, 800, 240, "Submit complaint (Adama location)"),
        (300, 360, 800, 420, "Stored as Pending + CMP- ID"),
        (300, 460, 800, 520, "Administrator reviews"),
        (80, 700, 400, 760, "Rejected — citizen notified"),
        (140, 860, 500, 920, "Department queue (still Pending)"),
        (600, 860, 1000, 920, "Officer assigned (In Progress)"),
        (300, 1060, 800, 1120, "Officer processes the complaint"),
        (80, 1280, 420, 1340, "Resolved"),
        (680, 1280, 1020, 1340, "Closed"),
        (300, 1480, 800, 1560, "Citizen sees status and notification"),
    ]
    for b in boxes:
        flow_box(draw, b[:4], b[4], small)
    diamond(draw, 550, 300, "Edit while pending?", small)
    diamond(draw, 550, 620, "Valid complaint?", small)
    diamond(draw, 550, 800, "Assign how?", small)
    diamond(draw, 550, 1200, "Outcome?", small)
    arrow(draw, (550, 140), (550, 180), NAVY)
    arrow(draw, (550, 240), (550, 254), NAVY)
    arrow(draw, (400, 300), (250, 300), NAVY)
    draw.line((250, 300, 250, 210), fill=NAVY, width=2)
    arrow(draw, (250, 210), (300, 210), NAVY)
    draw.text((80, 270), "Yes — edit", fill=NAVY, font=tiny)
    arrow(draw, (550, 346), (550, 360), NAVY)
    draw.text((560, 348), "No", fill=NAVY, font=tiny)
    arrow(draw, (550, 420), (550, 460), NAVY)
    arrow(draw, (550, 520), (550, 574), NAVY)
    arrow(draw, (400, 620), (240, 700), NAVY)
    draw.text((250, 640), "No", fill=NAVY, font=tiny)
    arrow(draw, (550, 666), (550, 754), NAVY)
    draw.text((560, 700), "Yes", fill=NAVY, font=tiny)
    arrow(draw, (400, 800), (320, 860), NAVY)
    draw.text((300, 820), "Dept only", fill=NAVY, font=tiny)
    arrow(draw, (700, 800), (800, 860), NAVY)
    draw.text((720, 820), "Officer", fill=NAVY, font=tiny)
    arrow(draw, (320, 920), (320, 1060), NAVY)
    draw.text((330, 980), "Start work", fill=NAVY, font=tiny)
    arrow(draw, (800, 920), (700, 1060), NAVY)
    arrow(draw, (550, 1120), (550, 1154), NAVY)
    arrow(draw, (400, 1200), (250, 1280), NAVY)
    arrow(draw, (700, 1200), (850, 1280), NAVY)
    arrow(draw, (250, 1340), (400, 1480), NAVY)
    arrow(draw, (850, 1340), (700, 1480), NAVY)
    arrow(draw, (240, 760), (240, 1520), NAVY)
    arrow(draw, (240, 1520), (300, 1520), NAVY)
    img.save(OUT / "fig-2-5-workflow.png", optimize=True)
    return OUT / "fig-2-5-workflow.png"


def draw_gantt():
    regular, small, tiny, bold, title, h = fonts()
    img, draw = canvas(1600, 740, "Figure 3.1  Project Timeline  (7 Jun – 16 Aug 2026)")
    week_labels = [
        "7–13 Jun",
        "14–20 Jun",
        "21–27 Jun",
        "28 Jun–4 Jul",
        "5–11 Jul",
        "12–18 Jul",
        "19–25 Jul",
        "26 Jul–1 Aug",
        "2–8 Aug",
        "9–16 Aug",
    ]
    rows = [
        ("Requirements & proposal", 0, 0),
        ("UI & API design", 0, 1),
        ("Project setup", 2, 2),
        ("Auth & users", 3, 3),
        ("Complaint APIs", 4, 4),
        ("Workflow & notifications", 5, 5),
        ("Citizen interface", 4, 6),
        ("Admin interface", 7, 7),
        ("Officer interface", 7, 8),
        ("Testing", 8, 9),
        ("Deployment & docs", 9, 9),
    ]
    left = 300
    top = 110
    week_w = 126
    date_font = _try_font(r"C:\Windows\Fonts\arial.ttf", 10)
    for w, label in enumerate(week_labels):
        x = left + w * week_w
        draw.text((x + 6, 58), f"W{w + 1}", fill=NAVY, font=tiny)
        draw.text((x + 6, 76), label, fill=NAVY, font=date_font)
        draw.line((x, 98, x, 700), fill=SOFT, width=1)
    end_x = left + len(week_labels) * week_w
    draw.line((end_x, 98, end_x, 700), fill=SOFT, width=1)
    for i, (name, start, end) in enumerate(rows):
        y = top + i * 52
        draw.text((18, y + 8), name, fill=LINE, font=small)
        x1 = left + start * week_w + 4
        x2 = left + (end + 1) * week_w - 8
        rounded(draw, (x1, y, x2, y + 28), NAVY, NAVY, 0, 6)
    img.save(OUT / "fig-3-1-gantt.png", optimize=True)
    return OUT / "fig-3-1-gantt.png"


def draw_org_chart():
    regular, small, tiny, bold, title, h = fonts()
    img, draw = canvas(1400, 720, "Figure 5.1  Organizational Chart (host office context)")
    boxes = [
        (430, 80, 970, 150, "Adama City Administration"),
        (430, 210, 970, 280, "Science and Technology Administration Office"),
        (80, 400, 380, 490, "ICT and systems\nsupport"),
        (510, 400, 890, 490, "Digital / SMART Adama\nservices"),
        (1020, 400, 1320, 490, "Administration and\ncoordination"),
        (430, 580, 970, 670, "Practical attachment student\n(complaint portal development)"),
    ]
    for b in boxes:
        rounded(draw, b[:4], SOFT, NAVY, 2, 10)
        center_text(draw, b[:4], b[4], h, NAVY)
    arrow(draw, (700, 150), (700, 210), NAVY, 3)
    arrow(draw, (700, 280), (230, 400), NAVY, 3)
    arrow(draw, (700, 280), (700, 400), NAVY, 3)
    arrow(draw, (700, 280), (1170, 400), NAVY, 3)
    arrow(draw, (700, 490), (700, 580), NAVY, 3)
    note = "Placement is shown for this attachment. Official titles should be confirmed with the host supervisor."
    draw.text((80, 688), note, fill=LINE, font=tiny)
    img.save(OUT / "fig-attachment-org-chart.png", optimize=True)
    return OUT / "fig-attachment-org-chart.png"


def _try_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except OSError:
        return ImageFont.truetype(r"C:\Windows\Fonts\arial.ttf", size)


def draw_cover_banner():
    """Navy-and-gold identity band for the Word cover — matches the Citizen Portal."""
    w, h = 1700, 430
    img = Image.new("RGB", (w, h), NAVY)
    draw = ImageDraw.Draw(img)
    display = _try_font(r"C:\Windows\Fonts\arialbd.ttf", 42)
    small = _try_font(r"C:\Windows\Fonts\arial.ttf", 18)
    motto_en = _try_font(r"C:\Windows\Fonts\arialbd.ttf", 28)
    ethiopic = _try_font(r"C:\Windows\Fonts\ebrima.ttf", 22)
    oromo = _try_font(r"C:\Windows\Fonts\ariali.ttf", 20)

    stripe_h = 8
    colors = [ETH_GREEN, ETH_YELLOW, ETH_RED]
    band = w // 3
    for i, color in enumerate(colors):
        draw.rectangle((i * band, 0, w if i == 2 else (i + 1) * band, stripe_h), fill=color)
    draw.rectangle((0, stripe_h, w, stripe_h + 4), fill=CTA)

    draw.text((48, 36), "ADAMA CITY ADMINISTRATION", fill=(197, 212, 232), font=small)
    draw.text((48, 72), "Science and Technology Office", fill=WHITE, font=small)
    draw.text((48, 130), "Citizen Complaint Portal", fill=WHITE, font=display)
    draw.rectangle((48, 192, 220, 198), fill=CTA)

    draw.text((48, 220), "Your City.  Your Voice.", fill=CTA, font=motto_en)
    draw.text((48, 268), "ከተማዎ።  ድምፅዎ።", fill=WHITE, font=ethiopic)
    draw.text((48, 308), "Magaalaa Keessan.  Sagalee Keessan.", fill=(232, 238, 247), font=oromo)

    draw.text((48, 372), "Haramaya University  ·  College of Computing and Informatics  ·  Summer 2026", fill=(197, 212, 232), font=small)
    img.save(OUT / "cover-banner.png", optimize=True)
    return OUT / "cover-banner.png"


def draw_deployment():
    regular, small, tiny, bold, title, h = fonts()
    img, draw = canvas(1600, 520, "Figure 3.2  Deployment Architecture")
    nodes = [
        (60, 180, 280, 340, "Users"),
        (360, 180, 640, 340, "Nginx\nReverse Proxy"),
        (740, 80, 1040, 220, "React static\nfiles"),
        (740, 280, 1040, 420, "Node API\n(PM2)"),
        (1140, 80, 1540, 220, "MongoDB\nAtlas / VPS"),
        (1140, 280, 1540, 420, "Upload\nstorage"),
    ]
    for n in nodes:
        rounded(draw, n[:4], SOFT, NAVY, 2, 10)
        center_text(draw, n[:4], n[4], h, NAVY)
    arrow(draw, (280, 260), (360, 260), NAVY, 3)
    arrow(draw, (640, 220), (740, 160), NAVY, 3)
    arrow(draw, (640, 300), (740, 340), NAVY, 3)
    arrow(draw, (1040, 150), (1140, 150), NAVY, 3)
    arrow(draw, (1040, 350), (1140, 350), NAVY, 3)
    img.save(OUT / "fig-3-2-deployment.png", optimize=True)
    return OUT / "fig-3-2-deployment.png"


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    files = [
        draw_architecture(),
        draw_use_case(),
        draw_er(),
        draw_dfd(),
        draw_workflow(),
        draw_gantt(),
        draw_deployment(),
        draw_org_chart(),
    ]
    for f in files:
        print(f.name, f.stat().st_size)


if __name__ == "__main__":
    main()
