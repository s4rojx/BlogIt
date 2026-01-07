import React from 'react';

const ThemeToggle = ({ theme, toggleTheme }) => {
  return (
    <button
      type="button"
      aria-label="Toggle theme"
      className={`theme-toggle pill ${theme === 'dark' ? 'is-dark' : 'is-light'}`}
      onClick={toggleTheme}
    >
      <span className="toggle-track">
        <span className="toggle-thumb" />
      </span>
    </button>
  );
};

export default ThemeToggle;
