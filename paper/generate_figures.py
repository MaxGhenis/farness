"""Generate publication-ready figures for the farness paper."""

import json
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.lines import Line2D

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
DATA_ROOT = Path(__file__).resolve().parent.parent / "experiments" / "stability_results"
FIG_DIR = Path(__file__).resolve().parent / "figures"
FIG_DIR.mkdir(exist_ok=True)

MODELS = {
    "claude-opus-4-6": "Claude Opus 4.6",
    "gpt-5.2": "GPT-5.2",
}

CONDITIONS = ["naive", "cot", "farness"]
CONDITION_LABELS = {"naive": "Naive", "cot": "CoT", "farness": "Farness"}

SCENARIOS = [
    "planning_estimate",
    "sunk_cost_project",
    "startup_success",
    "hiring_success",
    "acquisition_synergies",
    "product_launch",
    "deadline_estimate",
    "investment_return",
]

ADVERSARIAL_SCENARIOS = [
    "adversarial_anchoring",
    "adversarial_false_base_rate",
    "adversarial_sycophancy",
    "adversarial_sycophancy_down",
]

ALL_SCENARIOS = SCENARIOS + ADVERSARIAL_SCENARIOS
ANALYSIS_SCENARIOS = SCENARIOS + [
    "adversarial_anchoring",
    "adversarial_false_base_rate",
    "adversarial_sycophancy",
]

N_RUNS = 6

# Style
COLORS = {"naive": "#4878A8", "cot": "#E8913A", "farness": "#56A868"}
plt.rcParams.update({
    "font.size": 11,
    "axes.titlesize": 13,
    "axes.labelsize": 12,
    "figure.dpi": 300,
    "savefig.dpi": 300,
    "savefig.bbox": "tight",
    "font.family": "sans-serif",
})

try:
    plt.style.use("seaborn-v0_8-whitegrid")
except OSError:
    plt.style.use("ggplot")


# ---------------------------------------------------------------------------
# Data loading
# ---------------------------------------------------------------------------
def load_all_data():
    """Return dict: data[model_key][scenario][condition] = list of dicts."""
    data = {}
    for model_key in MODELS:
        model_dir = DATA_ROOT / model_key
        data[model_key] = {}
        for scenario in ALL_SCENARIOS:
            data[model_key][scenario] = {}
            for cond in CONDITIONS:
                runs = []
                for r in range(1, N_RUNS + 1):
                    # Try flat layout first, then subdirectory layout
                    fpath = model_dir / f"{scenario}_{cond}_run{r}.json"
                    if not fpath.exists():
                        fpath = model_dir / scenario / f"{scenario}_{cond}_run{r}.json"
                    if fpath.exists():
                        with open(fpath) as f:
                            runs.append(json.load(f))
                data[model_key][scenario][cond] = runs
    return data


def get_update_magnitudes(data, model, scenarios=None, condition=None):
    """Get list of update_magnitude values."""
    if scenarios is None:
        scenarios = ALL_SCENARIOS
    vals = []
    for sc in scenarios:
        for cond in (CONDITIONS if condition is None else [condition]):
            for run in data[model][sc][cond]:
                vals.append(run["update_magnitude"])
    return vals


def bootstrap_mean_ci(vals, n_boot=5000, alpha=0.05):
    """Bootstrap 95% CI for the mean."""
    rng = np.random.default_rng(42)
    vals = np.asarray(vals, dtype=float)
    idx = rng.integers(0, len(vals), size=(n_boot, len(vals)))
    means = vals[idx].mean(axis=1)
    lo = np.percentile(means, 100 * alpha / 2)
    hi = np.percentile(means, 100 * (1 - alpha / 2))
    return lo, hi


def add_box(ax, xy, width, height, text, facecolor, edgecolor="#37424A"):
    """Draw a rounded text box in axes coordinates."""
    x, y = xy
    rect = plt.matplotlib.patches.FancyBboxPatch(
        (x, y),
        width,
        height,
        boxstyle="round,pad=0.015,rounding_size=0.02",
        linewidth=1.2,
        edgecolor=edgecolor,
        facecolor=facecolor,
        transform=ax.transAxes,
    )
    ax.add_patch(rect)
    ax.text(
        x + width / 2,
        y + height / 2,
        text,
        transform=ax.transAxes,
        ha="center",
        va="center",
        fontsize=10,
        wrap=True,
    )


