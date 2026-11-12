# Pico runtime status

## Runtime contract

Each animation is a horizontal strip of 8 frames, 256x256 per frame, 2048x256
total, transparent PNG. All ten strips meet it.

## Where the strips come from

Every strip is built by `tools/build_pico_strips.py` from one image: the
Character Design Sheet (`design/reference-sheets/`). That sheet is the only
place the default grey "Blue Bar" Pico is drawn in every pose, so cutting all
ten animations from it is what makes Pico one bird.

Before this, the strips were three different birds (grey pixel, white cartoon,
painted), five of them were truncated on upload and did not decode, and `walk`
did not exist.

The sheet has 18 poses, not 80 frames. Each strip is assembled from two to five
of those poses plus small position offsets. That reads as animation at sprite
size, but it is not hand-drawn in-betweening.

## Done

- All ten strips: idle, walk, pet-happy, eat, carry-scroll, takeoff, flap,
  glide, land, deliver.
- `PicoSprite` plays them, honours reduced motion, and can face Pico right
  (`flip`), which the flight map uses for eastbound routes.
- `land -> deliver` plays on arrival in the flight view.
- The unused atlas and its manifest are gone; strips are the single source.

## Known limits

- Frame count per pose is low. `glide` is one pose with a bob; `carry-scroll`
  is one pose with a bob.
- `pet-happy` and `deliver` use the sheet's "celebrate" pose, which is drawn
  slightly darker than the others.
- `walk` has a strip but no call site: Pico does not walk around Coop Town yet.

## Next

1. Hand-drawn or regenerated strips with true in-between frames. They drop in
   by filename; no code changes.
2. Give `walk` a job: Pico moving between rooftop objects.
