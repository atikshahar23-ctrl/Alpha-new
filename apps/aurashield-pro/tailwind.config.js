/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: '#000000',
        phosphor: '#39ff14',
        'phosphor-dim': '#1f8c0c',
        violet: {
          deep: '#4c0f7a',
          glow: '#a855f7',
        },
        amber: { alert: '#ffb000' },
        blood: '#ff2d55',
        ash: '#4a5548',
      },
      fontFamily: {
        display: ['"Chakra Petch"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      // Numeric weights mirror the weights actually loaded from the font CDN,
      // so `font-600` maps 1:1 to a real cut rather than a synthesised one.
      fontWeight: {
        300: '300',
        400: '400',
        500: '500',
        600: '600',
        700: '700',
      },
      animation: {
        'pulse-alert': 'pulse-alert 900ms ease-in-out infinite',
        flicker: 'flicker 6s steps(1) infinite',
        drift: 'drift 90s linear infinite',
      },
      keyframes: {
        'pulse-alert': {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
        flicker: {
          '0%,96%,100%': { opacity: '1' },
          '97%': { opacity: '0.82' },
          '98%': { opacity: '1' },
          '99%': { opacity: '0.9' },
        },
        drift: { to: { transform: 'rotate(360deg)' } },
      },
    },
  },
  plugins: [],
};
