import {
  createThemeContract,
  createTheme,
} from '@vanilla-extract/css'
import { colors, fonts, textSizes, weights, space, layout, radii, transitions } from './tokens'

export const vars = createThemeContract({
  color: {
    accent: null,
    accentHover: null,
    accentGlow: null,
    accentSubtle: null,
    bg: null,
    bgElevated: null,
    bgSurface: null,
    text: null,
    textMuted: null,
    textDim: null,
    border: null,
    borderStrong: null,
    headerBg: null,
  },
  font: {
    display: null,
    body: null,
    mono: null,
  },
  text: {
    xs: null,
    sm: null,
    base: null,
    lg: null,
    xl: null,
    '2xl': null,
    '3xl': null,
    '4xl': null,
  },
  weight: {
    light: null,
    normal: null,
    medium: null,
    semibold: null,
  },
  space: {
    xs: null,
    sm: null,
    md: null,
    lg: null,
    xl: null,
    '2xl': null,
  },
  layout: {
    maxWidth: null,
    maxWidthWide: null,
  },
  radius: {
    sm: null,
    md: null,
    lg: null,
    pill: null,
  },
  ease: {
    default: null,
    spring: null,
  },
})

const commonTokens = {
  color: {
    accent: colors.accent,
    accentHover: colors.accentHover,
    accentGlow: colors.accentGlow,
    accentSubtle: colors.accentSubtle,
  },
  font: fonts,
  text: textSizes,
  weight: weights,
  space,
  layout,
  radius: radii,
  ease: transitions,
} as const

export const lightTheme = createTheme(vars, {
  ...commonTokens,
  color: {
    ...commonTokens.color,
    bg: colors.light.bg,
    bgElevated: colors.light.bgElevated,
    bgSurface: colors.light.bgSurface,
    text: colors.light.text,
    textMuted: colors.light.textMuted,
    textDim: colors.light.textDim,
    border: colors.light.border,
    borderStrong: colors.light.borderStrong,
    headerBg: colors.light.headerBg,
  },
})

export const darkTheme = createTheme(vars, {
  ...commonTokens,
  color: {
    ...commonTokens.color,
    bg: colors.dark.bg,
    bgElevated: colors.dark.bgElevated,
    bgSurface: colors.dark.bgSurface,
    text: colors.dark.text,
    textMuted: colors.dark.textMuted,
    textDim: colors.dark.textDim,
    border: colors.dark.border,
    borderStrong: colors.dark.borderStrong,
    headerBg: colors.dark.headerBg,
  },
})
