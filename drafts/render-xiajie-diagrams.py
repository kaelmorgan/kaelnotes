#!/usr/bin/env python3
"""Render Kael Notes diagrams for the 霞姐 生命靈數 review."""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path(
    "/Users/caspertong/Documents/Sourcetree/kaelnotes/public/reviews/honest-notes-xiajie-numerology-penang"
)

PAPER = (247, 244, 238)
RAISED = (255, 252, 247)
INK = (28, 25, 23)
MUTED = (87, 83, 78)
LINE = (231, 225, 214)
ACCENT = (49, 71, 90)
ACCENT_SOFT = (232, 238, 242)
MISSING = (236, 231, 222)
WHITE = (255, 252, 247)

SONG_REG = ImageFont.truetype(
    "/System/Library/Fonts/Supplemental/Songti.ttc", size=1, index=7
)
SONG_BOLD = ImageFont.truetype(
    "/System/Library/Fonts/Supplemental/Songti.ttc", size=1, index=2
)
HEI_MED = ImageFont.truetype("/System/Library/Fonts/STHeiti Medium.ttc", size=1, index=0)
HEI_LIGHT = ImageFont.truetype("/System/Library/Fonts/STHeiti Light.ttc", size=1, index=0)


def font(kind: str, size: int) -> ImageFont.FreeTypeFont:
    path_index = {
        "song": ("/System/Library/Fonts/Supplemental/Songti.ttc", 7),
        "song-bold": ("/System/Library/Fonts/Supplemental/Songti.ttc", 2),
        "hei": ("/System/Library/Fonts/STHeiti Medium.ttc", 0),
        "hei-light": ("/System/Library/Fonts/STHeiti Light.ttc", 0),
    }
    path, index = path_index[kind]
    return ImageFont.truetype(path, size=size, index=index)


def new_canvas(w: int, h: int) -> tuple[Image.Image, ImageDraw.ImageDraw]:
    img = Image.new("RGB", (w, h), PAPER)
    return img, ImageDraw.Draw(img)


def text_size(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont):
    box = draw.textbbox((0, 0), text, font=fnt)
    return box[2] - box[0], box[3] - box[1]


def draw_text(
    draw: ImageDraw.ImageDraw,
    xy: tuple[float, float],
    text: str,
    fnt: ImageFont.FreeTypeFont,
    fill=INK,
    anchor: str = "lt",
):
    draw.text(xy, text, font=fnt, fill=fill, anchor=anchor)


def rounded(draw: ImageDraw.ImageDraw, box, fill, outline=None, width=2, radius=28):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def dashed_rounded(draw, box, outline, radius=28, width=3, dash=14, gap=10):
    """Approximate a dashed rounded rect by stroking an offscreen path of segments."""
    x0, y0, x1, y1 = box
    # Draw light fill separately.
    pts = _rounded_rect_points(x0, y0, x1, y1, radius, step=4)
    # Walk the polyline and dash.
    def dist(a, b):
        return math.hypot(b[0] - a[0], b[1] - a[1])

    carry = 0.0
    drawing = True
    remaining = dash
    for i in range(len(pts) - 1):
        x_a, y_a = pts[i]
        x_b, y_b = pts[i + 1]
        seg_len = dist(pts[i], pts[i + 1])
        if seg_len == 0:
            continue
        consumed = 0.0
        while consumed < seg_len:
            take = min(remaining, seg_len - consumed)
            t0 = consumed / seg_len
            t1 = (consumed + take) / seg_len
            p0 = (x_a + (x_b - x_a) * t0, y_a + (y_b - y_a) * t0)
            p1 = (x_a + (x_b - x_a) * t1, y_a + (y_b - y_a) * t1)
            if drawing:
                draw.line([p0, p1], fill=outline, width=width)
            consumed += take
            remaining -= take
            if remaining <= 0:
                drawing = not drawing
                remaining = dash if drawing else gap


