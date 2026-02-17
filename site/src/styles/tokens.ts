// Raw design-token values (pure TS, not .css.ts)

export const colors = {
  accent: '#e8a825',
  accentHover: '#d99a1f',
  accentGlow: 'rgba(232, 168, 37, 0.15)',
  accentSubtle: 'rgba(232, 168, 37, 0.08)',

  // Light theme
  light: {
    bg: '#faf8f5',
    bgElevated: '#fff',
    bgSurface: '#f0ede8',
    text: '#1a1a18',
    textMuted: '#5c5c58',
    textDim: '#8a8880',
    border: '#e8e4df',
    borderStrong: '#d0ccc5',
    headerBg: 'rgba(250, 248, 245, 0.85)',
  },

  // Dark theme
  dark: {
    bg: '#0c0e13',
    bgElevated: '#141720',
    bgSurface: '#1a1e2a',
    text: '#e8e6e1',
    textMuted: '#8a8880',
    textDim: '#5a5850',
    border: 'rgba(255, 255, 255, 0.08)',
    borderStrong: 'rgba(255, 255, 255, 0.15)',
    headerBg: 'rgba(12, 14, 19, 0.8)',
  },
} as const

export const fonts = {
  display: "'Newsreader', Georgia, serif",
  body: "'Outfit', -apple-system, sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', monospace",
} as const

export const textSizes = {
  xs: '0.65rem',
  sm: '0.82rem',
  base: '1rem',
  lg: '1.15rem',
  xl: '1.5rem',
  '2xl': '1.8rem',
  '3xl': 'clamp(2rem, 5vw, 3rem)',
  '4xl': 'clamp(2.4rem, 5.5vw, 3.8rem)',
} as const

export const weights = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
} as const

export const space = {
  xs: '0.5rem',
  sm: '1rem',
  md: '2rem',
  lg: '4rem',
  xl: '6rem',
  '2xl': '10rem',
} as const

export const layout = {
  maxWidth: '720px',
  maxWidthWide: '1080px',
} as const

export const radii = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  pill: '20px',
} as const

export const transitions = {
  default: '0.2s ease',
  spring: '0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const

export const breakpoints = {
  tablet: '768px',
  mobile: '600px',
  small: '480px',
} as const
