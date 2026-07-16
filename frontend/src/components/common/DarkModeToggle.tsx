import { useUIStore } from '@/store/uiStore';
import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

export function DarkModeToggle() {
  const { darkMode, toggleDarkMode, setDarkMode } = useUIStore();

  // Inicializa o dark mode a partir do localStorage (ou preferência do sistema).
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      setDarkMode(true);
    } else if (savedDarkMode === 'false') {
      setDarkMode(false);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, [setDarkMode]);

  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      className="p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={darkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      title={darkMode ? 'Modo claro' : 'Modo escuro'}
    >
      <FontAwesomeIcon
        icon={darkMode ? faSun : faMoon}
        className="w-5 h-5 text-current"
      />
    </button>
  );
}
