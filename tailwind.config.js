/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sbos-navy': '#1E2478',
        'sbos-royal': '#2C3FB8',
        'sbos-electric': '#3366FF',
        'sbos-ice': '#EEF3FF',
        'sbos-cloud': '#F8FAFF',
        'sbos-ink': '#101426',
        'sbos-slate': '#5E6B8A',
        'sbos-success': '#18C37E',
        'sbos-warning': '#F5A524',
      },
      fontFamily: {
        heading: ['Sora', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
        accent: ['Instrument Serif', 'serif'],
      },
      backgroundImage: {
        'blueprint-grid': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20z' fill='rgba(51,102,255,0.03)' fill-rule='evenodd'/%3E%3C/svg%3E\")",
      }
    },
  },
  plugins: [],
}
