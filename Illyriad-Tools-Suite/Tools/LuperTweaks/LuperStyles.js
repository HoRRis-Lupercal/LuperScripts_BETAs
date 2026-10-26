const THEMES = {
    "Dark-mode": {
        "--ik-theme-bg": "#131314",
        "--ik-theme-content-bg": "#151516",
        "--ik-theme-alt-bg": "#202021",
        "--ik-theme-light-alt-bg": "#515252",
        "--ik-theme-input-bg": "#515252",
        "--ik-theme-border": "#333537",
        "--ik-theme-text": "#e3e3e3",
        "--ik-theme-link": "#ea882e",
        "--ik-theme-link-hover": "#e54e20"
    },
    "Custom": {
        "--ik-theme-bg": "#0f172a",
        "--ik-theme-content-bg": "#1e293b",
        "--ik-theme-alt-bg": "#334155",
        "--ik-theme-light-alt-bg": "#475569",
        "--ik-theme-input-bg": "#475569",
        "--ik-theme-border": "#64748b",
        "--ik-theme-text": "#f8fafc",
        "--ik-theme-link": "#38bdf8",
        "--ik-theme-link-hover": "#0ea5e9"
    }
};

// Expose globally or export depending on your userscript loader setup
window.IKLuperThemes = THEMES;
