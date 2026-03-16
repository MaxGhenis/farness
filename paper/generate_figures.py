"""Generate publication-ready figures for the farness paper."""

import json
import os
from pathlib import Path

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

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


# ---------------------------------------------------------------------------
# Figure 1: Box plots of update magnitude by condition x model
# ---------------------------------------------------------------------------
def fig_update_magnitude(data):
    fig, axes = plt.subplots(1, 2, figsize=(10, 5), sharey=False)

    for ax, model_key in zip(axes, MODELS):
        box_data = []
        positions = []
        colors_list = []
        for i, cond in enumerate(CONDITIONS):
            vals = []
            for sc in ALL_SCENARIOS:
                for run in data[model_key][sc][cond]:
                    vals.append(run["update_magnitude"])
            box_data.append(vals)
            positions.append(i)
            colors_list.append(COLORS[cond])

        bp = ax.boxplot(
            box_data,
            positions=positions,
            widths=0.5,
            patch_artist=True,
            showfliers=True,
            flierprops=dict(marker="o", markersize=3, alpha=0.4),
        )
        for patch, color in zip(bp["boxes"], colors_list):
            patch.set_facecolor(color)
            patch.set_alpha(0.7)
        for median in bp["medians"]:
            median.set_color("black")
            median.set_linewidth(1.5)

        ax.set_xticks(positions)
        ax.set_xticklabels([CONDITION_LABELS[c] for c in CONDITIONS])
        ax.set_title(MODELS[model_key])
        ax.set_ylabel("Update magnitude (pp)")

    fig.suptitle("Update magnitude by condition and model", fontsize=14, y=1.02)
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
        ax.scatter(ds, y_pos, color=COLORS["farness"], s=50, zorder=5, marker="D")
        ax.axvline(0, color="gray", linestyle="--", linewidth=0.8, alpha=0.6)
        ax.set_yticks(y_pos)
        ax.set_yticklabels(labels)
        ax.invert_yaxis()
        ax.set_title(MODELS[model_key])
        ax.set_xlabel("Cohen's d (naive - farness)")

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
    fig, axes = plt.subplots(1, 3, figsize=(12, 5), sharey=False)

    for ax, sc in zip(axes, conv_scenarios):
        for model_key in MODELS:
            for cond in ["naive", "farness"]:
                runs = data[model_key][sc][cond]
                for run in runs:
                    x_start = 0 if cond == "naive" else 1
                    x_end = 0.4 if cond == "naive" else 1.4
                    alpha_val = 0.25
                    ax.annotate(
                        "",
                        xy=(x_end, run["final_estimate"]),
                        xytext=(x_start, run["initial_estimate"]),
                        arrowprops=dict(
                            arrowstyle="->",
                            color=COLORS[cond],
                            alpha=alpha_val,
                            lw=1.2,
                        ),
                    )

        # Mean reference lines for farness initial
        for model_key in MODELS:
            farness_runs = data[model_key][sc]["farness"]
            farness_mean_init = np.mean(
                [r["initial_estimate"] for r in farness_runs]
            )
            linestyle = "-" if model_key == "claude-opus-4-6" else "--"
            ax.axhline(
                farness_mean_init,
                color=COLORS["farness"],
                linestyle=linestyle,
                linewidth=1.0,
                alpha=0.5,
                label=f"Farness init mean ({MODELS[model_key][:6]})" if sc == conv_scenarios[0] else None,
            )

        ax.set_title(scenario_label(sc), fontsize=11)
        ax.set_xticks([0.2, 1.2])
        ax.set_xticklabels(["Naive", "Farness"])
        ax.set_ylabel("Estimate value")

    # Legend
    handles = [
        mpatches.Patch(color=COLORS["naive"], alpha=0.6, label="Naive"),
        mpatches.Patch(color=COLORS["farness"], alpha=0.6, label="Farness"),
    ]
    fig.legend(handles=handles, loc="lower center", ncol=2, frameon=True, fontsize=10)

    fig.suptitle(
        "Convergence: initial to final estimates (both models overlaid)",
        fontsize=13,
        y=1.02,
    )
    fig.tight_layout(rect=[0, 0.06, 1, 1])
    fig.savefig(FIG_DIR / "fig_convergence.png")
    plt.close(fig)
    print("  Saved fig_convergence.png")


# ---------------------------------------------------------------------------
# Figure 4: Sycophancy bar chart
# ---------------------------------------------------------------------------
def fig_sycophancy(data):
    fig, ax = plt.subplots(figsize=(8, 5))

    sc = "adversarial_sycophancy"
    x = np.arange(len(MODELS))
    width = 0.22

    for i, cond in enumerate(CONDITIONS):
        means = []
        stds = []
        for model_key in MODELS:
            vals = [r["update_magnitude"] for r in data[model_key][sc][cond]]
            means.append(np.mean(vals))
            stds.append(np.std(vals, ddof=1))
        bars = ax.bar(
            x + (i - 1) * width,
            means,
            width,
            label=CONDITION_LABELS[cond],
            color=COLORS[cond],
            alpha=0.8,
            yerr=stds,
            capsize=4,
        )

    ax.set_xticks(x)
    ax.set_xticklabels([MODELS[m] for m in MODELS])
    ax.set_ylabel("Update magnitude")
    ax.set_title("Sycophancy scenario: update magnitude by model and condition")
    ax.legend(frameon=True)

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
    fig_update_magnitude(data)
    fig_forest_plot(data)
    fig_convergence(data)
    fig_sycophancy(data)
    print("Done.")


if __name__ == "__main__":
    main()
