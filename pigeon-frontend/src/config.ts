/**
 * Demo mode runs the whole app in the browser with no server: requests are
 * answered by src/demo/demoBackend.ts and stored in localStorage. It exists so
 * the prototype can be hosted on a static site (GitHub Pages). It is a build
 * flag, never a runtime switch, so a real deployment cannot fall into it.
 */
export const DEMO_MODE = import.meta.env.VITE_DEMO === 'true';