def _rounded_rect_points(x0, y0, x1, y1, r, step=6):
    r = min(r, (x1 - x0) / 2, (y1 - y0) / 2)
    pts = []

    def arc(cx, cy, start, end):
        a = start
        while a <= end:
            rad = math.radians(a)
            pts.append((cx + r * math.cos(rad), cy + r * math.sin(rad)))
            a += step

    # start at top-left after corner, go clockwise
    arc(x0 + r, y0 + r, 180, 270)  # TL
    pts.append((x1 - r, y0))
    arc(x1 - r, y0 + r, 270, 360)  # TR
    pts.append((x1, y1 - r))
    arc(x1 - r, y1 - r, 0, 90)  # BR
    pts.append((x0 + r, y1))
    arc(x0 + r, y1 - r, 90, 180)  # BL
    pts.append((x0, y0 + r))
    pts.append(pts[0])
    return pts


def header(draw, title: str, subtitle: str, x=64, y=48):
    draw_text(draw, (x, y), title, font("song-bold", 44), INK)
    draw_text(draw, (x, y + 62), subtitle, font("hei-light", 26), MUTED)
    return y + 110


def arrow_right(draw, x, y, color=ACCENT):
    draw.polygon([(x, y - 10), (x + 22, y), (x, y + 10)], fill=color)


def chip(draw, box, text, sub=None, fill=RAISED, outline=LINE, ink=INK):
    rounded(draw, box, fill=fill, outline=outline, width=2, radius=22)
    cx = (box[0] + box[2]) / 2
    cy = (box[1] + box[3]) / 2
    if sub:
        draw_text(draw, (cx, cy - 16), text, font("song-bold", 30), ink, "mm")
        draw_text(draw, (cx, cy + 22), sub, font("hei-light", 20), MUTED, "mm")
    else:
        draw_text(draw, (cx, cy), text, font("song-bold", 30), ink, "mm")


def save(img: Image.Image, name: str):
    path = OUT / name
    img.save(path, "PNG", optimize=True)
    print("wrote", path, img.size)


def draw_life_path_calc():
    w, h = 1600, 980
    img, d = new_canvas(w, h)
    y = header(d, "生命靈數怎麼算", "把出生年月日的每一位加總，還原到 1–9")

    # Example 1
    draw_text(d, (64, y), "例子　1990 年 8 月 15 日", font("hei", 26), ACCENT)
    y += 30
    boxes = [
        (64, y, 430, y + 150, "1990 / 08 / 15", "完整生日"),
        (520, y, 930, y + 150, "1+9+9+0+8+1+5", "= 33"),
        (1020, y, 1240, y + 150, "3 + 3", "繼續相加"),
        (1330, y, 1536, y + 150, "6", "主命數"),
    ]
    for i, (x0, y0, x1, y1, t, s) in enumerate(boxes):
        fill = ACCENT if i == 3 else RAISED
        ink = WHITE if i == 3 else INK
        outline = ACCENT if i == 3 else LINE
        chip(d, (x0, y0, x1, y1), t, s, fill=fill, outline=outline, ink=ink)
        if i < 3:
            arrow_right(d, x1 + 22, (y0 + y1) / 2)

    y += 210
    draw_text(d, (64, y), "同一套算法　周星馳 1962 年 6 月 22 日", font("hei", 26), ACCENT)
    y += 30
    boxes = [
        (64, y, 430, y + 150, "1962 / 06 / 22", "完整生日"),
        (520, y, 930, y + 150, "1+9+6+2+6+2+2", "= 28 → 10"),
        (1020, y, 1240, y + 150, "1 + 0", "還原"),
        (1330, y, 1536, y + 150, "1", "開創者"),
    ]
    for i, (x0, y0, x1, y1, t, s) in enumerate(boxes):
        fill = ACCENT if i == 3 else RAISED
        ink = WHITE if i == 3 else INK
        outline = ACCENT if i == 3 else LINE
        chip(d, (x0, y0, x1, y1), t, s, fill=fill, outline=outline, ink=ink)
        if i < 3:
            arrow_right(d, x1 + 22, (y0 + y1) / 2)

    y += 200
    rounded(d, (64, y, 1536, y + 120), ACCENT_SOFT, outline=None, radius=24)
    draw_text(
        d,
        (800, y + 44),
        "0 要加進去（它是位數），但九宮格裡 0 沒有宮位。",
        font("hei-light", 26),
        ACCENT,
        "mm",
    )
    draw_text(
        d,
        (800, y + 82),
        "大師數 11、22、33 有些老師會停住，不再還原。",
        font("hei-light", 24),
        MUTED,
        "mm",
    )
    save(img, "life-path-calc.png")


