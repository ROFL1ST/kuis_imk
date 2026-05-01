import { fontFamily } from 'tailwindcss/defaultTheme';
import plugin from 'tailwindcss/plugin';

// Art direction: EdTech / AI grading SaaS
// Palette: warm zinc neutrals + Indigo-500 brand + amber streak + violet XP
// Typography: Plus Jakarta Sans (display 24px+) + Inter (body) + JetBrains Mono (scores)

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // ─── Surfaces & Text ──────────────────────────────────────────────
      colors: {
        // Warm zinc neutrals — no pure gray, no pure white
        canvas:     '#F8F8F7',
        surface:    '#FEFEFE',
        surface2:   '#FFFFFF',
        surfaceOff: '#F2F1EE',
        ring:       '#E5E4E0',
        divider:    '#EBEBEA',

        // Text scale — warm slate
        ink:   '#1C1B1A',
        sub:   '#57534E',
        ghost: '#A8A29E',
        muted: '#78716C',

        // Brand — Indigo (specific hue, not generic blue-purple)
        brand: {
          25:  '#F5F5FF',
          50:  '#EDEDFD',
          100: '#D9D9FC',
          200: '#B5B4F9',
          300: '#8785F4',
          400: '#6461EF',
          500: '#4F4DE8',
          600: '#3F3DCF',
          700: '#3130A8',
          800: '#252380',
          900: '#1A1860',
          950: '#0F0E3A',
        },

        // SBERT score spectrum — used in SBERTScoreViz
        score: {
          low:    '#EF4444',   // 0.00–0.39
          midlow: '#F97316',   // 0.40–0.54
          mid:    '#EAB308',   // 0.55–0.64
          good:   '#22C55E',   // 0.65–0.84
          high:   '#0D9488',   // 0.85–1.00
        },

        // Gamification tokens
        xp:   '#7C3AED',
        fire: '#F97316',
        gold: '#D97706',

        // Status
        success: '#16A34A',
        warning: '#D97706',
        error:   '#DC2626',
        info:    '#2563EB',
      },

      // ─── Typography ───────────────────────────────────────────────────
      fontFamily: {
        // Plus Jakarta Sans — modern, confident; use at 24px+ ONLY (display role)
        display: ['"Plus Jakarta Sans"', 'system-ui', ...fontFamily.sans],
        // Inter — SaaS density at 14-16px
        sans:    ['Inter', 'system-ui', ...fontFamily.sans],
        // JetBrains Mono — SBERT scores, numeric metrics
        mono:    ['"JetBrains Mono"', 'Menlo', ...fontFamily.mono],
      },

      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1.4' }],
        xs:    ['0.75rem',   { lineHeight: '1.5' }],
        sm:    ['0.875rem',  { lineHeight: '1.5' }],
        base:  ['1rem',      { lineHeight: '1.625' }],
        lg:    ['1.125rem',  { lineHeight: '1.5' }],
        xl:    ['clamp(1.375rem,1.1rem+0.6vw,1.625rem)', { lineHeight: '1.3' }],
        '2xl': ['clamp(1.625rem,1.2rem+1vw,2rem)',        { lineHeight: '1.25' }],
        '3xl': ['clamp(2rem,1.4rem+1.5vw,2.5rem)',        { lineHeight: '1.2' }],
      },

      // ─── Spacing (4px base) ───────────────────────────────────────────
      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '15':  '3.75rem',
        '18':  '4.5rem',
        '22':  '5.5rem',
      },

      // ─── Border Radius ────────────────────────────────────────────────
      borderRadius: {
        sm:      '0.25rem',
        DEFAULT: '0.375rem',
        md:      '0.5rem',
        lg:      '0.75rem',
        xl:      '1rem',
        '2xl':   '1.25rem',
        '3xl':   '1.5rem',
        full:    '9999px',
      },

      // ─── Shadows — OKLCH, tone-matched to warm zinc surfaces ──────────
      boxShadow: {
        xs:     '0 1px 2px oklch(0.2 0.005 60 / 0.05)',
        sm:     '0 1px 3px oklch(0.2 0.005 60 / 0.06), 0 1px 2px oklch(0.2 0.005 60 / 0.04)',
        card:   '0 2px 8px oklch(0.2 0.005 60 / 0.06), 0 1px 2px oklch(0.2 0.005 60 / 0.04)',
        lifted: '0 4px 16px oklch(0.2 0.005 60 / 0.08), 0 2px 4px oklch(0.2 0.005 60 / 0.04)',
        panel:  '0 8px 28px oklch(0.2 0.005 60 / 0.10), 0 2px 8px oklch(0.2 0.005 60 / 0.05)',
        modal:  '0 24px 64px oklch(0.2 0.005 60 / 0.16), 0 4px 16px oklch(0.2 0.005 60 / 0.08)',
        // Gamification glow — use only on gamification UI, not general cards
        'glow-xp':    '0 0 0 3px oklch(0.5 0.22 290 / 0.20), 0 0 24px oklch(0.5 0.22 290 / 0.30)',
        'glow-fire':  '0 0 0 3px oklch(0.65 0.20 45 / 0.20), 0 0 20px oklch(0.65 0.20 45 / 0.35)',
        'glow-brand': '0 0 0 3px oklch(0.55 0.22 270 / 0.20), 0 0 24px oklch(0.55 0.22 270 / 0.25)',
        'glow-score': '0 0 0 3px oklch(0.55 0.16 165 / 0.20), 0 0 20px oklch(0.55 0.16 165 / 0.25)',
        glass:        'inset 0 1px 0 oklch(1 0 0 / 0.55), 0 2px 8px oklch(0.2 0.005 60 / 0.06)',
        focus:        '0 0 0 3px oklch(0.55 0.22 270 / 0.18)',
        'focus-error':'0 0 0 3px oklch(0.55 0.20 27 / 0.20)',
        'focus-ok':   '0 0 0 3px oklch(0.55 0.16 145 / 0.18)',
      },

      // ─── Background Gradients ─────────────────────────────────────────
      backgroundImage: {
        'brand-gradient':   'linear-gradient(135deg, #4F4DE8 0%, #3130A8 100%)',
        'xp-gradient':      'linear-gradient(90deg, #7C3AED 0%, #5B21B6 100%)',
        // Full score spectrum — applied to SBERTScoreViz bar
        'score-gradient':   'linear-gradient(90deg, #EF4444 0%, #F97316 22%, #EAB308 44%, #22C55E 66%, #0D9488 100%)',
        'fire-gradient':    'linear-gradient(160deg, #FDE68A 0%, #F97316 55%, #DC2626 100%)',
        'glass-light':      'linear-gradient(135deg, oklch(1 0 0 / 0.72) 0%, oklch(1 0 0 / 0.44) 100%)',
        'grading-header':   'linear-gradient(135deg, #1A1860 0%, #3130A8 50%, #4F4DE8 100%)',
        'levelup-card':     'linear-gradient(135deg, #EDEDFD 0%, #F5F0FF 50%, #EDE9FE 100%)',
        'streak-card':      'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
        'sidebar-active':   'linear-gradient(90deg, oklch(0.55 0.22 270 / 0.12) 0%, transparent 100%)',
        'greeting-surface': 'linear-gradient(135deg, #F8F8F7 0%, #EDEDFD 100%)',
      },

      // ─── Animations ───────────────────────────────────────────────────
      animation: {
        'fade-up':       'fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in':       'fadeIn 0.25s ease both',
        'scale-in':      'scaleIn 0.30s cubic-bezier(0.16,1,0.3,1) both',
        'slide-right':   'slideRight 0.30s cubic-bezier(0.16,1,0.3,1) both',
        'shimmer':       'shimmer 1.6s linear infinite',
        'pulse-glow':    'pulseGlow 2.4s ease-in-out infinite',
        'score-fill':    'scoreFill 1.1s cubic-bezier(0.16,1,0.3,1) forwards',
        'count-up':      'countUp 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'streak-pop':    'streakPop 0.55s cubic-bezier(0.16,1,0.3,1) both',
        'float':         'float 3.5s ease-in-out infinite',
        'marker-appear': 'markerAppear 0.6s cubic-bezier(0.16,1,0.3,1) both',
      },

      keyframes: {
        fadeUp:      { from: { opacity:'0', transform:'translateY(10px)' }, to: { opacity:'1', transform:'translateY(0)' } },
        fadeIn:      { from: { opacity:'0' }, to: { opacity:'1' } },
        scaleIn:     { from: { opacity:'0', transform:'scale(0.94)' }, to: { opacity:'1', transform:'scale(1)' } },
        slideRight:  { from: { opacity:'0', transform:'translateX(-12px)' }, to: { opacity:'1', transform:'translateX(0)' } },
        shimmer:     { from: { backgroundPosition:'200% 0' }, to: { backgroundPosition:'-200% 0' } },
        pulseGlow:   { '0%,100%': { opacity:'1' }, '50%': { opacity:'0.55' } },
        scoreFill:   { from: { width:'0%', opacity:'0' }, to: { width:'var(--score-w)', opacity:'1' } },
        countUp:     { from: { opacity:'0', transform:'translateY(6px)' }, to: { opacity:'1', transform:'translateY(0)' } },
        streakPop:   { '0%': { opacity:'0', transform:'scale(0.6) rotate(-12deg)' }, '100%': { opacity:'1', transform:'scale(1) rotate(0deg)' } },
        float:       { '0%,100%': { transform:'translateY(0)' }, '50%': { transform:'translateY(-7px)' } },
        markerAppear:{ from: { opacity:'0', transform:'translateY(-8px) scale(0.8)' }, to: { opacity:'1', transform:'translateY(0) scale(1)' } },
      },

      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '12px',
        lg: '20px',
        xl: '32px',
      },
    },
  },

  plugins: [
    plugin(function({ addUtilities, addComponents, theme }) {

      // ── Components ────────────────────────────────────────────────────
      addComponents({
        // Glassmorphism — use on floating panels over rich backgrounds only
        '.glass': {
          background:           'oklch(1 0 0 / 0.65)',
          backdropFilter:       'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          border:               '1px solid oklch(1 0 0 / 0.50)',
          boxShadow:            theme('boxShadow.glass'),
        },
        // Standard card — border is alpha-blended, NOT solid gray
        '.card': {
          background:   theme('colors.surface'),
          border:       '1px solid oklch(0.2 0.005 60 / 0.10)',
          borderRadius: theme('borderRadius.xl'),
          boxShadow:    theme('boxShadow.card'),
        },
        // Elevated card with subtle hover lift
        '.card-lifted': {
          background:   theme('colors.surface'),
          border:       '1px solid oklch(0.2 0.005 60 / 0.10)',
          borderRadius: theme('borderRadius.xl'),
          boxShadow:    theme('boxShadow.card'),
          transition:   'box-shadow 200ms cubic-bezier(0.16,1,0.3,1), transform 200ms cubic-bezier(0.16,1,0.3,1)',
          '&:hover': {
            boxShadow: theme('boxShadow.lifted'),
            transform: 'translateY(-2px)',
          },
        },
        // Premium textarea/input
        '.input-premium': {
          background:   theme('colors.surfaceOff'),
          border:       '1px solid oklch(0.2 0.005 60 / 0.13)',
          borderRadius: theme('borderRadius.lg'),
          padding:      '0.75rem 1rem',
          fontSize:     theme('fontSize.sm')[0],
          color:        theme('colors.ink'),
          transition:   'border-color 150ms, box-shadow 150ms',
          outline:      'none',
          '&:focus': {
            borderColor: theme('colors.brand.400'),
            boxShadow:   theme('boxShadow.focus'),
          },
          '&::placeholder': { color: theme('colors.ghost') },
          '&:disabled': { opacity: '0.5', cursor: 'not-allowed' },
        },
        // SBERT score badges — monospaced, semantic color
        '.score-badge-high': {
          background: 'oklch(0.55 0.16 165 / 0.10)',
          color: '#0D9488',
          border: '1px solid oklch(0.55 0.16 165 / 0.25)',
          borderRadius: theme('borderRadius.md'),
          padding: '2px 8px',
          fontFamily: '"JetBrains Mono", monospace',
          fontVariantNumeric: 'tabular-nums',
          fontSize: '0.8125rem',
          fontWeight: '600',
        },
        '.score-badge-good': {
          background: 'oklch(0.55 0.20 142 / 0.10)',
          color: '#16A34A',
          border: '1px solid oklch(0.55 0.20 142 / 0.25)',
          borderRadius: theme('borderRadius.md'),
          padding: '2px 8px',
          fontFamily: '"JetBrains Mono", monospace',
          fontVariantNumeric: 'tabular-nums',
          fontSize: '0.8125rem',
          fontWeight: '600',
        },
        '.score-badge-mid': {
          background: 'oklch(0.75 0.18 85 / 0.12)',
          color: '#B45309',
          border: '1px solid oklch(0.75 0.18 85 / 0.30)',
          borderRadius: theme('borderRadius.md'),
          padding: '2px 8px',
          fontFamily: '"JetBrains Mono", monospace',
          fontVariantNumeric: 'tabular-nums',
          fontSize: '0.8125rem',
          fontWeight: '600',
        },
        '.score-badge-low': {
          background: 'oklch(0.55 0.22 27 / 0.10)',
          color: '#DC2626',
          border: '1px solid oklch(0.55 0.22 27 / 0.25)',
          borderRadius: theme('borderRadius.md'),
          padding: '2px 8px',
          fontFamily: '"JetBrains Mono", monospace',
          fontVariantNumeric: 'tabular-nums',
          fontSize: '0.8125rem',
          fontWeight: '600',
        },
        // Sidebar nav item
        '.nav-item': {
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.625rem 1rem',
          borderRadius: theme('borderRadius.xl'),
          fontSize: theme('fontSize.sm')[0],
          fontWeight: '500',
          color: theme('colors.sub'),
          transition: 'background 150ms, color 150ms',
          cursor: 'pointer',
          '&:hover': {
            background: theme('colors.surfaceOff'),
            color: theme('colors.ink'),
          },
          '&.active': {
            background: 'oklch(0.55 0.22 270 / 0.10)',
            color: theme('colors.brand.600'),
          },
        },
      });

      // ── Utilities ─────────────────────────────────────────────────────
      addUtilities({
        // Tabular numbers for all numeric/score displays
        '.tabular': {
          fontVariantNumeric: 'tabular-nums',
          fontFeatureSettings: '"tnum" 1',
        },
        // Text gradients
        '.text-gradient-brand': {
          background: 'linear-gradient(135deg, #4F4DE8 0%, #3130A8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        },
        '.text-gradient-xp': {
          background: 'linear-gradient(90deg, #7C3AED 0%, #5B21B6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        },
        '.text-gradient-score': {
          background: 'linear-gradient(90deg, #EF4444 0%, #F97316 22%, #EAB308 44%, #22C55E 66%, #0D9488 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        },
        // Shimmer skeleton
        '.skeleton': {
          background: 'linear-gradient(90deg, #F2F1EE 25%, #E5E4E0 50%, #F2F1EE 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.6s linear infinite',
          borderRadius: theme('borderRadius.md'),
        },
        // Layout helpers
        '.w-sidebar':  { width: '240px' },
        '.ml-sidebar': { marginLeft: '240px' },
        // Performance
        '.content-auto': { contentVisibility: 'auto' },
        // Hide scrollbar visually but keep functionality
        '.scrollbar-none': {
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      });
    }),
  ],
};
