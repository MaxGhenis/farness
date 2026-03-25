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
import DocsPage from "../app/docs/page";
import ThesisPage from "../app/thesis/page";


describe("Next.js migration", () => {
  describe("Homepage", () => {
    it("renders without crashing", () => {
      render(<HomePage />);
    });

    it("renders header with logo", () => {
      render(<HomePage />);
      const farnessElements = screen.getAllByText("farness");
      expect(farnessElements.length).toBeGreaterThan(0);
    });

    it("renders hero headline", () => {
      render(<HomePage />);
      const matches = screen.getAllByText(/AI is often fluent about decisions/);
      expect(matches.length).toBeGreaterThan(0);
    });

    it("renders hero subhead with farness mention", () => {
      render(<HomePage />);
      expect(
        screen.getByText(/native skill with a local MCP server/),
      ).toBeInTheDocument();
    });

    it("renders how it works section", () => {
      render(<HomePage />);
      expect(screen.getByText("From intuition to instrument")).toBeInTheDocument();
      expect(screen.getByText("Intercept")).toBeInTheDocument();
      expect(screen.getByText("Reframe")).toBeInTheDocument();
      expect(screen.getByText("Anchor")).toBeInTheDocument();
    });

    it("renders workflow demo section", () => {
      render(<HomePage />);
      expect(screen.getByText("Watch the packaged path end to end")).toBeInTheDocument();
      expect(
        screen.getAllByLabelText("End-to-end farness workflow demo for Codex").length,
      ).toBeGreaterThan(0);
    });

    it("renders forecast artifact", () => {
      render(<HomePage />);
      expect(
        screen.getByText("Should we rewrite the auth layer now?"),
      ).toBeInTheDocument();
    });

    it("renders research proof section", () => {
      render(<HomePage />);
      expect(screen.getByText("Stability-under-probing")).toBeInTheDocument();
      expect(screen.getByText("11")).toBeInTheDocument();
      expect(screen.getAllByText("2").length).toBeGreaterThan(0);
    });

    it("renders instrument modules", () => {
      render(<HomePage />);
      expect(screen.getByText("What farness produces")).toBeInTheDocument();
    });

    it("renders editorial pull quote", () => {
      render(<HomePage />);
      const matches = screen.getAllByText(/AI is often fluent about decisions/);
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });

    it("renders installation section", () => {
      render(<HomePage />);
      expect(screen.getByText("Use it natively or from the CLI")).toBeInTheDocument();
      expect(screen.getByText("Codex")).toBeInTheDocument();
      expect(screen.getAllByText(/\$farness/).length).toBeGreaterThan(0);
    });

    it("renders closing CTA", () => {
      render(<HomePage />);
      expect(
        screen.getByText("See further before you decide."),
      ).toBeInTheDocument();
    });

    it("renders footer", () => {
      render(<HomePage />);
      expect(screen.getByText("Clarity at distance.")).toBeInTheDocument();
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

  describe("Docs page", () => {
    it("renders without crashing", () => {
      render(<DocsPage />);
    });

    it("renders docs title and install guidance", () => {
      render(<DocsPage />);
      expect(
        screen.getByText("Use farness with Codex, Claude Code, or the local CLI."),
      ).toBeInTheDocument();
      expect(screen.getByText("Install the package and choose a path")).toBeInTheDocument();
      expect(screen.getAllByText(/farness setup codex/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/farness doctor codex/).length).toBeGreaterThan(0);
      expect(screen.getByText("See the packaged flow before you install")).toBeInTheDocument();
      expect(screen.getByText("Fix drifted installs or reset cleanly")).toBeInTheDocument();
      expect(screen.getAllByText(/\$farness/).length).toBeGreaterThan(0);
    });

    it("explains that the CLI does not need an API key", () => {
      render(<DocsPage />);
      expect(screen.getByText(/No LLM API key is/)).toBeInTheDocument();
    });
  });

  // Paper page is now rendered by Quarto (not a React component)

  describe("shared Header component", () => {
    it("renders nav links on all pages", () => {
      render(<HomePage />);
      expect(screen.getAllByText("GitHub").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Docs").length).toBeGreaterThan(0);
    });

    it("renders install button", () => {
      render(<HomePage />);
      expect(screen.getByText("Install")).toBeInTheDocument();
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
    it("Homepage wrapper does NOT have dark theme class (light by default)", () => {
      const { container } = render(<HomePage />);
      const wrapper = container.firstElementChild as HTMLElement;
      expect(wrapper.className).not.toContain("theme-dark");
    });

    it("Thesis page renders without dark theme", () => {
      const { container } = render(<ThesisPage />);
      const wrapper = container.firstElementChild as HTMLElement;
      expect(wrapper.className).not.toContain("theme-dark");
    });

    // Paper page is now Quarto-rendered, not a React component
  });
});
