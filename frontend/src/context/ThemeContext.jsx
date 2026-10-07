import React, { createContext, useContext, useEffect } from 'react';

// Abhi poori site sirf LIGHT (white) theme me chalegi.
// Purane pages 'useTheme' use karte hain, isliye ye file rakhi hai taaki wo crash na ho.
// Aage kabhi dark mode chahiye to yahin se wapas laayenge.
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {}
});

export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    // Pehle kabhi dark save hua tha to use hata do
    document.documentElement.classList.remove('dark');
    try {
      localStorage.removeItem('theme');
      localStorage.removeItem('internconnect_theme');
    } catch (e) {
      // localStorage block ho to koi dikkat nahi
    }
  }, []);

  const value = { theme: 'light', toggleTheme: () => {} };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
