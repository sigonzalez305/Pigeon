# Pigeon Messenger Asset Bank

This directory is the production asset source of truth for the Dusk Aviary visual system.

## Purpose
The asset bank translates the approved master sheets into production-ready assets for React, PixiJS, Framer Motion, and future native shells.

## Folders
- pigeons/ — character art, sprite sheets, plumage variants, gear overlays
- coop/ — Coop Town environment layers, props, interactables
- flight/ — U.S. route map assets, markers, weather overlays, flight ribbon art
- messaging/ — scrolls, message-card embellishments, avatars, empty-state art
- journal/ — paper textures, stamps, badges, achievement art
- icons/ — production SVG icon set
- ui/ — decorative frames, dividers, chips, buttons, status art
- audio/ — reserved for future Howler-ready sound assets

## Production Rules
1. UI icons should be SVG whenever possible.
2. Pixel-world sprites should be PNG or WebP with transparent backgrounds.
3. Sprite sheets must use consistent frame boxes and nearest-neighbor rendering.
4. Do not use emoji as production graphics.
5. Petrol (#2FBFA3) represents motion/action.
6. Feather Magenta (#E0509A) represents delivered/read/completed states.
7. Wheat (#E8D9B5) represents paper, scrolls, warmth, and sentimental surfaces.
8. Area-code routes and precision routes must have distinct marker treatments.
9. Precise coordinates must never be encoded into publicly reusable static art.

## First Production Pack
The first implementation pack should contain:
- Pico default Blue Bar portrait
- Pico overworld idle sprite sheet
- Pico takeoff/flight/landing sprite sheet
- Coop Town parallax background layers
- Coop door, mailbox, launch pad, notice board, food bowl
- U.S. route map base
- origin/destination/area-code/precision markers
- clear/rain/storm/night weather icons
- Flight Ribbon status art
- parchment scroll textures
- achievement badge base frames

## Naming
Use lowercase kebab-case filenames.

Examples:
- pico-blue-bar-portrait.webp
- pico-idle-spritesheet.png
- coop-town-sky-dusk.webp
- flight-map-us-base.webp
- marker-precision.svg
- weather-light-rain.svg
- ribbon-in-flight.svg

## Scale Targets
- Overworld pigeon: 32–64 px rendered height
- Flight-map pigeon: 24–32 px rendered height
- Profile pigeon: 256 px+
- Icons: 24 px base grid
- Touch targets: minimum 44x44 CSS px
