/**
 * Runtime sprite registry for Pico.
 *
 * Strips are imported through Vite rather than referenced by a literal path.
 * A hardcoded '/src/assets/...' string works under the dev server and resolves
 * to nothing in a build: the files are never emitted, the URL 404s, and every
 * sprite silently degrades to its text placeholder in production while the
 * build still reports success.
 */
const stripModules = import.meta.glob<string>(
  './asset-bank/production/pico-v1/runtime/*.png',
  { eager: true, query: '?url', import: 'default' },
);

/** Animation name (strip filename minus the `pico-` prefix) to emitted asset URL. */
export const picoStrips: Record<string, string> = Object.fromEntries(
  Object.entries(stripModules).map(([path, url]) => {
    const fileName = path.split('/').pop() ?? '';
    const name = fileName.replace(/^pico-/, '').replace(/\.png$/, '');
    return [name, url];
  }),
);

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
    'land',
    'deliver',
  ] as const,
} as const;

export type PicoAnimation = (typeof picoRuntime.animations)[number];
