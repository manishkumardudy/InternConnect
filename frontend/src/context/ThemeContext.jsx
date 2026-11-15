import { createContext, useContext, useEffect } from 'react';

// Light theme provider maintains consistent white/light design and backward compatibility
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {}
});

export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    // Clear any stored dark mode settings
    document.documentElement.classList.remove('dark');
    try {
      localStorage.removeItem('theme');
      localStorage.removeItem('internconnect_theme');
    } catch (e) {
      // Ignore localStorage errors in restricted environments
    }
  }, []);

  const value = { theme: 'light', toggleTheme: () => {} };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
