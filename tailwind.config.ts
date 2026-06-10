import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: '#7C3AED',
        primaryLight: '#A855F7',
        secondary: '#0F172A',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        surface: '#FFFFFF',
        line: '#e2e8f0',
        muted: '#64748b'
      },
      boxShadow: {
        soft: '0 18px 60px rgba(124, 58, 237, 0.08)',
        panel: '0 14px 40px rgba(15, 23, 42, 0.08)'
      },
      backgroundImage: {
        'hero-grid': 'radial-gradient(circle at 1px 1px, rgba(124, 58, 237, 0.1) 1px, transparent 0)',
        'hero-glow': 'radial-gradient(circle at top right, rgba(124, 58, 237, 0.15), transparent 38%), radial-gradient(circle at left bottom, rgba(15, 23, 42, 0.05), transparent 42%)'
      }
    }
  },
  plugins: []
};

export default config;
