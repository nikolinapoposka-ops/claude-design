/**
 * Local stub for @quinyx/ui — used when the private registry is unavailable
 * (e.g. Vercel CI). Implements only the components actually used in this project.
 */
import React from 'react';

// ── CSSThemeProvider ──────────────────────────────────────────────────────────

export const CSSThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);

// ── Badge ────────────────────────────────────────────────────────────────────

const BADGE_STYLES: Record<string, { bg: string; color: string }> = {
  brand:   { bg: '#004851', color: '#fff' },
  notice:  { bg: '#fff3cd', color: '#856404' },
  info:    { bg: '#d8edf5', color: '#1a5f7a' },
  positive:{ bg: '#d1e7dd', color: '#0a3622' },
  negative:{ bg: '#f8d7da', color: '#842029' },
  warning: { bg: '#fff3cd', color: '#856404' },
};

interface BadgeProps {
  label: string;
  variant?: string;
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  customColor?: string;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'brand', customColor }) => {
  const s = BADGE_STYLES[variant] ?? BADGE_STYLES.brand;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 8px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: 600,
      lineHeight: '16px',
      backgroundColor: customColor ?? s.bg,
      color: s.color,
      whiteSpace: 'nowrap',
      fontFamily: 'Nunito, sans-serif',
      letterSpacing: '0.02em',
    }}>
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

export const Avatar: React.FC<AvatarProps> = ({ name, hasBorder }) => (
  <div
    className="avatar-sm"
    style={hasBorder ? { boxShadow: '0 0 0 2px #fff' } : undefined}
    title={name}
  >
    {getInitials(name)}
  </div>
);

// ── Icon ─────────────────────────────────────────────────────────────────────

interface IconProps {
  icon: string;
  size?: number | string;
  style?: React.CSSProperties;
}

export const Icon: React.FC<IconProps> = ({ size = 16, style }) => (
  <span style={{
    display: 'inline-flex',
    width: typeof size === 'number' ? `${size}px` : size,
    height: typeof size === 'number' ? `${size}px` : size,
    flexShrink: 0,
    ...style,
  }} />
);

// ── Stack ────────────────────────────────────────────────────────────────────

interface StackProps {
  direction?: 'row' | 'column';
  spacing?: number;
  alignItems?: string;
  justifyContent?: string;
  fullWidth?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export const Stack: React.FC<StackProps> = ({
  direction = 'row',
  spacing = 0,
  alignItems,
  justifyContent,
  children,
  style,
}) => (
  <div style={{
    display: 'flex',
    flexDirection: direction,
    gap: `${spacing * 4}px`,
    alignItems,
    justifyContent,
    ...style,
  }}>
    {children}
  </div>
);

// ── Text ─────────────────────────────────────────────────────────────────────

interface TextProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const Text: React.FC<TextProps> = ({ children, style, className }) => (
  <span
    style={{ fontFamily: 'Nunito, sans-serif', fontSize: '14px', color: '#1a2936', ...style }}
    className={className}
  >
    {children}
  </span>
);

// ── Chip ─────────────────────────────────────────────────────────────────────

interface ChipProps {
  text: string;
  'data-test-id'?: string;
  leftIcon?: string;
  rightIcon?: string;
  onClick?: () => void;
}

export const Chip: React.FC<ChipProps> = ({ text, onClick, 'data-test-id': testId }) => (
  <button
    type="button"
    data-test-id={testId}
    onClick={onClick}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 500,
      border: '1px solid #d0d9e0',
      background: '#f4f7f9',
      color: '#1a2936',
      cursor: onClick ? 'pointer' : 'default',
      fontFamily: 'Nunito, sans-serif',
      whiteSpace: 'nowrap',
    }}
  >
    {text}
  </button>
);

// ── Button ───────────────────────────────────────────────────────────────────

interface ButtonProps {
  text?: string;
  variant?: 'filled' | 'outlined' | 'text';
  intent?: string;
  size?: 'xs' | 's' | 'm' | 'l' | 'xl';
  icon?: string;
  onClick?: () => void;
  'aria-label'?: string;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  text,
  variant = 'filled',
  size = 'm',
  onClick,
  disabled,
  'aria-label': ariaLabel,
}) => {
  const heights: Record<string, string> = { xs: '24px', s: '28px', m: '36px', l: '44px', xl: '52px' };
  const fontSizes: Record<string, string> = { xs: '11px', s: '12px', m: '14px', l: '15px', xl: '16px' };
  const isFilled = variant === 'filled';
  const isText = variant === 'text';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        height: heights[size] ?? '36px',
        padding: isText ? '0 8px' : '0 16px',
        borderRadius: '6px',
        fontSize: fontSizes[size] ?? '14px',
        fontWeight: 600,
        border: isFilled ? 'none' : '1px solid #004851',
        background: isFilled ? '#004851' : isText ? 'transparent' : '#fff',
        color: isFilled ? '#fff' : '#004851',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        fontFamily: 'Nunito, sans-serif',
        letterSpacing: '0.01em',
      }}
    >
      {text}
    </button>
  );
};
