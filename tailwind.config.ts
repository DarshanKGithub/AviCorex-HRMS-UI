import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        surface: '#fcfcfe',
        line: '#e7e9ef',
        lavender: '#cac8f9',
        muted: '#c3c1c1',
        indigoSoft: '#b2aef2',
        indigo: '#928ddd'
      },
      boxShadow: {
        soft: '0 18px 60px rgba(146, 141, 221, 0.14)',
        panel: '0 14px 40px rgba(17, 24, 39, 0.08)'
      },
      backgroundImage: {
        'hero-grid': 'radial-gradient(circle at 1px 1px, rgba(146, 141, 221, 0.14) 1px, transparent 0)',
        'hero-glow': 'radial-gradient(circle at top right, rgba(178, 174, 242, 0.45), transparent 38%), radial-gradient(circle at left bottom, rgba(202, 200, 249, 0.55), transparent 42%)'
      }
    }
  },
  plugins: []
};

export default config;
