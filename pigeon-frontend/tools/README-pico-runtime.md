# Pico Runtime Asset Pipeline

This is the normalization step between the approved Pico art sheets and the runtime sprites used by the app.

## Runtime contract

Every Pico animation is exported as one horizontal transparent PNG strip:

- 8 frames
- 256x256 pixels per frame
- 2048x256 total sheet size
- transparent RGBA background
- pigeon visually centered on a consistent ground/flight anchor
- no labels, borders, poster UI, or neighboring assets

Runtime animation names:

`idle`, `walk`, `pet-happy`, `eat`, `carry-scroll`, `takeoff`, `flap`, `glide`, `land`, `deliver`

## Why normalize

The master sheets are art-direction references. They are not safe runtime atlases because frames have different bounds and include presentation graphics. PixiJS and React need predictable frame rectangles so animation never jumps, clips, or changes scale.

## Output paths

```text
src/assets/asset-bank/production/pico-v1/runtime/
  pico-idle.png
  pico-walk.png
  pico-pet-happy.png
  pico-eat.png
  pico-carry-scroll.png
  pico-takeoff.png
  pico-flap.png
  pico-glide.png
  pico-land.png
  pico-deliver.png
```

`pico-atlas-layout.json` is the source of truth for FPS, loop behavior, frame count, and dimensions.

## Renderer rule

The React component reads these horizontal strips using `background-position`. The same frame metadata is compatible with a future PixiJS `Texture` / `AnimatedSprite` implementation, so the UI can be prototyped before the Coop Town Pixi scene is complete.

## Quality check

Before an asset is marked production-ready:

1. All 8 cells are exactly 256x256.
2. The pigeon never touches the cell edge.
3. Feet remain on the same baseline for grounded animations.
4. Flight sprites use a consistent center-of-mass anchor.
5. Transparent pixels contain no poster/text remnants.
6. Animation is readable at 64px and 128px rendered sizes.
7. Reduced-motion mode can freeze on frame 0.
