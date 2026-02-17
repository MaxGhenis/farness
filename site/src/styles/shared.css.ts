import { style, keyframes } from '@vanilla-extract/css'
import { vars } from './theme.css'
import { breakpoints } from './tokens'

// ── Animations ──

export const fadeUp = keyframes({
  from: { opacity: 0, transform: 'translateY(16px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
})

// ── Shared header ──

export const header = style({
  position: 'sticky',
  top: 0,
  zIndex: 100,
  width: '100%',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  background: vars.color.headerBg,
  borderBottom: `1px solid ${vars.color.border}`,
})

export const headerInner = style({
  width: '100%',
  maxWidth: vars.layout.maxWidthWide,
  margin: '0 auto',
  padding: `0.75rem ${vars.space.md}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  '@media': {
    [`(max-width: ${breakpoints.tablet})`]: {
      padding: `${vars.space.xs} ${vars.space.sm}`,
    },
  },
})

export const logo = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  textDecoration: 'none',
  fontFamily: vars.font.display,
  fontSize: '1.2rem',
  fontWeight: vars.weight.medium,
  color: vars.color.text,
  selectors: {
    '&:hover': { textDecoration: 'none' },
  },
})

export const logoMark = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.75rem',
  height: '1.75rem',
  background: vars.color.accent,
  color: '#0c0e13',
  fontFamily: vars.font.display,
  fontWeight: vars.weight.semibold,
  fontSize: vars.text.base,
  borderRadius: '5px',
})

export const logoText = style({
  letterSpacing: '0.02em',
})

export const nav = style({
  display: 'flex',
  gap: '1.75rem',
  alignItems: 'center',
  '@media': {
    [`(max-width: ${breakpoints.tablet})`]: {
      gap: vars.space.sm,
    },
  },
})

export const navLink = style({
  fontFamily: vars.font.body,
  fontSize: vars.text.sm,
  fontWeight: vars.weight.normal,
  color: vars.color.textMuted,
  textDecoration: 'none',
  transition: `color ${vars.ease.default}`,
  selectors: {
    '&:hover': {
      color: vars.color.text,
      textDecoration: 'none',
    },
  },
})

export const navLinkActive = style({
  color: vars.color.accent,
})

export const navLinkGh = style({
  padding: '0.3em 0.85em',
  border: `1px solid ${vars.color.borderStrong}`,
  borderRadius: vars.radius.md,
  fontSize: vars.text.sm,
  marginLeft: '0.25rem',
  selectors: {
    '&:hover': {
      borderColor: vars.color.accent,
      color: vars.color.accent,
    },
  },
})

// ── Shared buttons ──

export const btn = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5em',
  padding: '0.7em 1.5em',
  fontFamily: vars.font.body,
  fontSize: '0.9rem',
  fontWeight: vars.weight.medium,
  textDecoration: 'none',
  borderRadius: vars.radius.md,
  border: '1px solid transparent',
  cursor: 'pointer',
  transition: `all ${vars.ease.default}`,
  selectors: {
    '&:hover': { textDecoration: 'none' },
  },
})

export const btnAccent = style({
  background: vars.color.accent,
  color: vars.color.bg,
  borderColor: vars.color.accent,
  selectors: {
    '&:hover': {
      background: vars.color.accentHover,
      borderColor: vars.color.accentHover,
      boxShadow: `0 4px 20px ${vars.color.accentGlow}`,
    },
  },
})

export const btnGhost = style({
  background: 'transparent',
  color: vars.color.textMuted,
  borderColor: vars.color.borderStrong,
  selectors: {
    '&:hover': {
      borderColor: vars.color.accent,
      color: vars.color.accent,
    },
  },
})

// ── Shared utilities ──

export const mono = style({
  fontFamily: vars.font.mono,
  fontSize: '0.85em',
})