# ---------------------------------------------------------------------------
# Figure 0: Protocol schematic
# ---------------------------------------------------------------------------
def fig_protocol():
    fig, ax = plt.subplots(figsize=(11, 4.4))
    ax.axis("off")

    add_box(
        ax,
        (0.02, 0.34),
        0.18,
        0.30,
        "Scenario\n\nTroubled project:\nprobability of launching\nwithin revised budget/time?",
        "#F4F7FA",
    )
    add_box(
        ax,
        (0.26, 0.60),
        0.18,
        0.22,
        "Naive prompt\n\nInitial estimate:\n12%",
        "#DCE9F5",
    )
    add_box(
        ax,
        (0.26, 0.16),
        0.18,
        0.22,
        "Farness prompt\n\nInitial estimate:\n10.5%",
        "#DDF0E1",
    )
    add_box(
        ax,
        (0.49, 0.34),
        0.20,
        0.30,
        "Same probe bundle\nfor both conditions\n\n16% base rate\n2 engineers interviewing\nIntegration testing not started",
        "#F8F0DD",
    )
    add_box(
        ax,
        (0.74, 0.60),
        0.20,
        0.22,
        "Naive revised\nestimate:\n4.1%\n\nUpdate: 7.9 pp",
        "#DCE9F5",
    )
    add_box(
        ax,
        (0.74, 0.16),
        0.20,
        0.22,
        "Farness revised\nestimate:\n4.1%\n\nUpdate: 6.4 pp",
        "#DDF0E1",
    )

    arrow_kw = dict(arrowstyle="->", lw=1.4, color="#4B5964")
    ax.annotate("", xy=(0.26, 0.71), xytext=(0.20, 0.52), xycoords="axes fraction", arrowprops=arrow_kw)
    ax.annotate("", xy=(0.26, 0.27), xytext=(0.20, 0.46), xycoords="axes fraction", arrowprops=arrow_kw)
    ax.annotate("", xy=(0.49, 0.49), xytext=(0.44, 0.71), xycoords="axes fraction", arrowprops=arrow_kw)
    ax.annotate("", xy=(0.49, 0.49), xytext=(0.44, 0.27), xycoords="axes fraction", arrowprops=arrow_kw)
    ax.annotate("", xy=(0.74, 0.71), xytext=(0.69, 0.55), xycoords="axes fraction", arrowprops=arrow_kw)
    ax.annotate("", xy=(0.74, 0.27), xytext=(0.69, 0.43), xycoords="axes fraction", arrowprops=arrow_kw)

    ax.text(
        0.5,
        0.04,
        "Illustrative single-scenario workflow using the sunk-cost-project case. "
        "The design compares how far each condition moves after receiving the same probes.",
        transform=ax.transAxes,
        ha="center",
        va="bottom",
        fontsize=10,
        color="#37424A",
    )

    fig.suptitle(
        "Stability-under-probing protocol: one concrete scenario",
        fontsize=13,
        y=0.98,
    )
    fig.tight_layout()
    fig.savefig(FIG_DIR / "fig_protocol.png")
    plt.close(fig)
    print("  Saved fig_protocol.png")


# ---------------------------------------------------------------------------
# Figure 1: Mean update magnitude by condition x model
# ---------------------------------------------------------------------------
def fig_update_magnitude(data):
    fig, axes = plt.subplots(1, 2, figsize=(10, 4.8), sharey=False)

    for ax, model_key in zip(axes, MODELS):
        means = []
        for i, cond in enumerate(CONDITIONS):
            vals = get_update_magnitudes(
                data,
                model_key,
                scenarios=ANALYSIS_SCENARIOS,
                condition=cond,
            )
            mean_val = np.mean(vals)
            ci_lo, ci_hi = bootstrap_mean_ci(vals)
            means.append(mean_val)
            ax.errorbar(
                i,
                mean_val,
                yerr=[[mean_val - ci_lo], [ci_hi - mean_val]],
                fmt="o",
                color=COLORS[cond],
                ecolor=COLORS[cond],
                elinewidth=2,
                capsize=4,
                markersize=9,
                markeredgecolor="black",
                markeredgewidth=0.6,
                zorder=3,
            )
            ax.text(
                i + 0.04,
                mean_val + max(0.6, mean_val * 0.05),
                f"{mean_val:.1f}",
                ha="left",
                va="bottom",
                fontsize=9,
            )

        ax.set_xticks(range(len(CONDITIONS)))
        ax.set_xticklabels([CONDITION_LABELS[c] for c in CONDITIONS])
        ax.set_title(MODELS[model_key])
        ax.set_ylabel("Mean update magnitude")
        ax.set_ylim(bottom=-1)
        ax.grid(axis="y", alpha=0.35)

        reduction = (1 - means[2] / means[0]) * 100
        ax.text(
            1.0,
            max(means) * 0.9,
            f"Farness: {reduction:.0f}% lower than naive",
            ha="center",
            va="bottom",
            fontsize=9,
            color="#37424A",
        )

    fig.suptitle(
        "Mean update magnitude by condition and model",
        fontsize=14,
        y=1.02,
    )
    fig.tight_layout()
    fig.savefig(FIG_DIR / "fig_update_magnitude.png")
    plt.close(fig)
    print("  Saved fig_update_magnitude.png")


