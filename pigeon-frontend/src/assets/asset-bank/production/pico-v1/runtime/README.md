# Pico runtime strips

Each strip is 8 frames, 256x256 per frame, 2048x256 total, transparent PNG.

These files are generated. Do not edit them by hand: change
`pigeon-frontend/tools/build_pico_strips.py` and re-run it.

    python3 tools/build_pico_strips.py

To replace a strip with hand-drawn art, save it here under the same filename
and remove its entry from `STRIPS` in the script so it is not overwritten.