def draw_life_path_numbers():
    w, h = 1600, 1480
    img, d = new_canvas(w, h)
    y = header(d, "1–9 生命靈數", "傾向，不是職業分發。名人是公眾故事，不是命運證明。")

    cells = [
        ("1", "開創者", "我存在，我開創", "周星馳", "1962.06.22"),
        ("2", "協調者", "我連結，我支持", "齊秦", "1960.01.12"),
        ("3", "表達者", "我說，我分享", "成龍", "1954.04.07"),
        ("4", "建設者", "我規劃，我建立", "林俊傑", "1981.03.27"),
        ("5", "探索者", "我體驗，我成長", "楊紫瓊", "1962.08.06"),
        ("6", "責任者", "我愛，我守護", "李宗偉", "1982.10.21"),
        ("7", "思考者", "我探索，我找真理", "李小龍", "1940.11.27"),
        ("8", "成就者", "我掌控，我實現", "劉德華", "1961.09.27"),
        ("9", "完成者", "我給予，我影響", "周杰倫", "1979.01.18"),
    ]
    gap = 28
    left = 64
    top = y
    cell_w = (1600 - 64 * 2 - gap * 2) / 3
    cell_h = 380
    for i, (num, role, line, person, date) in enumerate(cells):
        col, row = i % 3, i // 3
        x0 = left + col * (cell_w + gap)
        y0 = top + row * (cell_h + gap)
        x1, y1 = x0 + cell_w, y0 + cell_h
        rounded(d, (x0, y0, x1, y1), RAISED, outline=LINE, width=2, radius=32)
        # number badge
        bx0, by0 = x0 + 36, y0 + 36
        d.ellipse((bx0, by0, bx0 + 76, by0 + 76), fill=ACCENT)
        draw_text(d, (bx0 + 38, by0 + 40), num, font("song-bold", 40), WHITE, "mm")
        draw_text(d, (x0 + 132, y0 + 58), role, font("song-bold", 36), INK)
        draw_text(d, (x0 + 36, y0 + 150), line, font("hei", 28), ACCENT)
        d.line((x0 + 36, y0 + 210, x1 - 36, y0 + 210), fill=LINE, width=2)
        draw_text(d, (x0 + 36, y0 + 248), person, font("song-bold", 32), INK)
        draw_text(d, (x0 + 36, y0 + 300), date, font("hei-light", 24), MUTED)

    save(img, "life-path-numbers.png")


