/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#F8FAFC',
        card: '#FFFFFF',
        border: '#E2E8F0',
        brand: {
          DEFAULT: '#1D4ED8',
          light: '#DBEAFE',
        },
        text: {
          primary: '#0F172A',
          secondary: '#64748B',
          muted: '#94A3B8',
        },
        status: {
          red: '#DC2626',
          redLight: '#FEF2F2',
          amber: '#D97706',
          amberLight: '#FFFBEB',
          orange: '#EA580C',
          orangeLight: '#FFF7ED',
          blue: '#2563EB',
          blueLight: '#EFF6FF',
          green: '#16A34A',
          greenLight: '#F0FDF4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
