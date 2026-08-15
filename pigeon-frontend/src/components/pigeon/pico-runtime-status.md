# Pico runtime status

Completed in this slice:
- Normalized runtime contract: 8 x 256px frames per animation strip.
- Animation timing/loop map for idle, walk, pet, eat, carry, takeoff, flap, glide, land, and deliver.
- Reduced-motion behavior defined.
- React `PicoSprite` component added with frame playback and completion callbacks.
- Runtime asset path isolated from the master-sheet/source atlas so presentation art is never accidentally shipped as a sprite.

Next implementation slice:
1. Commit the normalized transparent PNG strips into `production/pico-v1/runtime/`.
2. Wire `PicoSprite` into Coop Town, pigeon selection, and SendFlow.
3. Sequence `carry-scroll -> takeoff -> flap -> land -> deliver` during a test message.
4. Replace the React sprite-strip renderer with PixiJS `AnimatedSprite` inside Coop Town while preserving the same animation metadata.
