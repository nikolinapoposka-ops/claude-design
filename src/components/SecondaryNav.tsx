import React, { useState, useRef, useEffect } from 'react';
import Tabs from './Tabs';
import CreateAuditModal from './CreateAuditModal';
import { useRole } from '../context/RoleContext';
import { useToast } from './Toast';

const dropdownItems = [
  {
    key: 'tasks',
    label: 'Tasks',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"></path>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
        <polyline points="9 12 11 14 15 10"></polyline>
      </svg>
    ),
  },
  {
    key: 'form',
    label: 'Form',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="8" y1="13" x2="16" y2="13"></line>
        <line x1="8" y1="17" x2="16" y2="17"></line>
        <line x1="8" y1="9" x2="10" y2="9"></line>
      </svg>
    ),
  },
  {
    key: 'story',
    label: 'Story',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="8" y1="13" x2="16" y2="13"></line>
        <line x1="8" y1="17" x2="13" y2="17"></line>
      </svg>
    ),
  },
  {
    key: 'event',
    label: 'Event',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <rect x="3" y="4" width="18" height="17" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
        <polygon points="12 13 13.1 15.7 16 15.7 13.8 17.4 14.6 20.1 12 18.5 9.4 20.1 10.2 17.4 8 15.7 10.9 15.7"></polygon>
      </svg>
    ),
  },
  {
    key: 'audit',
    label: 'Audit',
    active: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"></path>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
        <polyline points="9 12 11 14 15 10"></polyline>
      </svg>
    ),
  },
  {
    key: 'link',
    label: 'Link',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"></path>
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"></path>
      </svg>
    ),
  },
  {
    key: 'new-from-template',
    label: 'New from template',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"></path>
        <polyline points="12 22 12 16"></polyline>
        <polyline points="9 13 12 16 15 13"></polyline>
      </svg>
    ),
  },
];

interface SecondaryNavProps {
  onNavigateToTemplate: () => void;
  onReuseTemplate: () => void;
}

const SecondaryNav: React.FC<SecondaryNavProps> = ({ onNavigateToTemplate, onReuseTemplate }) => {
  const { role } = useRole();
  const createToast = useToast();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const notifyTabMissing = () =>
    createToast({ message: 'This tab page does not exist yet, be patient', type: 'info' });
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <>
    <nav className="secondary-nav">
      <div className="secondary-nav-left">
        <button className="tool-button">
          <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="#42515b" strokeWidth="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path>
          </svg>
        </button>

        <Tabs
          aria-label="Store navigation"
          data-test-id="tabs-secondary-nav"
          defaultSelected={5}
          value={5}
        >
          <Tabs.Button
            text="Dashboard"
            data-test-id="tab-btn-dashboard"
            onClick={notifyTabMissing}
            icon={
              <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            }
          />
          <Tabs.Button
            text="Story"
            data-test-id="tab-btn-story"
            onClick={notifyTabMissing}
            icon={
              <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="17" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
                <polygon points="12 12.5 13.1 15.2 16 15.2 13.8 16.9 14.6 19.6 12 18 9.4 19.6 10.2 16.9 8 15.2 10.9 15.2"></polygon>
              </svg>
            }
          />
          <Tabs.Button
            text="Tasks"
            data-test-id="tab-btn-tasks"
            onClick={notifyTabMissing}
            icon={
              <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                <polyline points="9 12 11 14 15 10"></polyline>
              </svg>
            }
          />
          <Tabs.Button
            text="Files"
            data-test-id="tab-btn-files"
            onClick={notifyTabMissing}
            icon={
              <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <polyline points="7 12 8.5 13.5 11 11"></polyline>
                <line x1="13" y1="12" x2="17" y2="12"></line>
                <polyline points="7 15.5 8.5 17 11 14.5"></polyline>
                <line x1="13" y1="15.5" x2="17" y2="15.5"></line>
                <polyline points="7 19 8.5 20.5 11 18.5"></polyline>
                <line x1="13" y1="19" x2="17" y2="19"></line>
              </svg>
            }
          />
          <Tabs.Button
            text="Forms"
            data-test-id="tab-btn-forms"
            onClick={notifyTabMissing}
            icon={
              <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <rect x="7" y="11" width="10" height="7" rx="1"></rect>
                <circle cx="10" cy="14" r="1.5"></circle>
                <polyline points="7 18 10.5 14.5 13 16.5 15 14 17 18"></polyline>
              </svg>
            }
          />
          <Tabs.Button
            text="Audit"
            data-test-id="tab-btn-audit"
            icon={
              <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3h18v13l-5 5H3V3z"></path>
                <path d="M16 21v-5h5"></path>
                <polyline points="7 12 11 15.5 18 9"></polyline>
              </svg>
            }
          />
          <Tabs.Button
            text="Report"
            data-test-id="tab-btn-report"
            onClick={notifyTabMissing}
            icon={
              <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <line x1="10" y1="9" x2="8" y2="9"></line>
              </svg>
            }
          />
        </Tabs>
      </div>

      <div className="secondary-nav-right">
        <button className="tool-button">
          <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="#42515b" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </button>

        {/* Plus button with dropdown — hidden for store */}
        {role !== 'store' && <div className="dropdown-wrapper" ref={dropdownRef}>
          <button
            className="tool-button"
            data-test-id="btn-create"
            onClick={() => setDropdownOpen((v) => !v)}
          >
            <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="#42515b" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>

          {dropdownOpen && (
            <div className="create-dropdown" role="menu">
              {dropdownItems.map((item) => (
                <button
                  key={item.key}
                  className={`dropdown-item${item.active ? ' dropdown-item--active' : ''}`}
                  role="menuitem"
                  onClick={() => {
                    setDropdownOpen(false);
                    if (item.key === 'audit') {
                      if (role === 'areaManager') {
                        onReuseTemplate();
                      } else {
                        setAuditModalOpen(true);
                      }
                    }
                  }}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>}

        <button className="tool-button notification-button">
          <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="#42515b" strokeWidth="2">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 01-3.46 0"></path>
          </svg>
          <span className="notification-badge">99+</span>
        </button>
      </div>
    </nav>

    {auditModalOpen && (
      <CreateAuditModal
        onClose={() => setAuditModalOpen(false)}
        onNavigateToTemplate={onNavigateToTemplate}
        onReuseTemplate={() => { setAuditModalOpen(false); onReuseTemplate(); }}
      />
    )}
    </>
  );
};

export default SecondaryNav;
