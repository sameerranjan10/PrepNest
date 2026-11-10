/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#FFA116',
          50: '#FFFDF5',
          100: '#FFF8EE',
          200: '#FFECC7',
          300: '#FFDC97',
          400: '#FFBF54',
          500: '#FFA116',
          600: '#E68F0F',
          700: '#C27507',
          800: '#9B5B09',
          900: '#7E490C',
        },
        surface: {
          primary: '#FFFFFF',
          secondary: '#F7F8FA',
          tertiary: '#F1F3F5',
        },
        ink: {
          primary: '#262626',
          secondary: '#64748B',
          muted: '#94A3B8',
          subtle: '#CBD5E1',
        },
        line: {
          DEFAULT: '#E5E7EB',
          subtle: '#F1F3F5',
          dark: '#D1D5DB',
        },
        lc: {
          easy: '#00B8A3',
          easyBg: '#E6FAF6',
          medium: '#FFC01E',
          mediumBg: '#FFF9E6',
          hard: '#FF375F',
          hardBg: '#FFEBEF',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'elevated': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
        'dropdown': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
      },
      borderRadius: {
        'lc': '8px',
        'lc-lg': '10px',
        'lc-xl': '12px',
      },
    },
  },
  plugins: [],
};
