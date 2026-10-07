const color = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;
const semantic = (name) => ({
  DEFAULT: color(name),
  subtle: color(`${name}-subtle`),
  ink: color(`${name}-ink`),
});
const blue = {
  50: color('blue-subtle'), 100: color('blue-subtle'),
  500: color('blue-ink'), 600: color('blue-ink'),
  700: color('blue-strong'), 800: color('blue-strong'), 900: color('blue-strong'),
};

/** @type {import('tailwindcss').Config} */
export default {
  content: {
    relative: true,
    files: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  },
  theme: {
    extend: {
      colors: {
        canvas: color('canvas'),
        surface: color('surface'),
        charcoal: color('charcoal'),
        graphite: color('charcoal-soft'),
        ink: color('text'),
        muted: color('muted'),
        secondary: color('secondary'),
        line: { DEFAULT: color('border'), strong: color('border-strong') },
        accent: { DEFAULT: color('lime'), hover: color('lime-hover') },
        info: semantic('blue'),
        success: semantic('green'),
        warning: semantic('amber'),
        danger: semantic('coral'),
        // Compatibility aliases let existing pages inherit the foundation
        // without changing their markup, layout or behavior.
        gray: {
          50: color('canvas'), 100: color('surface'), 200: color('border'),
          300: color('border-strong'), 400: color('muted'), 500: color('muted'),
          600: color('secondary'), 700: color('secondary'),
          800: color('charcoal'), 900: color('text'),
        },
        primary: blue,
        blue,
        indigo: blue,
        green: { 100: color('green-subtle'), 600: color('green-ink'), 800: color('green-ink') },
        yellow: { 100: color('amber-subtle'), 600: color('amber-ink'), 800: color('amber-ink') },
        orange: { 100: color('amber-subtle'), 800: color('amber-ink') },
        red: {
          50: color('coral-subtle'), 100: color('coral-subtle'),
          500: color('coral-ink'), 600: color('coral-ink'),
          700: color('coral-strong'), 800: color('coral-strong'), 900: color('coral-strong'),
        },
      },
      fontFamily: { sans: ['var(--font-sans)'] },
      spacing: { panel: 'var(--space-panel)', section: 'var(--space-section)' },
      borderRadius: {
        md: 'var(--radius-control)', lg: 'var(--radius-card)',
        xl: 'var(--radius-panel)', full: 'var(--radius-pill)',
      },
      boxShadow: {
        sm: 'var(--shadow-soft)', md: 'var(--shadow-card)', xl: 'var(--shadow-floating)',
      },
    },
  },
  plugins: [],
};
