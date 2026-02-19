import React, { useState, useRef, useEffect } from 'react';
import { useRole, AREA_MANAGER_NAME, STORE_NAME } from '../context/RoleContext';
import type { Role } from '../context/RoleContext';

const ROLES: { value: Role; label: string; persona?: string }[] = [
  { value: 'hq', label: 'HQ' },
  { value: 'areaManager', label: 'Area Mgr', persona: AREA_MANAGER_NAME },
  { value: 'store', label: 'Store', persona: STORE_NAME },
];

const POS_KEY = 'audit_demo_role_panel_pos';

function readPos(): { x: number; y: number } | null {
  try {
    const v = localStorage.getItem(POS_KEY);
    if (!v) return null;
    const p = JSON.parse(v);
    if (typeof p.x === 'number' && typeof p.y === 'number') return p;
  } catch {}
  return null;
}

const RoleSwitcher: React.FC = () => {
  const { role, setRole } = useRole();
  const activeRole = ROLES.find((r) => r.value === role);

  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startX: number; startY: number;
    origX: number; origY: number;
    moved: boolean;
  } | null>(null);
  // Cleared by setTimeout(0) after mouseup so button onClick can check it
  const justDragged = useRef(false);

  // null = no saved pos yet, component uses CSS bottom/right as fallback
  const [pos, setPos] = useState<{ x: number; y: number } | null>(readPos);

  // On first mount without a saved position, anchor to bottom-right using real dimensions
  useEffect(() => {
    if (!pos && panelRef.current) {
      const { offsetWidth: w, offsetHeight: h } = panelRef.current;
      setPos({ x: window.innerWidth - w - 20, y: window.innerHeight - h - 20 });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;

      if (!drag.moved && Math.abs(dx) <= 3 && Math.abs(dy) <= 3) return;
      drag.moved = true;

      const panel = panelRef.current;
      const w = panel ? panel.offsetWidth : 160;
      const h = panel ? panel.offsetHeight : 90;
      const x = Math.max(0, Math.min(window.innerWidth  - w, drag.origX + dx));
      const y = Math.max(0, Math.min(window.innerHeight - h, drag.origY + dy));

      setPos({ x, y });
      if (panel) panel.style.cursor = 'grabbing';
    };

    const onMouseUp = (e: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      if (drag.moved) {
        const panel = panelRef.current;
        const w = panel ? panel.offsetWidth : 160;
        const h = panel ? panel.offsetHeight : 90;
        const x = Math.max(0, Math.min(window.innerWidth  - w, drag.origX + (e.clientX - drag.startX)));
        const y = Math.max(0, Math.min(window.innerHeight - h, drag.origY + (e.clientY - drag.startY)));
        localStorage.setItem(POS_KEY, JSON.stringify({ x, y }));
        justDragged.current = true;
        setTimeout(() => { justDragged.current = false; }, 0);
      }

      dragRef.current = null;
      document.body.style.userSelect = '';
      if (panelRef.current) panelRef.current.style.cursor = '';
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const panel = panelRef.current;
    if (!panel) return;
    const origX = pos?.x ?? window.innerWidth  - panel.offsetWidth  - 20;
    const origY = pos?.y ?? window.innerHeight - panel.offsetHeight - 20;
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX, origY, moved: false };
    document.body.style.userSelect = 'none';
  };

  const panelStyle: React.CSSProperties = pos
    ? { top: pos.y, left: pos.x, bottom: 'auto', right: 'auto', cursor: 'grab' }
    : { cursor: 'grab' };

  return (
    <div
      className="role-switcher"
      style={panelStyle}
      ref={panelRef}
      onMouseDown={handleMouseDown}
    >
      <span className="role-switcher-label">Dev · Role</span>
      <div className="role-switcher-buttons">
        {ROLES.map((r) => (
          <button
            key={r.value}
            className={`role-switcher-btn${role === r.value ? ' role-switcher-btn--active' : ''}`}
            onClick={() => {
              if (justDragged.current) return;
              setRole(r.value);
            }}
          >
            {r.label}
          </button>
        ))}
      </div>
      {activeRole?.persona && (
        <span className="role-switcher-persona">{activeRole.persona}</span>
      )}
    </div>
  );
};

export default RoleSwitcher;
