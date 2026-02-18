import React from 'react';

interface CreateTemplateNavProps {
  onBack: () => void;
}

const CreateTemplateNav: React.FC<CreateTemplateNavProps> = ({ onBack }) => {
  return (
    <nav className="secondary-nav">
      <div className="secondary-nav-left">
        <button className="tool-button" onClick={onBack} aria-label="Go back">
          <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="#42515b" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      </div>

      <div className="secondary-nav-right">
        <button className="tool-button">
          <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="#42515b" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </button>
        <button className="tool-button">
          <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="#42515b" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <button className="tool-button notification-button">
          <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="#42515b" strokeWidth="2">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 01-3.46 0"></path>
          </svg>
          <span className="notification-badge">99+</span>
        </button>
      </div>
    </nav>
  );
};

export default CreateTemplateNav;
