# Pico runtime status

## Runtime contract

Each animation is a horizontal strip of 8 frames. The intended cell size is
256x256, giving a 2048x256 strip.

**Two strips do not currently meet that contract:**

| Strip | Actual | Contract |
|---|---|---|
| `pico-flap.png` | 512 x 64 | 2048 x 256 |
| `pico-pet-happy.png` | 512 x 64 | 2048 x 256 |

Both are 64px cells — a quarter of the intended resolution. The 8:1 aspect
ratio still slices correctly, so nothing breaks functionally, but these two are
upscaled hard at their display sizes: `flap` renders at 86px on the flight map
and 210px in the launch ceremony, and `pet-happy` at 180px on the home screen.
These are the two most-seen states in the app, so they are the worst two to be
short. `PicoSprite` renders nearest-neighbour rather than smoothed, which keeps
the upscale crisp instead of blurry, but resolution cannot be recovered by
rendering — both strips need re-exporting at 2048x256 from source.

## Done

- Animation timing and loop map for idle, walk, pet, eat, carry, takeoff, flap,
  glide, land, and deliver.
- `PicoSprite` React component with frame playback and completion callbacks.
- Reduced-motion behaviour: the frame loop does not run, and `onComplete` still
  fires on the animation's nominal duration so callers that sequence steps are
  not stranded.
- Strips are imported through Vite rather than referenced by a literal dev-server
  path, so they are fingerprinted and emitted by the production build. The
  earlier literal path 404'd in every build while the build still passed.
- Runtime asset path isolated from the master-sheet/source atlas so presentation
  art is never accidentally shipped as a sprite.
- `carry-scroll -> takeoff -> flap -> glide` is sequenced by the launch ceremony
  and verified end to end in a browser.

## Known gaps

- `walk` is still a deliberate alias to `idle`; it is the only remaining alias.
- The atlas and manifest in `assets/picoRuntime.ts` are built but unused —
  `PicoSprite` loads individual strips. Either point the renderer at the atlas
  or retire it; right now it reads as live infrastructure and is not.
- `land` has a strip and a config entry but no call site: nothing sequences a
  landing yet.

## Next

1. Re-export `flap` and `pet-happy` at 2048x256.
2. Sequence `land -> deliver` on arrival, which is where `land` earns its strip.
3. Decide the atlas question above before any PixiJS renderer work, so the
   renderer is written against whichever source of truth survives.
