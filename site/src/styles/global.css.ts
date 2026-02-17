import { globalStyle } from '@vanilla-extract/css'
import { vars } from './theme.css'

// Reset
globalStyle('*', {
  margin: 0,
  padding: 0,
  boxSizing: 'border-box',
})

globalStyle('html', {
  fontSize: '17px',
  scrollBehavior: 'smooth',
})

globalStyle('body', {
  fontFamily: vars.font.body,
  background: vars.color.bg,
  color: vars.color.text,
  lineHeight: 1.7,
  minHeight: '100vh',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
})

globalStyle('a', {
  color: vars.color.accent,
  textDecoration: 'none',
})

globalStyle('a:hover', {
  textDecoration: 'underline',
})
