# Design source files

Everything here is source material. Nothing in this folder is loaded by the app.

## reference-sheets/

The 22 original design sheets, unchanged apart from their filenames. They were
renamed to lowercase kebab-case because one original name contained a colon,
which cannot be checked out on Windows.

These are reference posters, not sprite sheets: many poses and icons on one
image, at uneven sizes. Runtime art is cut from them by the scripts in
`pigeon-frontend/tools/`.

| File in this repo | Original filename |
| --- | --- |
| `pico-pigeon-messenger-asset-sheet-1.png` | Pico Pigeon Messenger Asset Sheet(1).png |
| `pico-pigeon-messenger-asset-sheet.png` | Pico Pigeon Messenger Asset Sheet.png |
| `pico-the-pigeon-production-asset-pack.png` | Pico the Pigeon Production Asset Pack.png |
| `picos-pixijs-runtime-integration-showcase.png` | Pico’s PixiJS Runtime Integration Showcase.png |
| `pigeon-messenger-asset-bank-poster.png` | Pigeon Messenger Asset Bank Poster.png |
| `pigeon-messenger-character-design-sheet.png` | Pigeon Messenger Character Design Sheet.png |
| `pigeon-messenger-customization-master-sheet.png` | Pigeon Messenger Customization Master Sheet.png |
| `pigeon-messenger-design-system-master-sheet.png` | Pigeon Messenger Design System Master Sheet.png |
| `pigeon-messenger-flight-experience-master-sheet.png` | Pigeon Messenger Flight Experience Master Sheet.png |
| `pigeon-messenger-journal-master-sheet-1.png` | Pigeon Messenger Journal Master Sheet(1).png |
| `pigeon-messenger-journal-master-sheet.png` | Pigeon Messenger Journal Master Sheet.png |
| `pigeon-messenger-rooftop-design-sheet.png` | Pigeon Messenger Rooftop Design Sheet.png |
| `pigeon-messenger-ui-master-sheet-1.png` | Pigeon Messenger UI Master Sheet(1).png |
| `pigeon-messenger-ui-master-sheet-2.png` | Pigeon Messenger UI Master Sheet(2).png |
| `pigeon-messenger-ui-master-sheet-3.png` | Pigeon Messenger UI Master Sheet(3).png |
| `pigeon-messenger-ui-master-sheet-4.png` | Pigeon Messenger UI Master Sheet(4).png |
| `pigeon-messenger-ui-master-sheet-5.png` | Pigeon Messenger UI Master Sheet(5).png |
| `pigeon-messenger-ui-master-sheet.png` | Pigeon Messenger UI Master Sheet.png |
| `pigeon-messenger-ux-design-showcase.png` | Pigeon Messenger UX Design Showcase.png |
| `pigeon-messenger-dusk-aviary-master-sheet.png` | Pigeon Messenger: Dusk Aviary Master Sheet.png |
| `image-gen-1-1.png` | image-gen-1(1).png |
| `image-gen-1.png` | image-gen-1.png |

Two sheets feed the app today:

- `pigeon-messenger-character-design-sheet.png` is the source of every Pico
  animation strip (`tools/build_pico_strips.py`).
- `pigeon-messenger-rooftop-design-sheet.png` is the source of the Coop Town
  rooftop layer (`tools/build_scene_layers.py`).

## figma-exports/

Icons and scene crops exported from the Figma file. The icons are inlined in
`pigeon-frontend/src/components/icons/DuskIcons.tsx`. `flight-sky.png` and
`flight-city.png` are the sky and city layers of Coop Town.

Not used, on purpose: `coop-town-rooftop.png` and `live-flight-scene.png` have
labels and place names printed into the image.

## GRAPHICS-INVENTORY.md

The audit of where each graphic came from and what was lost. It describes the
state before this folder existed; the "unavailable" strips it lists have since
been rebuilt from the Character Design Sheet.
