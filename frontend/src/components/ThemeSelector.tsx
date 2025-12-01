import React, { useState, useEffect } from 'react';
import '../styles/theme-selector.css';

export const ThemeSelector: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<string>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('adminTheme') || 'light';
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('theme-dark', 'theme-light', 'theme-gradient');
    
    // Add the new theme class
    root.classList.add(`theme-${theme}`);
    
    // Save to localStorage
    localStorage.setItem('adminTheme', theme);
    setCurrentTheme(theme);
  };

  return (
    <div className="theme-selector">
      <div className="theme-selector-content">
        <h3>🎨 Selecciona tu tema favorito</h3>
        
        <div className="theme-options">
          <button
            className={`theme-option ${currentTheme === 'dark' ? 'active' : ''}`}
            onClick={() => applyTheme('dark')}
            title="Tema Oscuro Profesional"
          >
            <div className="theme-preview dark-preview">
              <div className="preview-bar"></div>
              <div className="preview-content">
                <div className="preview-item"></div>
                <div className="preview-item"></div>
              </div>
            </div>
            <span>Oscuro Pro</span>
          </button>

          <button
            className={`theme-option ${currentTheme === 'light' ? 'active' : ''}`}
            onClick={() => applyTheme('light')}
            title="Tema Claro Minimalista"
          >
            <div className="theme-preview light-preview">
              <div className="preview-bar"></div>
              <div className="preview-content">
                <div className="preview-item"></div>
                <div className="preview-item"></div>
              </div>
            </div>
            <span>Claro Mini</span>
          </button>

          <button
            className={`theme-option ${currentTheme === 'gradient' ? 'active' : ''}`}
            onClick={() => applyTheme('gradient')}
            title="Tema Moderno Degradado"
          >
            <div className="theme-preview gradient-preview">
              <div className="preview-bar"></div>
              <div className="preview-content">
                <div className="preview-item"></div>
                <div className="preview-item"></div>
              </div>
            </div>
            <span>Gradiente</span>
          </button>
        </div>
      </div>
    </div>
  );
};
