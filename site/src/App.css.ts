import { style, globalStyle } from '@vanilla-extract/css'
import { vars } from './styles/theme.css'
import { fadeUp } from './styles/shared.css'
import { breakpoints } from './styles/tokens'

// ── Dark wrapper ──

export const appDark = style({
  background: vars.color.bg,
  color: vars.color.text,
  minHeight: '100vh',
})

// ── Hero ──

export const hero = style({
  position: 'relative',
  overflow: 'hidden',
  padding: `${vars.space['2xl']} ${vars.space.md} ${vars.space.xl}`,
  display: 'flex',
  justifyContent: 'center',
  '@media': {
    [`(max-width: ${breakpoints.tablet})`]: {
      padding: `${vars.space.xl} ${vars.space.sm} ${vars.space.lg}`,
    },
  },
})

export const heroGrid = style({
  position: 'absolute',
  inset: '0',
  backgroundImage:
    'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
  backgroundSize: '60px 60px',
  maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)',
  WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)',
})

export const heroContent = style({
  position: 'relative',
  textAlign: 'center',
  maxWidth: '780px',
  animation: `${fadeUp} 0.8s ease-out`,
})

export const heroLabel = style({
  fontFamily: vars.font.mono,
  fontSize: '0.72rem',
  letterSpacing: '0.08em',
  color: vars.color.accent,
  marginBottom: vars.space.sm,
})

globalStyle(`${heroContent} h1`, {
  fontFamily: vars.font.display,
  fontSize: 'clamp(2.4rem, 5.5vw, 3.8rem)',
  fontWeight: 400,
  lineHeight: 1.18,
  letterSpacing: '-0.02em',
  marginBottom: vars.space.md,
})

globalStyle(`${heroContent} h1 em`, {
  fontStyle: 'italic',
  color: vars.color.accent,
})

export const subtitle = style({
  fontSize: '1.15rem',
  fontWeight: 300,
  color: vars.color.textMuted,
  maxWidth: '560px',
  margin: `0 auto ${vars.space.lg}`,
  lineHeight: 1.65,
  animation: `${fadeUp} 0.8s ease-out 0.12s both`,
})

export const heroActions = style({
  display: 'flex',
  gap: vars.space.sm,
  justifyContent: 'center',
  flexWrap: 'wrap',
  animation: `${fadeUp} 0.8s ease-out 0.24s both`,
  '@media': {
    [`(max-width: ${breakpoints.small})`]: {
      flexDirection: 'column',
      alignItems: 'center',
    },
  },
})

// ── Sections ──

export const appMain = style({
  maxWidth: vars.layout.maxWidth,
  margin: '0 auto',
  padding: `${vars.space.lg} ${vars.space.md}`,
})

export const section = style({
  marginBottom: vars.space.xl,
})

export const sectionHead = style({
  marginBottom: vars.space.md,
})

export const sectionLabel = style({
  fontFamily: vars.font.mono,
  fontSize: '0.7rem',
  letterSpacing: '0.06em',
  color: vars.color.accent,
  display: 'block',
  marginBottom: vars.space.xs,
})

export const sectionBody = style({})

globalStyle(`${section} h2`, {
  fontFamily: vars.font.display,
  fontSize: '1.8rem',
  fontWeight: 400,
  lineHeight: 1.25,
  letterSpacing: '-0.01em',
})

globalStyle(`${sectionBody} p`, {
  color: vars.color.textMuted,
  marginBottom: vars.space.sm,
  fontWeight: 300,
})

globalStyle(`${sectionBody} strong`, {
  color: vars.color.text,
  fontWeight: 500,
})

globalStyle(`${sectionBody} em`, {
  color: vars.color.text,
})

// ── Reframe Demo ──

export const reframe = style({
  margin: `${vars.space.lg} 0`,
})

export const reframePair = style({
  display: 'flex',
  alignItems: 'stretch',
  gap: vars.space.sm,
  '@media': {
    [`(max-width: ${breakpoints.tablet})`]: {
      flexDirection: 'column',
    },
  },
})

export const reframeBox = style({
  flex: 1,
  padding: vars.space.md,
  borderRadius: '10px',
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.xs,
})

export const reframeBefore = style({
  background: vars.color.bgElevated,
  border: `1px solid ${vars.color.border}`,
})

export const reframeAfter = style({
  background: vars.color.bgSurface,
  border: '1px solid rgba(232, 168, 37, 0.3)',
})

export const reframeTag = style({
  fontFamily: vars.font.mono,
  fontSize: '0.65rem',
  letterSpacing: '0.06em',
})

export const reframeTagBefore = style({
  color: vars.color.textDim,
})

export const reframeTagAfter = style({
  color: vars.color.accent,
})

globalStyle(`${reframeBox} p`, {
  fontFamily: vars.font.display,
  fontSize: '1.05rem',
  fontStyle: 'italic',
  lineHeight: 1.5,
  color: vars.color.textMuted,
  margin: '0',
})

