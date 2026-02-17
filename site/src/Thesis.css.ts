import { style, globalStyle } from '@vanilla-extract/css'
import { vars } from './styles/theme.css'
import { fadeUp } from './styles/shared.css'
import { breakpoints } from './styles/tokens'

// ── Article container ──

export const thesis = style({
  maxWidth: '680px',
  margin: '0 auto',
  padding: `0 ${vars.space.md}`,
})

// ── Header block ──

export const thesisHeader = style({
  textAlign: 'center',
  padding: `${vars.space.xl} 0`,
  borderBottom: `1px solid ${vars.color.border}`,
  marginBottom: vars.space.xl,
  animation: `${fadeUp} 0.6s ease-out`,
  '@media': {
    [`(max-width: ${breakpoints.mobile})`]: {
      padding: `${vars.space.lg} 0`,
    },
  },
})

export const thesisLabel = style({
  fontFamily: vars.font.mono,
  fontSize: vars.text.xs,
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  color: vars.color.accent,
  marginBottom: vars.space.sm,
})

globalStyle(`${thesisHeader} h1`, {
  fontFamily: vars.font.display,
  fontSize: vars.text['3xl'],
  fontWeight: vars.weight.light,
  lineHeight: 1.2,
  marginBottom: vars.space.md,
  letterSpacing: '-0.02em',
})

export const thesisSubtitle = style({
  fontSize: vars.text.lg,
  color: vars.color.textMuted,
  maxWidth: '480px',
  margin: '0 auto',
  lineHeight: 1.6,
})

// Paper author/date line
export const paperMeta = style({
  fontSize: '0.85rem',
  color: vars.color.textMuted,
  marginTop: '1rem',
})

// ── Content sections ──

export const thesisContent = style({})

globalStyle(`${thesisContent} section`, {
  marginBottom: vars.space.xl,
  animation: `${fadeUp} 0.6s ease-out backwards`,
})

// nth-child animation delays
for (let i = 1; i <= 10; i++) {
  globalStyle(`${thesisContent} section:nth-child(${i})`, {
    animationDelay: `${0.05 + i * 0.05}s`,
  })
}

// Headings
globalStyle(`${thesisContent} h2`, {
  fontFamily: vars.font.display,
  fontSize: vars.text.xl,
  fontWeight: vars.weight.normal,
  marginBottom: vars.space.md,
  color: vars.color.text,
  position: 'relative',
  paddingLeft: '1.5rem',
})

globalStyle(`${thesisContent} h2::before`, {
  content: "''",
  position: 'absolute',
  left: '0',
  top: '0.5em',
  width: '8px',
  height: '2px',
  background: vars.color.accent,
})

globalStyle(`${thesisContent} h3`, {
  fontFamily: vars.font.display,
  fontSize: vars.text.lg,
  fontWeight: vars.weight.medium,
  marginTop: vars.space.lg,
  marginBottom: vars.space.sm,
  color: vars.color.text,
})

globalStyle(`${thesisContent} h4`, {
  fontFamily: vars.font.display,
  fontSize: vars.text.base,
  fontWeight: vars.weight.medium,
  marginTop: vars.space.md,
  marginBottom: vars.space.sm,
  color: vars.color.textMuted,
})

// Body text
globalStyle(`${thesisContent} p`, {
  marginBottom: vars.space.sm,
})

globalStyle(`${thesisContent} em`, {
  fontStyle: 'italic',
})

// Lists
globalStyle(`${thesisContent} ul, ${thesisContent} ol`, {
  margin: `${vars.space.md} 0`,
  paddingLeft: '1.5rem',
})

globalStyle(`${thesisContent} li`, {
  marginBottom: vars.space.xs,
  paddingLeft: vars.space.xs,
})

globalStyle(`${thesisContent} li strong`, {
  color: vars.color.text,
})

// Blockquote
globalStyle(`${thesisContent} blockquote`, {
  borderLeft: `3px solid ${vars.color.accent}`,
  padding: `${vars.space.md} ${vars.space.lg}`,
  margin: `${vars.space.lg} 0`,
  background: `linear-gradient(135deg, ${vars.color.accentSubtle} 0%, transparent 100%)`,
  borderRadius: `0 ${vars.radius.sm} ${vars.radius.sm} 0`,
})

globalStyle(`${thesisContent} blockquote p`, {
  marginBottom: vars.space.xs,
})

globalStyle(`${thesisContent} blockquote p:last-child`, {
  marginBottom: '0',
})

// Responsive blockquote
globalStyle(`${thesisContent} blockquote`, {
  '@media': {
    [`(max-width: ${breakpoints.mobile})`]: {
      padding: `${vars.space.sm} ${vars.space.md}`,
    },
  },
})

