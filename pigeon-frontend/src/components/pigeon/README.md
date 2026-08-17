# Pigeon runtime components

`PicoSprite.tsx` is the lightweight runtime animation bridge for the normalized Pico sprite strips. It deliberately uses the same frame contract that the future PixiJS `AnimatedSprite` implementation will use.

Current contract:
- 8 frames per strip
- 256x256 per frame
- 2048x256 strip
- transparent PNG
- reduced-motion freezes on frame 0
- non-looping actions call `onComplete`

The current art-direction atlas remains in `src/assets/asset-bank/production/pico-v1/`. Runtime strips belong in `src/assets/asset-bank/production/pico-v1/runtime/`.

Do not point production UI at a poster/master sheet. If a runtime strip is missing, `PicoSprite` falls back instead of displaying the source collage.
