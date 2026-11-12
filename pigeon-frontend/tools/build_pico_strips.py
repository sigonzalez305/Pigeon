#!/usr/bin/env python3
"""Build Pico's runtime sprite strips from the Character Design Sheet.

Why this exists: the strips first committed for Pico were a mix of three
different birds (a grey pixel pigeon, a white cartoon one, a painted one), and
five of them were truncated on upload and never decoded. The Character Design
Sheet is the one place the default "Blue Bar" Pico is drawn consistently in
every pose, so every strip is cut from it. One source, one bird.

Each pose is lifted off the sheet's paper background, scaled to a common body
size, and placed in a 256x256 cell. A strip is 8 cells: 2048x256, transparent.

    python3 tools/build_pico_strips.py

Needs Pillow. Re-run after changing a pose box or a frame recipe.
"""
from __future__ import annotations

import sys
from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SHEET = ROOT / "design/reference-sheets/pigeon-messenger-character-design-sheet.png"
OUT = ROOT / "pigeon-frontend/src/assets/asset-bank/production/pico-v1/runtime"

CELL = 256
FRAMES = 8
GROUND_Y = 232  # feet baseline for standing poses
AIR_Y = 132     # vertical centre for flying poses

# name: (x0, y0, x1, y1, scale, anchor). Boxes are generous; the pose is
# trimmed to its own pixels after the paper is removed. The bottom row of the
# sheet is drawn about 1.3x larger than the rest, hence the smaller scale.
S, L = 2.2, 1.7
POSES = {
    "idle1":    (40, 472, 150, 566, S, "ground"),
    "idle2":    (150, 472, 250, 566, S, "ground"),
    "walk1":    (250, 472, 345, 566, S, "ground"),
    "walk2":    (345, 472, 440, 566, S, "ground"),
    "hop":      (440, 472, 540, 566, S, "ground"),
    "peck":     (540, 472, 640, 566, S, "ground"),
    "eat":      (640, 472, 748, 566, S, "ground"),
    "carry":    (50, 596, 160, 682, S, "ground"),
    "prepare":  (165, 596, 270, 682, S, "ground"),
    "takeoff1": (275, 596, 378, 682, S, "air"),
    "takeoff2": (385, 596, 490, 682, S, "air"),
    "flap":     (500, 596, 600, 682, S, "air"),
    "glide":    (605, 596, 748, 682, S, "air"),
    "tired":    (45, 708, 170, 826, L, "air"),
    "landing1": (190, 708, 310, 826, L, "air"),
    "landing2": (335, 708, 455, 826, L, "ground"),
    "deliver":  (485, 708, 600, 826, L, "ground"),
    "celebrate": (605, 708, 748, 826, L, "ground"),
}