def draw_grid(title, subtitle, cells, filename, footnote=None):
    """cells: list of 9 dicts row-major 1,4,7 / 2,5,8 / 3,6,9"""
    w, h = 1600, 1180 if footnote else 1080
    img, d = new_canvas(w, h)
    y = header(d, title, subtitle)

    order = [1, 4, 7, 2, 5, 8, 3, 6, 9]
    gap = 22
    left = 120
    top = y + 10
    size = 280
    # center the grid
    grid_w = size * 3 + gap * 2
    left = (w - grid_w) / 2

    lookup = {c["n"]: c for c in cells}

    for i, n in enumerate(order):
        col, row = i % 3, i // 3
        x0 = left + col * (size + gap)
        y0 = top + row * (size + gap)
        x1, y1 = x0 + size, y0 + size
        cell = lookup[n]
        missing = cell.get("missing", False)
        count = cell.get("count", 0)
        label = cell.get("label", "")
        extra = cell.get("extra", "")
        if missing:
            rounded(d, (x0, y0, x1, y1), MISSING, outline=None, radius=30)
            dashed_rounded(d, (x0 + 4, y0 + 4, x1 - 4, y1 - 4), MUTED, radius=28, width=3)
            draw_text(d, ((x0 + x1) / 2, y0 + 88), str(n), font("song-bold", 72), (170, 164, 154), "mm")
            draw_text(d, ((x0 + x1) / 2, y0 + 160), "缺數", font("hei", 28), MUTED, "mm")
            draw_text(d, ((x0 + x1) / 2, y0 + 210), label, font("hei-light", 24), MUTED, "mm")
        else:
            fill = ACCENT_SOFT if count >= 2 else RAISED
            rounded(d, (x0, y0, x1, y1), fill, outline=ACCENT if count >= 2 else LINE, width=3, radius=30)
            draw_text(d, ((x0 + x1) / 2, y0 + 88), str(n), font("song-bold", 78), ACCENT, "mm")
            # stacked pips
            if count:
                pip_y = y0 + 148
                total_w = count * 18 + (count - 1) * 8
                start = (x0 + x1) / 2 - total_w / 2 + 9
                for p in range(count):
                    cx = start + p * 26
                    d.ellipse((cx - 8, pip_y - 8, cx + 8, pip_y + 8), fill=ACCENT)
            draw_text(d, ((x0 + x1) / 2, y0 + 196), label, font("hei", 26), INK, "mm")
            if extra:
                draw_text(d, ((x0 + x1) / 2, y0 + 236), extra, font("hei-light", 22), MUTED, "mm")

    if footnote:
        fy = top + 3 * size + 2 * gap + 36
        draw_text(d, (w / 2, fy), footnote, font("hei-light", 24), MUTED, "mm")

    save(img, filename)


def draw_empty_grid():
    cells = [
        {"n": 1, "label": "自我 · 行動", "count": 0},
        {"n": 2, "label": "合作 · 感情", "count": 0},
        {"n": 3, "label": "表達 · 創意", "count": 0},
        {"n": 4, "label": "紀律 · 秩序", "count": 0},
        {"n": 5, "label": "自由 · 變化", "count": 0},
        {"n": 6, "label": "家庭 · 責任", "count": 0},
        {"n": 7, "label": "思考 · 學習", "count": 0},
        {"n": 8, "label": "事業 · 資源", "count": 0},
        {"n": 9, "label": "智慧 · 格局", "count": 0},
    ]
    # Legend board: labels only, no pips.
    for c in cells:
        c["count"] = 0
        c["extra"] = ""
        c["missing"] = False
    draw_grid(
        "九宮格　空盤",
        "左欄 1–2–3　中欄 4–5–6　右欄 7–8–9。這不是洛書。",
        cells,
        "jiugongge-empty.png",
        "把生日裡出現的數字填進去。0 不算。重複就疊上去。",
    )


