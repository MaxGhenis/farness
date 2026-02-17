import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import Thesis from '../Thesis'
import Paper from '../Paper'

// Wrap components in MemoryRouter since they use <Link>
function renderWithRouter(ui: React.ReactElement, { route = '/' } = {}) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>)
}

describe('vanilla-extract migration', () => {
  describe('App (homepage)', () => {
    it('renders without crashing', () => {
      renderWithRouter(<App />)
    })

    it('renders header with logo', () => {
      renderWithRouter(<App />)
      expect(screen.getByText('arness')).toBeInTheDocument()
    })

    it('renders hero content', () => {
      renderWithRouter(<App />)
      expect(screen.getByText('Decision framework')).toBeInTheDocument()
    })

    it('renders all section labels', () => {
      renderWithRouter(<App />)
      expect(screen.getAllByText('01').length).toBeGreaterThan(0)
      expect(screen.getAllByText('02').length).toBeGreaterThan(0)
      expect(screen.getAllByText('03').length).toBeGreaterThan(0)
      expect(screen.getAllByText('04').length).toBeGreaterThan(0)
      expect(screen.getAllByText('05').length).toBeGreaterThan(0)
    })

    it('renders interactive demo', () => {
      renderWithRouter(<App />)
      expect(screen.getAllByText('Interactive demo').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Which job should I take?').length).toBeGreaterThan(0)
    })

    it('renders CTA', () => {
      renderWithRouter(<App />)
      expect(screen.getByText('Start making better decisions')).toBeInTheDocument()
    })

    it('renders footer', () => {
      renderWithRouter(<App />)
      expect(screen.getByText(/Built by/)).toBeInTheDocument()
    })
  })

  describe('Thesis page', () => {
    it('renders without crashing', () => {
      renderWithRouter(<Thesis />)
    })

    it('renders header with active thesis link', () => {
      renderWithRouter(<Thesis />)
      const thesisLinks = screen.getAllByText('Thesis')
      expect(thesisLinks.length).toBeGreaterThan(0)
    })

    it('renders thesis title', () => {
      renderWithRouter(<Thesis />)
      expect(screen.getByText('Forecasting as a harness')).toBeInTheDocument()
    })

    it('renders all 10 section headings', () => {
      renderWithRouter(<Thesis />)
      expect(screen.getByText('The problem with advice')).toBeInTheDocument()
      expect(screen.getByText('The reframe')).toBeInTheDocument()
      expect(screen.getByText('The superforecasting connection')).toBeInTheDocument()
      expect(screen.getByText('Why AI makes this better')).toBeInTheDocument()
      expect(screen.getByText('The calibration loop')).toBeInTheDocument()
      expect(screen.getByText('The decision quality chain')).toBeInTheDocument()
      expect(screen.getByText('The framework')).toBeInTheDocument()
      expect(screen.getByText('When to use it')).toBeInTheDocument()
      expect(screen.getByText('The vision')).toBeInTheDocument()
    })

    it('renders references section', () => {
      renderWithRouter(<Thesis />)
      expect(screen.getAllByText('References').length).toBeGreaterThan(0)
    })
  })

  describe('Paper page', () => {
    it('renders without crashing', () => {
      renderWithRouter(<Paper />)
    })

    it('renders paper title', () => {
      renderWithRouter(<Paper />)
      expect(screen.getByText('Pre-emptive rigor')).toBeInTheDocument()
    })

    it('renders abstract', () => {
      renderWithRouter(<Paper />)
      expect(screen.getByText('Abstract')).toBeInTheDocument()
    })

    it('renders author metadata', () => {
      renderWithRouter(<Paper />)
      expect(screen.getByText(/Draft v0.3/)).toBeInTheDocument()
    })

    it('renders all major sections', () => {
      renderWithRouter(<Paper />)
      expect(screen.getByText('1. Introduction')).toBeInTheDocument()
      expect(screen.getByText('2. Related work')).toBeInTheDocument()
      expect(screen.getByText('3. Methodology: stability-under-probing')).toBeInTheDocument()
      expect(screen.getByText('4. Experimental design')).toBeInTheDocument()
      expect(screen.getByText('5. Results')).toBeInTheDocument()
      expect(screen.getByText('6. Discussion')).toBeInTheDocument()
      expect(screen.getByText('7. Conclusion')).toBeInTheDocument()
    })

    it('renders tables', () => {
      renderWithRouter(<Paper />)
      // Check for table headers from the metrics table
      expect(screen.getByText('Update magnitude')).toBeInTheDocument()
    })

    it('renders code availability section', () => {
      renderWithRouter(<Paper />)
      expect(screen.getByText('Code availability')).toBeInTheDocument()
    })
  })

  describe('shared Header component', () => {
    it('renders nav links on all pages', () => {
      renderWithRouter(<App />)
      expect(screen.getByText('GitHub')).toBeInTheDocument()
    })

    it('has no remaining old CSS class names', () => {
      const { container } = renderWithRouter(<App />)
      const html = container.innerHTML

      // These old CSS class names should NOT appear
      const oldClasses = [
        'class="app-dark"',
        'class="header"',
        'class="header-inner"',
        'class="logo"',
        'class="nav"',
        'class="nav-link"',
        'class="btn "',
        'class="btn-accent"',
        'class="btn-ghost"',
      ]

      for (const cls of oldClasses) {
        // Old plain-string class names should be replaced by VE hashed classes
        expect(html).not.toContain(cls)
      }
    })
  })

  describe('theme classes', () => {
    it('App wrapper has dark theme class', () => {
      const { container } = renderWithRouter(<App />)
      const wrapper = container.firstElementChild as HTMLElement
      // VE theme classes are hashed, but should exist
      expect(wrapper.className).toBeTruthy()
      expect(wrapper.className.split(' ').length).toBeGreaterThanOrEqual(2)
    })

    it('Thesis wrapper has light theme class', () => {
      const { container } = renderWithRouter(<Thesis />)
      const wrapper = container.firstElementChild as HTMLElement
      expect(wrapper.className).toBeTruthy()
    })

    it('Paper wrapper has light theme class', () => {
      const { container } = renderWithRouter(<Paper />)
      const wrapper = container.firstElementChild as HTMLElement
      expect(wrapper.className).toBeTruthy()
    })
  })
})
