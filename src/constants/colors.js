const lightColors = {
    primary: "#2563EB",
    primaryPressed: "#1D4ED8",
    accent: "#14B8A6",

    success: "#16A34A",
    error: "#DC2626",
    warning: "#F59E0B",

    background: "#F8FAFC",
    surface: "#FFFFFF",
    surfaceSecondary: "#F1F5F9",
    input: "#F1F5F9",
    border: "#E2E8F0",

    text: "#0F172A",
    textSecondary: "#64748B",
    textMuted: "#94A3B8",

    icon: "#475569",
    overlay: "rgba(15, 23, 42, 0.5)",
    white: '#ffffff',
};

const darkColors = {
    primary: "#3B82F6",
    primaryPressed: "#2563EB",
    accent: "#2DD4BF",

    success: "#22C55E",
    error: "#F87171",
    warning: "#FBBF24",

    background: "#0F172A",
    surface: "#1E293B",
    surfaceSecondary: "#334155",
    input: "#1E293B",
    border: "#475569",

    text: "#F8FAFC",
    textSecondary: "#CBD5E1",
    textMuted: "#94A3B8",

    icon: "#CBD5E1",
    overlay: "rgba(0, 0, 0, 0.6)",
    
    white: '#ffffff',
};
const DarkMode = false;
export const colors = DarkMode ? darkColors : lightColors;