# Animation recipes: 8 x (pose, dx, dy) in output pixels. dy is negative-up.
STRIPS = {
    "idle": [("idle1", 0, 0), ("idle1", 0, 0), ("idle1", 0, -2), ("idle1", 0, -2),
             ("idle1", 0, 0), ("idle2", 0, 0), ("idle1", 0, 0), ("idle1", 0, 0)],
    "walk": [("walk1", 0, 0), ("idle1", 0, -2), ("walk2", 0, 0), ("idle1", 0, -2),
             ("walk1", 0, 0), ("idle1", 0, -2), ("walk2", 0, 0), ("idle1", 0, -2)],
    "pet-happy": [("idle1", 0, 0), ("idle2", 0, 2), ("celebrate", 0, -4), ("celebrate", 0, -12),
                  ("celebrate", 0, -4), ("celebrate", 0, -12), ("idle2", 0, 0), ("idle1", 0, 0)],
    "eat": [("idle1", 0, 0), ("peck", 0, 0), ("eat", 0, 0), ("peck", 0, 0),
            ("eat", 0, 0), ("peck", 0, 0), ("eat", 0, 0), ("idle2", 0, 0)],
    "carry-scroll": [("carry", 0, 0), ("carry", 0, 0), ("carry", 0, -3), ("carry", 0, -3),
                     ("carry", 0, 0), ("carry", 0, 0), ("carry", 0, -3), ("carry", 0, -3)],
    "takeoff": [("prepare", 0, 0), ("prepare", 0, 4), ("takeoff1", 0, 44), ("takeoff1", 0, 30),
                ("takeoff2", 0, 18), ("flap", 0, 8), ("takeoff2", 0, 0), ("flap", 0, -6)],
    "flap": [("flap", 0, -5), ("glide", 0, 0), ("takeoff2", 0, 5), ("glide", 0, 0),
             ("flap", 0, -5), ("glide", 0, 0), ("takeoff2", 0, 5), ("glide", 0, 0)],
    "glide": [("glide", 0, 0), ("glide", 0, -2), ("glide", 0, -4), ("glide", 0, -5),
              ("glide", 0, -4), ("glide", 0, -2), ("glide", 0, 0), ("glide", 0, 2)],
    "land": [("glide", 0, -6), ("tired", 0, 0), ("landing1", 0, 10), ("landing1", 0, 22),
             ("landing2", 0, -6), ("landing2", 0, 0), ("prepare", 0, 0), ("idle1", 0, 0)],
    "deliver": [("idle1", 0, 0), ("deliver", 0, 0), ("deliver", 0, 0), ("deliver", 0, -3),
                ("celebrate", 0, -4), ("celebrate", 0, -12), ("celebrate", 0, -4), ("deliver", 0, 0)],
}


def lift_off_paper(crop: Image.Image) -> Image.Image:
    """Remove the paper background by flooding inward from the crop's edges.

    A global colour key would also eat the scroll and the pale wing feathers,
    which are close to the paper colour. Flooding from the outside stops at
    Pico's dark outline, so anything enclosed by it is kept whatever its colour.
    The soft drop shadow under the feet is paper-coloured enough to be flooded
    away with the paper.
    """
    img = crop.convert("RGBA")
    w, h = img.size
    px = img.load()

    def is_paper(p) -> bool:
        r, g, b, _ = p
        # Paper and its shadow are warm and light: red above blue, never dark.
        return r > 150 and g > 135 and b > 110 and (r - b) > 8

    seen = [[False] * h for _ in range(w)]
    queue = deque()
    for x in range(w):
        queue.append((x, 0)); queue.append((x, h - 1))
    for y in range(h):
        queue.append((0, y)); queue.append((w - 1, y))
    while queue:
        x, y = queue.popleft()
        if x < 0 or y < 0 or x >= w or y >= h or seen[x][y]:
            continue
        if not is_paper(px[x, y]):
            continue
        seen[x][y] = True
        px[x, y] = (0, 0, 0, 0)
        queue.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))

    # Two passes over the fringe: anti-aliased pixels between the outline and
    # the paper are a blend of both and read as a pale halo on a dark screen.
    for _ in range(2):
        fringe = []
        for x in range(w):
            for y in range(h):
                r, g, b, a = px[x, y]
                if a == 0 or not (r > 120 and g > 105 and (r - b) > 10):
                    continue
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= nx < w and 0 <= ny < h and px[nx, ny][3] == 0:
                        fringe.append((x, y))
                        break
        for x, y in fringe:
            px[x, y] = (0, 0, 0, 0)
    return img


def clear_leg_gap(img: Image.Image) -> Image.Image:
    """Clear paper trapped between the legs, which the edge flood cannot reach.

    Limited to the lower third and to near-white paper, so it cannot touch the
    neutral grey feathers. Not used on poses that hold a scroll at foot level:
    the scroll is close enough to paper to be mistaken for it.
    """
    w, h = img.size
    px = img.load()
    for x in range(w):
        for y in range(int(h * 0.66), h):
            r, g, b, a = px[x, y]
            if a and r > 205 and g > 190 and b > 165 and 12 < (r - b) < 50:
                px[x, y] = (0, 0, 0, 0)
    return img


