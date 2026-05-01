import { fontFamily } from 'tailwindcss/defaultTheme';
import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas:   '#F4F3F0',
        surface:  '#FAFAF8',
        surface2: '#FFFFFF',
        ring:     '#E4E2DC',
        ink:    '#18181B',
        sub:    '#6B7280',
        ghost:  '#A1A1AA',
        brand: {
          50:  '#EEF0FB',
          100: '#D9DCFA',
          200: '#B8BCF4',
          300: '#8C91EC',
          400: '#6C71E3',
          500: '#4F54D8',
          600: '#3E43C4',
          700: '#3035A8',
          800: '#252A85',
          900: '#1C2068',
          950: '#11133F',
        },
        score: {
          low:  '#DC2626',
          mid:  '#D97706',
          good: '#059669',
          high: '#0D9488',
        },
        fire:  '#F97316',
        xp:    '#8B5CF6',
        gold:  '#EAB308',
      },

      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', ...fontFamily.serif],
        sans: ['Inter', ...fontFamily.sans],
        mono: ['"JetBrains Mono"', 'Menlo', ...fontFamily.mono],
      },

      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1.4' }],
        xs:    ['0.75rem',   { lineHeight: '1.5' }],
        sm:    ['0.875rem',  { lineHeight: '1.5' }],
        base:  ['1rem',      { lineHeight: '1.625' }],
        lg:    ['1.125rem',  { lineHeight: '1.5' }],
        xl:    ['1.375rem',  { lineHeight: '1.3' }],
        '2xl': ['1.625rem',  { lineHeight: '1.25' }],
        '3xl': ['2rem',      { lineHeight: '1.2' }],
      },

      borderRadius: {
        sm:    '0.25rem',
        DEFAULT: '0.375rem',
        md:    '0.5rem',
        lg:    '0.75rem',
        xl:    '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },

      boxShadow: {
        card:         '0 1px 3px rgba(24,24,27,0.05), 0 1px 2px rgba(24,24,27,0.04)',
        lifted:       '0 4px 12px rgba(24,24,27,0.07), 0 2px 4px rgba(24,24,27,0.04)',
        panel:        '0 8px 24px rgba(24,24,27,0.09), 0 2px 8px rgba(24,24,27,0.05)',
        modal:        '0 24px 64px rgba(24,24,27,0.15), 0 4px 16px rgba(24,24,27,0.08)',
        'glow-xp':    '0 0 20px rgba(139,92,246,0.35)',
        'glow-fire':  '0 0 20px rgba(249,115,22,0.40)',
        'glow-brand': '0 0 24px rgba(79,84,216,0.30)',
        glass:        'inset 0 1px 0 rgba(255,255,255,0.6), 0 2px 8px rgba(24,24,27,0.06)',
      },

      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #4F54D8 0%, #3035A8 100%)',
        'xp-gradient':    'linear-gradient(90deg, #8B5CF6 0%, #6D28D9 100%)',
        'score-gradient': 'linear-gradient(90deg, #DC2626 0%, #D97706 40%, #059669 70%, #0D9488 100%)',
        'fire-gradient':  'linear-gradient(180deg, #FCD34D 0%, #F97316 60%, #DC2626 100%)',
        'glass-surface':  'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.4) 100%)',
        'streak-card':    'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
        'levelup-card':   'linear-gradient(135deg, #EEF0FB 0%, #F5F3FF 50%, #EDE9FE 100%)',
      },

      animation: {
        'fade-up':    'fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
        'scale-in':   'scaleIn 0.25s cubic-bezier(0.16,1,0.3,1) forwards',
        'shimmer':    'shimmer 1.6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'streak-in':  'streakIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'score-fill': 'scoreFill 1s cubic-bezier(0.16,1,0.3,1) forwards',
        'float':      'float 3s ease-in-out infinite',
        'count-up':   'countUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
      },

      keyframes: {
        fadeUp:    { '0%': { opacity:0, transform:'translateY(8px)' },   '100%': { opacity:1, transform:'translateY(0)' } },
        scaleIn:   { '0%': { opacity:0, transform:'scale(0.95)' },        '100%': { opacity:1, transform:'scale(1)' } },
        shimmer:   { '0%,100%': { backgroundPosition:'200% 0' },          '50%':  { backgroundPosition:'-200% 0' } },
        pulseGlow: { '0%,100%': { opacity:1 },                            '50%':  { opacity:0.6 } },
        streakIn:  { '0%': { opacity:0, transform:'scale(0.7) rotate(-10deg)' }, '100%': { opacity:1, transform:'scale(1) rotate(0deg)' } },
        scoreFill: { '0%': { width:'0%' },                                '100%': { width:'var(--score-width)' } },
        float:     { '0%,100%': { transform:'translateY(0)' },            '50%':  { transform:'translateY(-6px)' } },
        countUp:   { '0%': { opacity:0, transform:'translateY(4px)' },    '100%': { opacity:1, transform:'translateY(0)' } },
      },

      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '20px',
      },
    },
  },

  plugins: [
    plugin(function({ addUtilities, addComponents, theme }) {
      addComponents({
        '.glass': {
          background:           'rgba(255,255,255,0.65)',
          backdropFilter:       'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border:               '1px solid rgba(255,255,255,0.5)',
          boxShadow:            theme('boxShadow.glass'),
        },
        '.glass-dark': {
          background:           'rgba(24,24,27,0.65)',
          backdropFilter:       'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border:               '1px solid rgba(255,255,255,0.08)',
        },
        '.input-premium': {
          background:   theme('colors.surface'),
          border:       `1px solid ${theme('colors.ring')}`,
          borderRadius: theme('borderRadius.lg'),
          padding:      `${theme('spacing.3')} ${theme('spacing.4')}`,
          fontSize:     theme('fontSize.sm')[0],
          color:        theme('colors.ink'),
          transition:   'border-color 150ms, box-shadow 150ms',
          outline:      'none',
          '&:focus': {
            borderColor: theme('colors.brand.400'),
            boxShadow:   '0 0 0 3px rgba(79,84,216,0.12)',
          },
          '&::placeholder': { color: theme('colors.ghost') },
        },
        '.card': {
          background:   theme('colors.surface'),
          border:       `1px solid ${theme('colors.ring')}`,
          borderRadius: theme('borderRadius.xl'),
          boxShadow:    theme('boxShadow.card'),
        },
        '.card-lifted': {
          background:   theme('colors.surface'),
          border:       `1px solid ${theme('colors.ring')}`,
          borderRadius: theme('borderRadius.xl'),
          boxShadow:    theme('boxShadow.lifted'),
          transition:   'box-shadow 150ms, transform 150ms',
          '&:hover': {
            boxShadow: theme('boxShadow.panel'),
            transform: 'translateY(-1px)',
          },
        },
      });

      addUtilities({
        '.tabular': { fontVariantNumeric: 'tabular-nums' },
        '.text-gradient-brand': {
          background:           theme('backgroundImage.brand-gradient'),
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor:  'transparent',
          backgroundClip:       'text',
        },
        '.text-gradient-xp': {
          background:           theme('backgroundImage.xp-gradient'),
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor:  'transparent',
          backgroundClip:       'text',
        },
      });
    }),
  ],
};
