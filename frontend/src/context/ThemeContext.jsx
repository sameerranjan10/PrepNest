import React, {
  createContext,
  useContext,
  useState,
  useLayoutEffect,
  useEffect,
  useCallback,
} from 'react';

const ThemeContext = createContext({
  theme: 'light',
  isDark: false,
  setTheme: () => {},
  toggleTheme: () => {},
});

const THEME_STORAGE_KEY = 'prepnest_theme';

function readInitialTheme() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // Ignore storage errors
  }
  return 'light';
}

function applyThemeToRoot(nextTheme) {
  const normalized = nextTheme === 'dark' ? 'dark' : 'light';
  const root = document.documentElement;
  root.setAttribute('data-theme', normalized);
  root.style.colorScheme = normalized;
  root.classList.toggle('dark', normalized === 'dark');
  try {
    localStorage.setItem(THEME_STORAGE_KEY, normalized);
  } catch {
    // Ignore storage errors
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readInitialTheme);

  // Sync synchronously before paint so no stale light/dark classes remain
  useLayoutEffect(() => {
    applyThemeToRoot(theme);
  }, [theme]);

  // Keep multiple browser tabs/windows synchronized
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key !== THEME_STORAGE_KEY) return;
      const synced = e.newValue === 'dark' ? 'dark' : 'light';
      setThemeState(synced);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setTheme = useCallback((nextTheme) => {
    const normalized = nextTheme === 'dark' ? 'dark' : 'light';
    applyThemeToRoot(normalized);
    setThemeState(normalized);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      applyThemeToRoot(next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