def draw_filled_grids():
    def cell(n, count, label):
        if count == 0:
            return {"n": n, "missing": True, "label": label, "count": 0}
        extra = f"{count} 個" if count > 1 else "出現"
        return {"n": n, "count": count, "label": label, "extra": extra}

    labels = {
        1: "自我 · 行動",
        2: "合作 · 感情",
        3: "表達 · 創意",
        4: "紀律 · 秩序",
        5: "自由 · 變化",
        6: "家庭 · 責任",
        7: "思考 · 學習",
        8: "事業 · 資源",
        9: "智慧 · 格局",
    }
    # 1990-08-15 → 1,1,5,8,9,9
    counts_1990 = {1: 2, 2: 0, 3: 0, 4: 0, 5: 1, 6: 0, 7: 0, 8: 1, 9: 2}
    draw_grid(
        "九宮格　1990 年 8 月 15 日",
        "數字 1 1 5 8 9 9。缺 2、3、4、6、7。這是日曆，不是體檢。",
        [cell(n, counts_1990[n], labels[n]) for n in range(1, 10)],
        "jiugongge-1990.png",
        "空格是缺數。常見。不表示那個人身上缺了那個特質。",
    )
    # Jackie Chan 1954-04-07 → 1,9,5,4,4,7
    counts_jc = {1: 1, 2: 0, 3: 0, 4: 2, 5: 1, 6: 0, 7: 1, 8: 0, 9: 1}
    draw_grid(
        "九宮格　成龍　1954 年 4 月 7 日",
        "缺 3（表達）也缺 8（事業）。他剛好是兩者的反面。",
        [cell(n, counts_jc[n], labels[n]) for n in range(1, 10)],
        "jiugongge-jackie-chan.png",
        "缺 3 沒有刪掉他的聲音。缺 8 沒有刪掉他的票房。",
    )


def draw_personal_year():
    w, h = 1600, 1120
    img, d = new_canvas(w, h)
    y = header(d, "個人流年怎麼算", "只要出生月、出生日，和你在問的那一年。不需要出生年。")

    draw_text(d, (64, y), "例子　8 月 18 日 × 2026", font("hei", 26), ACCENT)
    y += 28
    row1 = [
        (64, y, 340, y + 140, "月  8", "出生月"),
        (410, y, 700, y + 140, "日  18 → 9", "1 + 8"),
        (770, y, 1080, y + 140, "基數  8", "8 + 9 = 17 → 8"),
        (1150, y, 1536, y + 140, "年  1", "2026 → 10 → 1"),
    ]
    for i, box in enumerate(row1):
        chip(d, box[:4], box[4], box[5])
        if i < 3:
            arrow_right(d, box[2] + 14, (box[1] + box[3]) / 2)

    y += 175
    rounded(d, (64, y, 1536, y + 130), ACCENT, outline=None, radius=28)
    draw_text(d, (800, y + 48), "8  +  1   =   9", font("song-bold", 48), WHITE, "mm")
    draw_text(d, (800, y + 98), "2026 是 9 年　收尾、給予、清理、完成", font("hei-light", 26), (214, 222, 228), "mm")

    y += 175
    draw_text(d, (64, y), "同一套算法　劉德華 9 月 27 日 × 2026", font("hei", 26), ACCENT)
    y += 28
    row2 = [
        (64, y, 340, y + 140, "月  9", "出生月"),
        (410, y, 700, y + 140, "日  27 → 9", "2 + 7"),
        (770, y, 1080, y + 140, "基數  9", "9 + 9 = 18 → 9"),
        (1150, y, 1536, y + 140, "年  1", "2026 → 1"),
    ]
    for i, box in enumerate(row2):
        chip(d, box[:4], box[4], box[5])
        if i < 3:
            arrow_right(d, box[2] + 14, (box[1] + box[3]) / 2)

    y += 175
    rounded(d, (64, y, 1536, y + 130), ACCENT_SOFT, outline=None, radius=28)
    draw_text(d, (800, y + 48), "9  +  1   =   1", font("song-bold", 48), ACCENT, "mm")
    draw_text(d, (800, y + 98), "8 的主命數走進 1 年　長期收成的人，碰上重新開始的天氣", font("hei-light", 26), MUTED, "mm")
    save(img, "personal-year-calc.png")


