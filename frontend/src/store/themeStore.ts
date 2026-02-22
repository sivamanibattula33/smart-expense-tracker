import { create } from 'zustand';

interface ThemeState {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    setTheme: (theme: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
    theme: (localStorage.getItem('theme-storage') as 'light' | 'dark') || 'dark', // default dark as requested globally
    toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme-storage', newTheme);
        return { theme: newTheme };
    }),
    setTheme: (theme) => {
        localStorage.setItem('theme-storage', theme);
        set({ theme });
    },
}));
