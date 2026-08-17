# Pico runtime status

Completed in this slice:
- Normalized runtime contract: 8 x 256px frames per animation strip.
- Animation timing/loop map for idle, walk, pet, eat, carry, takeoff, flap, glide, land, and deliver.
- Reduced-motion behavior defined.
- React `PicoSprite` component added with frame playback and completion callbacks.
- Runtime asset path isolated from the master-sheet/source atlas so presentation art is never accidentally shipped as a sprite.

Completed in the current implementation slice:
- Dedicated glide, land, and deliver strips added to `production/pico-v1/runtime/`.
- `PicoSprite` now resolves the flight and delivery states to their own runtime strips; walk remains the only temporary alias to idle.

Next implementation slice:
1. Sequence `carry-scroll -> takeoff -> flap -> land -> deliver` during a test message.
2. Replace the React sprite-strip renderer with PixiJS `AnimatedSprite` inside Coop Town while preserving the same animation metadata.
