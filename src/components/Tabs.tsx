import React, { useState } from 'react';

interface ButtonProps {
  'data-test-id': string;
  text?: string;
  icon?: React.ReactNode;
  selected?: boolean;
  onClick?: (index?: number) => void;
  setSelected?: () => void;
  index?: number;
  size?: 's' | 'm';
}

interface TabsProps {
  'aria-label': string;
  'data-test-id'?: string;
  defaultSelected?: number;
  value?: number;
  size?: 's' | 'm';
  border?: boolean;
  fullWidth?: boolean;
  children: React.ReactElement<ButtonProps>[];
}

const TabsButton: React.FC<ButtonProps> = ({
  text,
  icon,
  selected,
  onClick,
  index,
  setSelected,
  'data-test-id': testId,
}) => (
  <button
    data-test-id={testId}
    className={`tab-button${selected ? ' tab-active' : ''}`}
    onClick={() => {
      setSelected?.();
      onClick?.(index);
    }}
  >
    {icon}
    {text}
    {selected && <span className="tab-indicator" />}
  </button>
);

const Tabs: React.FC<TabsProps> & { Button: typeof TabsButton } = ({
  'aria-label': ariaLabel,
  'data-test-id': testId,
  defaultSelected = 0,
  value,
  size = 'm',
  fullWidth,
  border,
  children,
}) => {
  const [selected, setSelected] = useState(defaultSelected);
  const effectiveSelected = value !== undefined ? value : selected;

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      data-test-id={testId}
      className={`tabs-container${fullWidth ? ' tabs-container--full-width' : ''}${border ? ' tabs-container--border' : ''}`}
    >
      {React.Children.map(children, (child, index) =>
        React.cloneElement(child, {
          index,
          selected: effectiveSelected === index,
          size,
          setSelected: () => setSelected(index),
        })
      )}
    </div>
  );
};

Tabs.Button = TabsButton;

export default Tabs;
