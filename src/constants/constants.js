export const sp = {
    1: 16,
    2: 32,
    3: 48,
    4: 64,
    5: 80,
    6: 96,
    7: 112,
    8: 128,
    9: 144,
    10: 160,

    half: 8,
    xsm: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xlg: 20,
    xxlg: 24,
}

export const currencies = {EUR: '€', USD: '$', GBP: '£', CHF: '$$'};
export const categoryColors = {
    'Generic': '#8C86B8',
    'Food': '#E8755F',
    'Home': '#55A982',
    'Groceries': '#8DBD4F',
    'Bills & Utilities': '#D9A83F',
    'Transport': '#5795C7',
    'Travel': '#687FC4',
    'Entertainment': '#A85DA3',
    'Shopping': '#D75E7D',
    'Health': '#4DAFAF',
    'Sports': '#6EA64D',
    'Subscriptions': '#8B65C2',
    'Gifts': '#D97A55',
    'Work': '#7777A5',
    'Education': '#4F94B5',
    'Pets': '#B28A4E',
    'Personal Care': '#C45C91',
    'Services': '#789B68',
    'Fees & Charges': '#C75B5B',
    'Other': '#888888',
};
export const groupIcons = [
    'people-outline',   
    'rocket-outline',   
    'home-outline',    
    'hammer-outline',   
    'fish-outline', 
    'airplane-outline', 
    'planet-outline',   
    'beer-outline', 
    'flash-outline',    
    'paw-outline',  
    // 'bug-outline',  
    // 'cash-outline', 
];

const lightColors2 = {
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

const lightColors3 = {
    // Brand
    // primary: '#6FAF8F',
    primary: '#7567A8',
    primaryDark: '#3F765C',
    primaryLight: '#DDEFE5',
    accent: "#6FAF8F",

    // Backgrounds
    background: '#F7FBF8',
    surface: '#FFFFFF',

    // Text
    text: '#263B32',
    textSecondary: '#718078',
    border: '#DCE8E1',

    // Status
    success: '#78B89A',
    successBackground: '#E8F5EC',

    danger: '#E99A9A',
    dangerBackground: '#FBEAEA',

    warning: '#EBCB75',
    warningBackground: '#FFF7DF',

    info: '#82B6D1',
    infoBackground: '#EAF5FA',
    white: '#FFFFFF'
};

export const lightColors = {
    // Brand
    primary: '#7567A8',
    primaryLight: '#E9E5F3',
    primaryDark: '#5C508A',

    // Semantic
    positive: '#78B89A',
    positiveLight: '#E8F3EC',
    positiveDark: '#3F805E',

    negative: '#E99A9A',
    negativeLight: '#F9E5E5',
    negativeDark: '#B95757',

    danger: '#E63946',

    // Backgrounds
    background: '#F7F7FA',
    surface: '#FFFFFF',
    surfaceSecondary: '#F0EFF4',
    
    // Text
    text: '#25232B',
    textSecondary: '#625F6B',
    textMuted: '#94919C',
    textLight: '#FFFFFF',
    white: '#FFFFFF',
    
    // Borders / separators
    border: '#DDD9E5',
    divider: '#EAE8EE',

    // Misc
    overlay: 'rgba(0, 0, 0, 0.4)',
};

const darkColors2 = {
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

export const darkColors = {
    // Brand
    primary: '#9B8FC9',
    primaryLight: '#3A3550',
    primaryDark: '#7567A8',

    // Semantic
    positive: '#82C5A3',
    positiveLight: '#293F34',
    positiveDark: '#5FA47F',

    negative: '#E89B9B',
    negativeLight: '#432F2F',
    negativeDark: '#D27676',

    // Backgrounds
    background: '#15141A',
    surface: '#1E1D24',
    surfaceSecondary: '#282630',

    // Text
    text: '#F2F0F5',
    textSecondary: '#B5B1BC',
    textMuted: '#817D89',
    textLight: '#FFFFFF',
    white: '#FFFFFF',

    // Borders / separators
    border: '#393640',
    divider: '#302E37',

    // Misc
    overlay: 'rgba(0, 0, 0, 0.6)',
};
const DarkMode = false;
export const colors = DarkMode ? darkColors : lightColors;

/* export const AVATAR_COLORS = {
    1: '#2A9D8F',  // Teal
    2: '#9B5DE5',  // Purple
    3: '#F77F00',  // Orange
    4: '#F72585',  // Magenta
    5: '#118AB2',  // Ocean blue
    6: '#8AC926', // Lime
    7: '#FF595E', // Coral
    8: '#00B4D8', // Cyan
    9: '#FFCA3A', // Gold
    10: '#52B788', // Green

    // discarded ↓
    // 1: '#E63946',  // Red
    // 2: '#4361EE',  // Blue
    // 4: '#F4D35E',  // Yellow
    // 7: '#06D6A0',  // Emerald
    // 11: '#6C584C', // Brown
    // 13: '#8338EC', // Violet
    // 16: '#1982C4', // Azure
    // 18: '#C77DFF', // Lavender
    // 19: '#FF70A6', // Pink
    // 20: '#6D6875', // Slate
}; */