// Code
globalStyle(`${thesisContent} code`, {
  fontFamily: vars.font.mono,
  fontSize: '0.85em',
  background: vars.color.bgSurface,
  padding: '0.15em 0.4em',
  borderRadius: vars.radius.sm,
})

// ── Callout box ──

export const thesisCallout = style({
  background: vars.color.bgSurface,
  borderLeft: `3px solid ${vars.color.accent}`,
  padding: vars.space.md,
  margin: `${vars.space.lg} 0`,
  borderRadius: `0 ${vars.radius.sm} ${vars.radius.sm} 0`,
})

globalStyle(`${thesisCallout} a`, {
  color: vars.color.accent,
  textDecoration: 'none',
})

globalStyle(`${thesisCallout} a:hover`, {
  textDecoration: 'underline',
})

// ── CTA ──

export const thesisCta = style({
  textAlign: 'center',
  marginTop: vars.space.lg,
})

export const thesisCtaBtn = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.xs,
  padding: `${vars.space.sm} ${vars.space.md}`,
  fontFamily: vars.font.display,
  fontSize: '0.9rem',
  textDecoration: 'none',
  background: vars.color.text,
  color: vars.color.bg,
  border: `1px solid ${vars.color.text}`,
  borderRadius: vars.radius.md,
  transition: `all ${vars.ease.default}`,
  selectors: {
    '&:hover': {
      background: vars.color.accent,
      borderColor: vars.color.accent,
      textDecoration: 'none',
    },
  },
})

// ── Citations ──

export const citation = style({
  fontSize: '0.75em',
  verticalAlign: 'super',
  lineHeight: 0,
})

globalStyle(`${citation} a`, {
  color: vars.color.accent,
  textDecoration: 'none',
  padding: '0 0.1em',
})

globalStyle(`${citation} a:hover`, {
  textDecoration: 'underline',
})

// ── References ──

export const references = style({
  marginTop: vars.space.xl,
  paddingTop: vars.space.xl,
  borderTop: `1px solid ${vars.color.border}`,
})

globalStyle(`${references} h2`, {
  fontFamily: vars.font.display,
  fontSize: '1.25rem',
  fontWeight: vars.weight.normal,
  marginBottom: vars.space.md,
  color: vars.color.text,
})

export const referenceList = style({
  listStyle: 'none',
  padding: '0',
  margin: '0',
  fontSize: '0.85rem',
  color: vars.color.textMuted,
  lineHeight: 1.6,
})

globalStyle(`${referenceList} li`, {
  marginBottom: vars.space.sm,
  paddingLeft: '2rem',
  position: 'relative',
})

globalStyle(`${referenceList} li > a:first-child`, {
  position: 'absolute',
  left: '0',
  color: vars.color.textMuted,
  textDecoration: 'none',
  fontSize: '0.8em',
})

globalStyle(`${referenceList} li > a:first-child:hover`, {
  color: vars.color.accent,
})

globalStyle(`${referenceList} em`, {
  fontStyle: 'italic',
})

globalStyle(`${referenceList} a`, {
  color: vars.color.accent,
  textDecoration: 'none',
})

globalStyle(`${referenceList} a:hover`, {
  textDecoration: 'underline',
})

// ── Tables ──

export const paperTable = style({
  width: '100%',
  borderCollapse: 'collapse',
  margin: `${vars.space.md} 0`,
  fontSize: '0.9rem',
})

globalStyle(`${paperTable} th, ${paperTable} td`, {
  padding: `${vars.space.sm} ${vars.space.md}`,
  textAlign: 'left',
  borderBottom: `1px solid ${vars.color.border}`,
})

globalStyle(`${paperTable} th`, {
  fontWeight: vars.weight.medium,
  color: vars.color.text,
  background: vars.color.bgSurface,
})

globalStyle(`${paperTable} td`, {
  color: vars.color.textMuted,
})

globalStyle(`${paperTable} tr:last-child td`, {
  borderBottom: 'none',
})

// ── Abstract ──

export const abstract = style({
  background: `linear-gradient(135deg, ${vars.color.accentSubtle} 0%, transparent 100%)`,
  padding: vars.space.lg,
  borderLeft: `3px solid ${vars.color.accent}`,
  marginBottom: vars.space.xl,
  borderRadius: `0 ${vars.radius.sm} ${vars.radius.sm} 0`,
})

globalStyle(`${abstract} p`, {
  fontSize: '0.95rem',
})

// ── Code availability section ──

export const codeAvailability = style({
  marginTop: vars.space.xl,
  paddingTop: vars.space.lg,
  borderTop: `1px solid ${vars.color.border}`,
})

// ── Footer ──

export const thesisFooter = style({
  textAlign: 'center',
  padding: `${vars.space.xl} 0`,
  marginTop: vars.space.lg,
  borderTop: `1px solid ${vars.color.border}`,
  color: vars.color.textMuted,
  fontSize: '0.85rem',
})