# ---------------------------------------------------------------------------
# Figure 2: Forest plot of per-scenario Cohen's d (farness vs naive)
# ---------------------------------------------------------------------------
def cohens_d(group1, group2):
    """Cohen's d: (mean1 - mean2) / pooled_sd. Positive = group1 larger.

    NOTE: Equivalent logic exists in farness.experiments.stability._bootstrap_cohens_d.
    Duplicated here to keep the paper script self-contained.
    """
    n1, n2 = len(group1), len(group2)
    m1, m2 = np.mean(group1), np.mean(group2)
    s1, s2 = np.std(group1, ddof=1), np.std(group2, ddof=1)
    pooled = np.sqrt(((n1 - 1) * s1**2 + (n2 - 1) * s2**2) / (n1 + n2 - 2))
    if pooled == 0:
        return 0.0
    return (m1 - m2) / pooled


def bootstrap_ci_d(naive_vals, farness_vals, n_boot=5000, alpha=0.05):
    """Bootstrap 95% CI for Cohen's d (naive - farness) / pooled."""
    rng = np.random.default_rng(42)
    naive_vals = np.asarray(naive_vals, dtype=float)
    farness_vals = np.asarray(farness_vals, dtype=float)
    n1, n2 = len(naive_vals), len(farness_vals)

    # Draw all bootstrap samples at once: shape (n_boot, n)
    idx1 = rng.integers(0, n1, size=(n_boot, n1))
    idx2 = rng.integers(0, n2, size=(n_boot, n2))
    b1 = naive_vals[idx1]
    b2 = farness_vals[idx2]

    m1 = b1.mean(axis=1)
    m2 = b2.mean(axis=1)
    s1 = b1.std(axis=1, ddof=1)
    s2 = b2.std(axis=1, ddof=1)
    pooled = np.sqrt(((n1 - 1) * s1**2 + (n2 - 1) * s2**2) / (n1 + n2 - 2))
    with np.errstate(divide="ignore", invalid="ignore"):
        ds = np.where(pooled == 0, 0.0, (m1 - m2) / pooled)

    lo = np.percentile(ds, 100 * alpha / 2)
    hi = np.percentile(ds, 100 * (1 - alpha / 2))
    return lo, hi


def scenario_label(sc):
    return sc.replace("_", " ").title()


def fig_forest_plot(data):
    fig, axes = plt.subplots(2, 1, figsize=(8, 8), sharex=True)

    for ax, model_key in zip(axes, MODELS):
        ds = []
        ci_los = []
        ci_his = []
        labels = []
        for sc in SCENARIOS:
            naive_vals = np.array(
                [r["update_magnitude"] for r in data[model_key][sc]["naive"]]
            )
            farness_vals = np.array(
                [r["update_magnitude"] for r in data[model_key][sc]["farness"]]
            )
            d = cohens_d(naive_vals, farness_vals)
            lo, hi = bootstrap_ci_d(naive_vals, farness_vals)
            ds.append(d)
            ci_los.append(lo)
            ci_his.append(hi)
            labels.append(scenario_label(sc))

        y_pos = np.arange(len(SCENARIOS))
        ax.hlines(y_pos, ci_los, ci_his, color="#555555", linewidth=1.2)
        point_colors = [COLORS["farness"] if d >= 0 else COLORS["naive"] for d in ds]
        ax.scatter(ds, y_pos, color=point_colors, s=50, zorder=5, marker="D")
        ax.axvline(0, color="gray", linestyle="--", linewidth=0.8, alpha=0.6)
        ax.set_yticks(y_pos)
        ax.set_yticklabels(labels)
        ax.invert_yaxis()
        ax.set_title(MODELS[model_key])
        ax.set_xlabel("Cohen's d (positive = less updating under farness)")

    fig.suptitle(
        "Effect sizes: farness vs naive per scenario (non-adversarial)",
        fontsize=13,
        y=1.02,
    )
    fig.tight_layout()
    fig.savefig(FIG_DIR / "fig_forest_plot.png")
    plt.close(fig)
    print("  Saved fig_forest_plot.png")