def drop_specks(img: Image.Image, keep_small: bool) -> Image.Image:
    """Remove stray islands (label fragments, paper grain) left by the flood.

    Poses with intentional loose pixels (seeds, sparkles) keep anything of a
    reasonable size; everything else keeps only the bird.
    """
    w, h = img.size
    px = img.load()
    label = [[0] * h for _ in range(w)]
    sizes = {}
    current = 0
    for sx in range(w):
        for sy in range(h):
            if px[sx, sy][3] == 0 or label[sx][sy]:
                continue
            current += 1
            count = 0
            queue = deque([(sx, sy)])
            label[sx][sy] = current
            while queue:
                x, y = queue.popleft()
                count += 1
                for nx in (x - 1, x, x + 1):
                    for ny in (y - 1, y, y + 1):
                        if 0 <= nx < w and 0 <= ny < h and not label[nx][ny] and px[nx, ny][3]:
                            label[nx][ny] = current
                            queue.append((nx, ny))
            sizes[current] = count
    if not sizes:
        return img
    biggest = max(sizes.values())
    floor = 6 if keep_small else biggest * 0.5
    for x in range(w):
        for y in range(h):
            if label[x][y] and sizes[label[x][y]] < floor:
                px[x, y] = (0, 0, 0, 0)
    return img


def load_poses() -> dict[str, tuple[Image.Image, str]]:
    sheet = Image.open(SHEET).convert("RGBA")
    poses = {}
    for name, (x0, y0, x1, y1, scale, anchor) in POSES.items():
        cut = lift_off_paper(sheet.crop((x0, y0, x1, y1)))
        if anchor == "ground" and name not in ("carry", "deliver"):
            cut = clear_leg_gap(cut)
        cut = drop_specks(cut, keep_small=name in ("eat", "celebrate"))
        box = cut.getchannel("A").getbbox()
        if box is None:
            raise SystemExit(f"pose {name}: nothing left after removing the paper")
        cut = cut.crop(box)
        size = (round(cut.width * scale), round(cut.height * scale))
        poses[name] = (cut.resize(size, Image.NEAREST), anchor)
    return poses


def build() -> None:
    poses = load_poses()
    OUT.mkdir(parents=True, exist_ok=True)
    for strip_name, recipe in STRIPS.items():
        assert len(recipe) == FRAMES, strip_name
        strip = Image.new("RGBA", (CELL * FRAMES, CELL), (0, 0, 0, 0))
        for i, (pose_name, dx, dy) in enumerate(recipe):
            sprite, anchor = poses[pose_name]
            if sprite.width > CELL or sprite.height > CELL:
                raise SystemExit(f"{pose_name} is larger than a cell: {sprite.size}")
            x = (CELL - sprite.width) // 2 + dx
            y = (GROUND_Y - sprite.height if anchor == "ground" else AIR_Y - sprite.height // 2) + dy
            x = max(0, min(CELL - sprite.width, x))
            y = max(0, min(CELL - sprite.height, y))
            strip.alpha_composite(sprite, (i * CELL + x, y))
        path = OUT / f"pico-{strip_name}.png"
        strip.save(path, optimize=True)
        print(f"{path.relative_to(ROOT)}  {strip.size}")

    # Browser tab icon: Pico's standing pose on the app's base colour.
    sprite, _ = poses["idle1"]
    icon = Image.new("RGBA", (192, 192), (27, 31, 42, 255))
    icon.alpha_composite(sprite, ((192 - sprite.width) // 2, (192 - sprite.height) // 2))
    public = ROOT / "pigeon-frontend/public"
    public.mkdir(exist_ok=True)
    icon.save(public / "pico-icon.png", optimize=True)


if __name__ == "__main__":
    if not SHEET.exists():
        sys.exit(f"missing source sheet: {SHEET}")
    build()
