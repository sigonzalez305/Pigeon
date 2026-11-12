/** @type {import('tailwindcss').Config} */

// Dusk Aviary is the design system. The previous neon/dark/ui palettes are gone
// rather than merely unused, so a stray `bg-dark-900` or `text-neon-cyan` fails
// loudly instead of quietly reintroducing the old look on one screen.
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'slate-dusk': '#1B1F2A',
        'coop-char': '#12151D',
        petrol: '#2FBFA3',
        'feather-magenta': '#E0509A',
        wheat: '#E8D9B5',
        'sky-ash': '#8A93A6',
        surface: {
          raised: '#202633',
          soft: '#171B25',
        },
        text: {
          primary: '#F4F1E8',
          secondary: '#8A93A6',
        },
      },
      borderColor: {
        subtle: 'rgba(138, 147, 166, 0.24)',
      },
      fontFamily: {
        // Pixel treatment belongs to the game/system voice, not every heading.
        pixel: ['"Press Start 2P"', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        lift: '0 10px 30px rgba(0, 0, 0, 0.35)',
        petrol: '0 0 16px rgba(47, 191, 163, 0.28)',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 0.5s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
}