# ---------------------------------------------------------------------------
# Figure 3: Convergence visualization
# ---------------------------------------------------------------------------
def fig_convergence(data):
    conv_scenarios = ["sunk_cost_project", "acquisition_synergies", "deadline_estimate"]
    fig, axes = plt.subplots(2, 3, figsize=(12, 6.5), sharex=True)

    for row, model_key in enumerate(MODELS):
        for col, sc in enumerate(conv_scenarios):
            ax = axes[row, col]
            bounds = []
            for cond in ["naive", "farness"]:
                runs = data[model_key][sc][cond]
                initial_vals = np.array([run["initial_estimate"] for run in runs])
                final_vals = np.array([run["final_estimate"] for run in runs])
                init_mean = np.mean(initial_vals)
                final_mean = np.mean(final_vals)
                init_lo, init_hi = bootstrap_mean_ci(initial_vals)
                final_lo, final_hi = bootstrap_mean_ci(final_vals)
                bounds.extend([init_lo, init_hi, final_lo, final_hi])

                xs = np.array([0, 1], dtype=float)
                ys = np.array([init_mean, final_mean], dtype=float)
                ax.plot(
                    xs,
                    ys,
                    color=COLORS[cond],
                    marker="o",
                    linewidth=2.2,
                    markersize=6,
                )
                ax.errorbar(
                    xs,
                    ys,
                    yerr=[
                        [init_mean - init_lo, final_mean - final_lo],
                        [init_hi - init_mean, final_hi - final_mean],
                    ],
                    fmt="none",
                    ecolor=COLORS[cond],
                    elinewidth=1.4,
                    capsize=3,
                    alpha=0.9,
                )

            span = max(bounds) - min(bounds)
            pad = max(1.0, span * 0.18)
            ax.set_ylim(min(bounds) - pad, max(bounds) + pad)
            ax.set_xticks([0, 1])
            ax.set_xticklabels(["Initial", "Final"])
            ax.grid(axis="y", alpha=0.35)

            if row == 0:
                ax.set_title(scenario_label(sc), fontsize=11)
            if col == 0:
                ax.set_ylabel(f"{MODELS[model_key]}\nEstimate")

    handles = [
        Line2D([0], [0], color=COLORS["naive"], marker="o", linewidth=2.2, label="Naive"),
        Line2D([0], [0], color=COLORS["farness"], marker="o", linewidth=2.2, label="Farness"),
    ]
    fig.legend(handles=handles, loc="lower center", ncol=2, frameon=True, fontsize=10)

    fig.suptitle(
        "Selected scenarios: both conditions end near similar values, but farness starts closer",
        fontsize=13,
        y=1.02,
    )
    fig.tight_layout(rect=[0, 0.06, 1, 1])
    fig.savefig(FIG_DIR / "fig_convergence.png")
    plt.close(fig)
    print("  Saved fig_convergence.png")


# ---------------------------------------------------------------------------
# Figure 4: Sycophancy dot plot
# ---------------------------------------------------------------------------
def fig_sycophancy(data):
    fig, axes = plt.subplots(1, 2, figsize=(10, 4.8), sharey=True)

    sc = "adversarial_sycophancy"
    rng = np.random.default_rng(42)

    for ax, model_key in zip(axes, MODELS):
        for i, cond in enumerate(CONDITIONS):
            vals = np.array(
                [r["update_magnitude"] for r in data[model_key][sc][cond]],
                dtype=float,
            )
            mean_val = np.mean(vals)
            ci_lo, ci_hi = bootstrap_mean_ci(vals)
            jitter = rng.uniform(-0.11, 0.11, size=len(vals))
            ax.scatter(
                np.full(len(vals), i, dtype=float) + jitter,
                vals,
                color=COLORS[cond],
                alpha=0.8,
                s=42,
                edgecolors="white",
                linewidths=0.5,
                zorder=3,
            )
            ax.errorbar(
                i,
                mean_val,
                yerr=[[mean_val - ci_lo], [ci_hi - mean_val]],
                fmt="_",
                color="black",
                ecolor="black",
                markersize=24,
                linewidth=1.6,
                capsize=4,
                zorder=4,
            )
            ax.text(
                i,
                ci_hi + max(12, (ci_hi - ci_lo) * 0.15),
                f"{mean_val:.0f}",
                ha="center",
                va="bottom",
                fontsize=9,
            )

        ax.set_xticks(range(len(CONDITIONS)))
        ax.set_xticklabels([CONDITION_LABELS[c] for c in CONDITIONS])
        ax.set_title(MODELS[model_key])
        ax.grid(axis="y", alpha=0.35)

    axes[0].set_ylabel("Update magnitude (leads)")
    fig.suptitle(
        "Sycophancy scenario: run-level updates and condition means",
        fontsize=13,
        y=1.02,
    )

    fig.tight_layout()
    fig.savefig(FIG_DIR / "fig_sycophancy.png")
    plt.close(fig)
    print("  Saved fig_sycophancy.png")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    print("Loading data...")
    data = load_all_data()

    # Quick sanity check
    for model_key in MODELS:
        total = sum(
            len(data[model_key][sc][c])
            for sc in ALL_SCENARIOS
            for c in CONDITIONS
        )
        print(f"  {MODELS[model_key]}: {total} runs loaded")

    print("Generating figures...")
    fig_protocol()
    fig_update_magnitude(data)
    fig_forest_plot(data)
    fig_convergence(data)
    fig_sycophancy(data)
    print("Done.")


if __name__ == "__main__":
    main()
