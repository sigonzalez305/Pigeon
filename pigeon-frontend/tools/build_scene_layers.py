#!/usr/bin/env python3
"""Build Coop Town's three parallax layers.

Sky and city come from the Figma exports, which are clean. The rooftop comes
from the "Rooftop Foreground" panel of the Rooftop Design Sheet, the only
rendering of the coop, notice board, launch pad and mailbox without callout
labels printed over it. The panel's flat night backdrop is flooded away from
the top edge so the city shows behind the coop.

Layers are saved at 3x nearest-neighbour so the browser scales down from crisp
pixels instead of smoothing a small image up.

    python3 tools/build_scene_layers.py
"""
from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
FIGMA = ROOT / "design/figma-exports"
SHEET = ROOT / "design/reference-sheets/pigeon-messenger-rooftop-design-sheet.png"
OUT = ROOT / "pigeon-frontend/src/assets/asset-bank/production/coop-town"
UPSCALE = 3
ROOFTOP_BOX = (951, 411, 1445, 540)


def is_backdrop(p) -> bool:
    r, g, b, _ = p
    return max(r, g, b) < 34 and b >= r


def rooftop() -> Image.Image:
    img = Image.open(SHEET).convert("RGBA").crop(ROOFTOP_BOX)
    w, h = img.size
    px = img.load()
    seen = set()
    # Seed from the top edge and the upper part of both sides only: the floor
    # at the bottom is meant to fade into the dark and must not be removed.
    queue = deque([(x, 0) for x in range(w)])
    queue.extend((x, y) for y in range(int(h * 0.55)) for x in (0, w - 1))
    while queue:
        x, y = queue.popleft()
        if (x, y) in seen or x < 0 or y < 0 or x >= w or y >= int(h * 0.62):
            continue
        if not is_backdrop(px[x, y]):
            continue
        seen.add((x, y))
        px[x, y] = (0, 0, 0, 0)
        queue.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    return img


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    layers = {
        "sky.png": Image.open(FIGMA / "flight-sky.png").convert("RGBA"),
        "city.png": Image.open(FIGMA / "flight-city.png").convert("RGBA"),
        "rooftop.png": rooftop(),
    }
    for name, img in layers.items():
        big = img.resize((img.width * UPSCALE, img.height * UPSCALE), Image.NEAREST)
        big.save(OUT / name, optimize=True)
        print(name, big.size)


if __name__ == "__main__":
    main()
