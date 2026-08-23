import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {}
});

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('theme') || localStorage.getItem('internconnect_theme');
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
    } catch (e) {
      console.warn('[ThemeContext] LocalStorage access error:', e);
    }
    return 'light';
  });

  useEffect(() => {
    try {
      const rootEl = document.documentElement;
      const bodyEl = document.body;
      const appRoot = document.getElementById('root');

      if (theme === 'dark') {
        rootEl.classList.add('dark');
        if (bodyEl) bodyEl.classList.add('dark');
        if (appRoot) appRoot.classList.add('dark');
      } else {
        rootEl.classList.remove('dark');
        if (bodyEl) bodyEl.classList.remove('dark');
        if (appRoot) appRoot.classList.remove('dark');
      }

      localStorage.setItem('theme', theme);
      localStorage.setItem('internconnect_theme', theme);
    } catch (e) {
      console.warn('[ThemeContext] Error setting theme:', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'light',
      toggleTheme: () => {}
    };
  }
  return context;
};

export default ThemeContext;
