/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      borderRadius: {
        app: '8px'
      },
      colors: {
        accent: {
          amber: 'rgb(var(--color-accent-amber) / <alpha-value>)',
          blue: 'rgb(var(--color-accent-blue) / <alpha-value>)',
          green: 'rgb(var(--color-accent-green) / <alpha-value>)',
          red: 'rgb(var(--color-accent-red) / <alpha-value>)',
          violet: 'rgb(var(--color-accent-violet) / <alpha-value>)'
        },
        border: 'rgb(var(--color-border) / <alpha-value>)',
        canvas: 'rgb(var(--color-canvas) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          hover: 'rgb(var(--color-primary-hover) / <alpha-value>)',
          soft: 'rgb(var(--color-primary-soft) / <alpha-value>)'
        },
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        text: {
          DEFAULT: 'rgb(var(--color-text) / <alpha-value>)',
          muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
          soft: 'rgb(var(--color-text-soft) / <alpha-value>)'
        }
      },
      boxShadow: {
        panel: '0 16px 48px rgb(15 23 42 / 0.08)'
      }
    }
  },
  plugins: []
}