globalStyle(`${reframeAfter} p`, {
  color: vars.color.text,
})

export const reframeArrow = style({
  display: 'flex',
  alignItems: 'center',
  color: vars.color.accent,
  flexShrink: 0,
  opacity: 0.5,
  '@media': {
    [`(max-width: ${breakpoints.tablet})`]: {
      justifyContent: 'center',
      transform: 'rotate(90deg)',
    },
  },
})

export const reframeDots = style({
  display: 'flex',
  justifyContent: 'center',
  gap: '0.5rem',
  marginTop: vars.space.sm,
})

export const reframeDot = style({
  width: '7px',
  height: '7px',
  borderRadius: '50%',
  border: `1px solid ${vars.color.borderStrong}`,
  background: 'transparent',
  cursor: 'pointer',
  padding: 0,
  transition: 'all 0.2s',
  selectors: {
    '&:hover': { borderColor: vars.color.accent },
  },
})

export const reframeDotActive = style({
  background: vars.color.accent,
  borderColor: vars.color.accent,
})

// ── Interactive Demo ──

export const demo = style({
  maxWidth: vars.layout.maxWidthWide,
  margin: '0 auto',
  padding: `${vars.space.xl} ${vars.space.md}`,
})

export const demoHeader = style({
  textAlign: 'center',
  marginBottom: vars.space.lg,
})

export const demoLabel = style({
  fontFamily: vars.font.mono,
  fontSize: '0.7rem',
  letterSpacing: '0.06em',
  color: vars.color.accent,
  display: 'block',
  marginBottom: vars.space.xs,
})

export const demoQuestion = style({
  fontFamily: vars.font.display,
  fontSize: '1.6rem',
  fontWeight: 400,
  fontStyle: 'italic',
  marginBottom: vars.space.md,
})

export const demoTabs = style({
  display: 'flex',
  gap: '0.5rem',
  justifyContent: 'center',
  flexWrap: 'wrap',
  '@media': {
    [`(max-width: ${breakpoints.small})`]: {
      flexDirection: 'column',
      alignItems: 'stretch',
    },
  },
})

export const demoTab = style({
  fontFamily: vars.font.body,
  fontSize: '0.78rem',
  fontWeight: 400,
  padding: '0.4em 1em',
  background: 'transparent',
  color: vars.color.textDim,
  border: `1px solid ${vars.color.border}`,
  borderRadius: '20px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  selectors: {
    '&:hover': {
      borderColor: vars.color.textMuted,
      color: vars.color.textMuted,
    },
  },
})

export const demoTabActive = style({
  borderColor: vars.color.accent,
  color: vars.color.accent,
  background: vars.color.accentSubtle,
})

// KPI grid

export const demoGrid = style({
  display: 'grid',
  gap: vars.space.md,
})

export const demoKpi = style({
  background: vars.color.bgElevated,
  border: `1px solid ${vars.color.border}`,
  borderRadius: '12px',
  padding: vars.space.md,
})

export const demoKpiHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  marginBottom: vars.space.sm,
})

export const demoKpiName = style({
  fontWeight: 500,
  fontSize: '0.95rem',
})

export const demoKpiUnit = style({
  fontFamily: vars.font.mono,
  fontSize: '0.75rem',
  color: vars.color.textDim,
})

export const demoKpiBars = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
})

export const demoOptionRow = style({
  display: 'grid',
  gridTemplateColumns: '80px 1fr 50px',
  alignItems: 'center',
  gap: vars.space.sm,
  '@media': {
    [`(max-width: ${breakpoints.tablet})`]: {
      gridTemplateColumns: '65px 1fr 40px',
    },
    [`(max-width: ${breakpoints.small})`]: {
      gridTemplateColumns: '55px 1fr 35px',
      gap: '0.5rem',
    },
  },
})

export const demoOptionLabel = style({
  fontFamily: vars.font.body,
  fontSize: '0.82rem',
  fontWeight: 500,
  textAlign: 'right',
})

export const demoBarWrap = style({
  position: 'relative',
  height: '28px',
})

export const demoValue = style({
  fontSize: '0.8rem',
  color: vars.color.textMuted,
  textAlign: 'right',
})

// ── Confidence Interval Bar ──

export const ciBarContainer = style({
  position: 'relative',
  width: '100%',
  height: '28px',
  background: vars.color.bgSurface,
  borderRadius: '4px',
  overflow: 'hidden',
})

export const ciRange = style({
  position: 'absolute',
  top: 0,
  height: '100%',
  borderRadius: '3px',
  opacity: 0,
  transition: 'opacity 0.4s ease, transform 0.5s ease',
  transform: 'scaleX(0)',
  transformOrigin: 'left',
})

export const ciRangeAnimate = style({
  opacity: 1,
  transform: 'scaleX(1)',
})

