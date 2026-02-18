import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo">
          <img
            src="https://www.figma.com/api/mcp/asset/0116bdaa-392d-4506-a2ac-96ed07982fe0"
            alt="Quinyx Logo"
            className="logo-image"
          />
        </div>

        <button className="nav-button">DASHBOARD</button>
        <button className="nav-button nav-button-dropdown">
          SCHEDULE
          <svg className="chevron" viewBox="0 0 10 5" fill="white">
            <path d="M0 0l5 5 5-5z" />
          </svg>
        </button>
        <button className="nav-button nav-button-dropdown">
          TIME
          <svg className="chevron" viewBox="0 0 10 5" fill="white">
            <path d="M0 0l5 5 5-5z" />
          </svg>
        </button>
        <button className="nav-button">PEOPLE</button>
        <button className="nav-button">ANALYTICS</button>
        <button className="nav-button">FORECAST</button>
      </div>

      <div className="navbar-right">
        <button className="nav-button nav-button-dropdown">
          Unit Name
          <svg className="chevron" viewBox="0 0 10 5" fill="white">
            <path d="M0 0l5 5 5-5z" />
          </svg>
        </button>
        <button className="nav-icon-button">
          <img
            src="https://www.figma.com/api/mcp/asset/65c87913-535d-4fca-aca8-154fd033195b"
            alt="Mail"
            className="icon"
          />
        </button>
        <button className="nav-icon-button nav-button-dropdown">
          <div className="avatar">
            <span className="avatar-text">SJ</span>
          </div>
          <svg className="chevron" viewBox="0 0 10 5" fill="white">
            <path d="M0 0l5 5 5-5z" />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
