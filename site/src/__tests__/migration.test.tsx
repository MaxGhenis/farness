import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock next/link to render as a simple <a> tag
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Import components after mocks are set up
import HomePage from "../app/page";
import ThesisPage from "../app/thesis/page";


describe("Next.js migration", () => {
  describe("Homepage", () => {
    it("renders without crashing", () => {
      render(<HomePage />);
    });

    it("renders header with logo", () => {
      render(<HomePage />);
      expect(screen.getByText("arness")).toBeInTheDocument();
    });

    it("renders hero content", () => {
      render(<HomePage />);
      expect(screen.getByText("Decision framework")).toBeInTheDocument();
    });

    it("renders all section labels", () => {
      render(<HomePage />);
      expect(screen.getAllByText("01").length).toBeGreaterThan(0);
      expect(screen.getAllByText("02").length).toBeGreaterThan(0);
      expect(screen.getAllByText("03").length).toBeGreaterThan(0);
      expect(screen.getAllByText("04").length).toBeGreaterThan(0);
      expect(screen.getAllByText("05").length).toBeGreaterThan(0);
    });

    it("renders interactive demo", () => {
      render(<HomePage />);
      expect(screen.getAllByText("Interactive demo").length).toBeGreaterThan(0);
      expect(
        screen.getAllByText("Which job should I take?").length,
      ).toBeGreaterThan(0);
    });

    it("renders CTA", () => {
      render(<HomePage />);
      expect(
        screen.getByText("Start making better decisions"),
      ).toBeInTheDocument();
    });

    it("renders footer", () => {
      render(<HomePage />);
      expect(screen.getByText(/Built by/)).toBeInTheDocument();
    });
  });

  describe("Thesis page", () => {
    it("renders without crashing", () => {
      render(<ThesisPage />);
    });

    it("renders header with active thesis link", () => {
      render(<ThesisPage />);
      const thesisLinks = screen.getAllByText("Thesis");
      expect(thesisLinks.length).toBeGreaterThan(0);
    });

    it("renders thesis title", () => {
      render(<ThesisPage />);
      expect(screen.getByText("Forecasting as a harness")).toBeInTheDocument();
    });

    it("renders all section headings", () => {
      render(<ThesisPage />);
      expect(screen.getByText("The problem with advice")).toBeInTheDocument();
      expect(screen.getByText("The reframe")).toBeInTheDocument();
      expect(
        screen.getByText("The superforecasting connection"),
      ).toBeInTheDocument();
      expect(screen.getByText("Why AI makes this better")).toBeInTheDocument();
      expect(screen.getByText("The calibration loop")).toBeInTheDocument();
      expect(
        screen.getByText("The decision quality chain"),
      ).toBeInTheDocument();
      expect(screen.getByText("The framework")).toBeInTheDocument();
      expect(screen.getByText("When to use it")).toBeInTheDocument();
      expect(screen.getByText("The vision")).toBeInTheDocument();
    });

    it("renders references section", () => {
      render(<ThesisPage />);
      expect(screen.getAllByText("References").length).toBeGreaterThan(0);
    });
  });

  // Paper page is now rendered by Quarto (not a React component)

  describe("shared Header component", () => {
    it("renders nav links on all pages", () => {
      render(<HomePage />);
      expect(screen.getByText("GitHub")).toBeInTheDocument();
    });

    it("uses Tailwind classes (no old CSS module class names)", () => {
      const { container } = render(<HomePage />);
      const html = container.innerHTML;

      // These old CSS class names should NOT appear
      const oldClasses = [
        'class="app-dark"',
        'class="header"',
        'class="header-inner"',
        'class="nav-link"',
        'class="btn "',
        'class="btn-accent"',
        'class="btn-ghost"',
      ];

      for (const cls of oldClasses) {
        expect(html).not.toContain(cls);
      }
    });
  });

  describe("theme classes", () => {
    it("Homepage wrapper has dark theme class", () => {
      const { container } = render(<HomePage />);
      const wrapper = container.firstElementChild as HTMLElement;
      expect(wrapper.className).toContain("theme-dark");
    });

    it("Thesis page renders without dark theme", () => {
      const { container } = render(<ThesisPage />);
      const wrapper = container.firstElementChild as HTMLElement;
      expect(wrapper.className).not.toContain("theme-dark");
    });

    // Paper page is now Quarto-rendered, not a React component
  });
});
