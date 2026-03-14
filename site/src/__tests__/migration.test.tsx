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
import PaperPage from "../app/paper/page";

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

  describe("Paper page", () => {
    it("renders without crashing", () => {
      render(<PaperPage />);
    });

    it("renders paper title", () => {
      render(<PaperPage />);
      expect(screen.getByText("Pre-emptive rigor")).toBeInTheDocument();
    });

    it("renders abstract", () => {
      render(<PaperPage />);
      expect(screen.getByText("Abstract")).toBeInTheDocument();
    });

    it("renders author metadata", () => {
      render(<PaperPage />);
      expect(screen.getByText(/Draft v0.4/)).toBeInTheDocument();
    });

    it("renders all major sections", () => {
      render(<PaperPage />);
      expect(screen.getByText("1. Introduction")).toBeInTheDocument();
      expect(screen.getByText("2. Related work")).toBeInTheDocument();
      expect(
        screen.getByText("3. Methodology: stability-under-probing"),
      ).toBeInTheDocument();
      expect(screen.getByText("4. Experimental design")).toBeInTheDocument();
      expect(screen.getByText("5. Results")).toBeInTheDocument();
      expect(screen.getByText("6. Discussion")).toBeInTheDocument();
      expect(screen.getByText("7. Conclusion")).toBeInTheDocument();
    });

    it("renders tables", () => {
      render(<PaperPage />);
      expect(screen.getByText("Update magnitude")).toBeInTheDocument();
    });

    it("renders code availability section", () => {
      render(<PaperPage />);
      expect(screen.getByText("Code availability")).toBeInTheDocument();
    });
  });

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

    it("Paper page renders without dark theme", () => {
      const { container } = render(<PaperPage />);
      const wrapper = container.firstElementChild as HTMLElement;
      expect(wrapper.className).not.toContain("theme-dark");
    });
  });
});
