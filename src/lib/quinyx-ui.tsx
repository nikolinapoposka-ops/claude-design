/**
 * Local mock for @quinyx/ui — used during build when the private registry
 * is unavailable. Implements only the components actually used in this project.
 */
import React from 'react';

// ── Badge ────────────────────────────────────────────────────────────────────

interface BadgeProps {
  label: string;
  variant?: string;
  size?: 'small' | 'medium' | 'large';
  customColor?: string;
}

export const Badge: React.FC<BadgeProps> = ({ label, customColor, variant }) => {
  const bg = customColor ?? (variant === 'brand' ? '#004851' : '#004851');
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: 600,
        lineHeight: '16px',
        backgroundColor: bg,
        color: '#fff',
        whiteSpace: 'nowrap',
        fontFamily: 'Nunito, sans-serif',
        letterSpacing: '0.02em',
      }}
    >
      {label}
    </span>
  );
};

// ── Avatar ───────────────────────────────────────────────────────────────────

interface AvatarProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  hasBorder?: boolean;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const Avatar: React.FC<AvatarProps> = ({ name, hasBorder }) => {
  return (
    <div
      className="avatar-sm"
      style={hasBorder ? { boxShadow: '0 0 0 2px #fff' } : undefined}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
};