def draw_personal_year_cycle():
    w, h = 1600, 900
    img, d = new_canvas(w, h)
    y = header(d, "2026 個人流年　天氣圖", "不是預言。是你已經認識那個公眾故事之後，天氣讀起來的樣子。")

    items = [
        ("1", "開創", "劉德華"),
        ("2", "合作", "周星馳"),
        ("3", "表達", "成龍"),
        ("4", "建設", "林俊傑"),
        ("5", "變動", "李宗偉"),
        ("6", "責任", "楊紫瓊"),
        ("7", "內省", "鄧紫棋"),
        ("8", "收成", "Taylor Swift"),
        ("9", "完成", "張惠妹"),
    ]
    gap = 20
    left = 64
    top = y + 20
    cell_w = (1600 - 64 * 2 - gap * 8) / 9
    cell_h = 420
    for i, (num, weather, person) in enumerate(items):
        x0 = left + i * (cell_w + gap)
        y0 = top
        x1, y1 = x0 + cell_w, y0 + cell_h
        fill = ACCENT if num in {"3", "4", "9"} else RAISED
        ink = WHITE if fill == ACCENT else INK
        muted = (214, 222, 228) if fill == ACCENT else MUTED
        rounded(d, (x0, y0, x1, y1), fill, outline=None if fill == ACCENT else LINE, width=2, radius=28)
        draw_text(d, ((x0 + x1) / 2, y0 + 90), num, font("song-bold", 64), ink, "mm")
        draw_text(d, ((x0 + x1) / 2, y0 + 175), weather, font("hei", 28), ink, "mm")
        d.line((x0 + 28, y0 + 230, x1 - 28, y0 + 230), fill=muted, width=2)
        # wrap person if needed
        draw_text(d, ((x0 + x1) / 2, y0 + 290), person, font("hei-light", 22), muted, "mm")
        if num in {"3", "4", "9"}:
            draw_text(d, ((x0 + x1) / 2, y0 + 340), "雙重", font("hei", 20), muted, "mm")

    draw_text(
        d,
        (800, 820),
        "成龍 3+3　林俊傑 4+4　張惠妹 9+9　雙重很好玩，不是叫你去過他們的一年。",
        font("hei-light", 24),
        MUTED,
        "mm",
    )
    save(img, "personal-year-2026.png")


def draw_cover():
    """Editorial cover if we also keep the photo; this is a typographic lockup."""
    w, h = 1600, 900
    img, d = new_canvas(w, h)
    rounded(d, (48, 48, 1552, 852), RAISED, outline=LINE, width=2, radius=36)
    draw_text(d, (120, 160), "KAEL NOTES", font("hei", 22), MUTED)
    draw_text(d, (120, 230), "誠實筆記", font("song-bold", 42), ACCENT)
    draw_text(d, (120, 330), "霞姐", font("song-bold", 120), INK)
    draw_text(d, (120, 470), "生命靈數 · 九宮格 · 個人流年", font("song", 40), ACCENT)
    d.line((120, 540, 620, 540), fill=LINE, width=2)
    draw_text(d, (120, 590), "檳城的人生體驗顧問", font("hei-light", 32), MUTED)
    draw_text(d, (120, 650), "數字是門。不是房子。", font("hei", 30), INK)
    # decorative 3x3 mini
    s = 70
    ox, oy = 1120, 280
    nums = [1, 4, 7, 2, 5, 8, 3, 6, 9]
    for i, n in enumerate(nums):
        col, row = i % 3, i // 3
        x0 = ox + col * (s + 14)
        y0 = oy + row * (s + 14)
        rounded(d, (x0, y0, x0 + s, y0 + s), ACCENT_SOFT if n == 5 else PAPER, outline=LINE, width=2, radius=14)
        draw_text(d, (x0 + s / 2, y0 + s / 2 + 4), str(n), font("song-bold", 28), ACCENT, "mm")
    save(img, "cover-lockup.png")


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    draw_life_path_calc()
    draw_life_path_numbers()
    draw_empty_grid()
    draw_filled_grids()
    draw_personal_year()
    draw_personal_year_cycle()
    draw_cover()
    print("done")
