import { darkColors, lightColors } from '@/src/constants/constants';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";

const ThemeContext = createContext(null);

export function ThemeProvider({children}) {
    const systemColorScheme = useColorScheme();
    const [themePreference, setThemePreference] = useState('system');

    useEffect(() => {
        const loadTheme = async () => {
            const value = await AsyncStorage.getItem('ThemePreference');
            if (value === 'light' || value === 'dark' || value === 'system') setThemePreference(value);
        }
        loadTheme();
    }, []);

    const setTheme = async (selectedTheme) => {
        setThemePreference(selectedTheme);
        await AsyncStorage.setItem('ThemePreference', selectedTheme);
    }
    const isDark = themePreference === 'dark' || (themePreference === 'system' && systemColorScheme === 'dark');
    const colors = isDark ? darkColors : lightColors;
    const toggleDarkMode = () => {
        if (themePreference === 'dark') setTheme('light');
        if (themePreference === 'light') setTheme('dark');
        if (themePreference === 'system' && isDark) setTheme('light');
        if (themePreference === 'system' && !isDark) setTheme('dark');
    }

    const theme = useMemo(
        () => ({
            themePreference,
            setTheme,
            isDark,
            colors,
            toggleDarkMode,
        }),
        [themePreference, isDark]
    );
    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    return useContext(ThemeContext);
}