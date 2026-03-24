/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'space-void': 'oklch(0.06 0.02 275)',
        'space-deep': 'oklch(0.10 0.03 275)',
        'space-mid': 'oklch(0.14 0.04 275)',
        'space-elevated': 'oklch(0.18 0.05 270)',
        'nebula-violet': 'oklch(0.55 0.28 295)',
        'nebula-pink': 'oklch(0.65 0.22 345)',
        'nebula-cyan': 'oklch(0.72 0.16 200)',
        'nebula-gold': 'oklch(0.78 0.15 60)',
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
