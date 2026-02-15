import { useUIStore } from '@/store/uiStore';
import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

export function DarkModeToggle() {
  const { darkMode, toggleDarkMode, setDarkMode } = useUIStore();

  // Initialize dark mode from localStorage on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      setDarkMode(true);
    } else if (savedDarkMode === 'false') {
      setDarkMode(false);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, [setDarkMode]);

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg bg-surface dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? (
        <FontAwesomeIcon icon={faSun} className="w-5 h-5 text-text-primary dark:text-gray-200" />
      ) : (
        <FontAwesomeIcon icon={faMoon} className="w-5 h-5 text-text-primary dark:text-gray-200" />
      )}
    </button>
  );
}