export const ciPoint = style({
  position: 'absolute',
  top: '50%',
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  transform: 'translate(-50%, -50%) scale(0)',
  transition: `transform ${vars.ease.spring} 0.25s`,
})

export const ciPointAnimate = style({
  transform: 'translate(-50%, -50%) scale(1)',
})

// Scale ticks

export const demoScale = style({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '0.4rem',
  fontSize: '0.65rem',
  color: vars.color.textDim,
})

// Demo footer & legend

export const demoFooter = style({
  textAlign: 'center',
  marginTop: vars.space.md,
})

export const demoLegend = style({
  fontSize: '0.75rem',
  color: vars.color.textDim,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.75rem',
})

export const demoLegendDot = style({
  display: 'inline-block',
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  background: vars.color.accent,
  marginRight: '0.25rem',
})

export const demoLegendBar = style({
  display: 'inline-block',
  width: '24px',
  height: '10px',
  background: vars.color.accentSubtle,
  borderLeft: `1px solid ${vars.color.accent}`,
  borderRight: `1px solid ${vars.color.accent}`,
  borderRadius: '2px',
  marginRight: '0.25rem',
})

// ── Framework Steps ──

export const stepsGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: vars.space.sm,
  '@media': {
    [`(max-width: ${breakpoints.tablet})`]: {
      gridTemplateColumns: '1fr',
    },
  },
})

export const stepCard = style({
  background: vars.color.bgElevated,
  border: `1px solid ${vars.color.border}`,
  borderRadius: '12px',
  padding: vars.space.md,
  transition: 'border-color 0.2s',
  selectors: {
    '&:hover': { borderColor: vars.color.borderStrong },
  },
})

export const stepHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginBottom: vars.space.xs,
})

export const stepIcon = style({
  color: vars.color.accent,
  display: 'flex',
  alignItems: 'center',
  opacity: 0.7,
})

export const stepNum = style({
  fontSize: '0.75rem',
  color: vars.color.accent,
})

globalStyle(`${stepCard} h3`, {
  fontFamily: vars.font.display,
  fontSize: '1.05rem',
  fontWeight: 500,
  marginBottom: '0.5rem',
})

globalStyle(`${stepCard} p`, {
  fontSize: '0.88rem',
  color: vars.color.textMuted,
  margin: '0',
  lineHeight: 1.55,
})

// ── Why It Works ──

export const reasonsGrid = style({
  display: 'grid',
  gap: vars.space.sm,
})

export const reasonCard = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.3rem',
  padding: `${vars.space.sm} 0`,
  borderBottom: `1px solid ${vars.color.border}`,
  selectors: {
    '&:last-child': { borderBottom: 'none' },
  },
})

globalStyle(`${reasonCard} h3`, {
  fontFamily: vars.font.display,
  fontSize: '1rem',
  fontWeight: 500,
  color: vars.color.text,
})

globalStyle(`${reasonCard} p`, {
  fontSize: '0.9rem',
  color: vars.color.textMuted,
  margin: '0',
})

// ── CTA ──

export const cta = style({
  borderTop: `1px solid ${vars.color.border}`,
  padding: `${vars.space.xl} ${vars.space.md}`,
})

export const ctaInner = style({
  maxWidth: vars.layout.maxWidth,
  margin: '0 auto',
  textAlign: 'center',
})

globalStyle(`${ctaInner} h2`, {
  fontFamily: vars.font.display,
  fontSize: '1.8rem',
  fontWeight: 400,
  marginBottom: vars.space.sm,
})

globalStyle(`${ctaInner} > p`, {
  color: vars.color.textMuted,
  fontWeight: 300,
  maxWidth: '480px',
  margin: '0 auto',
})

export const ctaButtons = style({
  display: 'flex',
  gap: vars.space.sm,
  justifyContent: 'center',
  flexWrap: 'wrap',
  marginTop: vars.space.md,
})

export const ctaCli = style({
  marginTop: vars.space.md,
  display: 'inline-block',
  background: vars.color.bgElevated,
  border: `1px solid ${vars.color.border}`,
  borderRadius: '10px',
  padding: `${vars.space.sm} ${vars.space.md}`,
})

globalStyle(`${ctaCli} code`, {
  fontSize: '0.82rem',
  color: vars.color.textMuted,
  lineHeight: 1.8,
})

// ── Footer ──

export const footer = style({
  textAlign: 'center',
  padding: `${vars.space.lg} ${vars.space.md}`,
  color: vars.color.textDim,
  fontSize: '0.82rem',
  borderTop: `1px solid ${vars.color.border}`,
})

globalStyle(`${footer} a`, {
  color: vars.color.textMuted,
})

globalStyle(`${footer} a:hover`, {
  color: vars.color.accent,
})

// ── Inline Link ──

export const inlineLink = style({
  color: vars.color.accent,
  fontWeight: 500,
  textDecoration: 'none',
  selectors: {
    '&:hover': { textDecoration: 'underline' },
  },
})
