export const picoRuntime = {
  atlas: new URL('./asset-bank/production/pico-v1/pico-runtime-atlas-v1.webp', import.meta.url).href,
  manifest: new URL('./asset-bank/production/pico-v1/pico-runtime-atlas-v1.json', import.meta.url).href,
  animations: [
    'idle',
    'walk',
    'pet-happy',
    'eat',
    'carry-scroll',
    'takeoff',
    'flap',
    'glide',
    'deliver',
  ] as const,
} as const;

export type PicoAnimation = (typeof picoRuntime.animations)[number];
