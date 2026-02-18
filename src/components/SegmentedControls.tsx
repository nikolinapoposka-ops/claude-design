import React, { useState } from 'react';

interface ButtonProps {
  text: string;
  'data-test-id': string;
  onClick?: (index: number) => void;
}

interface SegmentedControlsProps {
  'aria-label': string;
  'data-test-id'?: string;
  defaultSelected?: number;
  size?: 's' | 'm';
  border?: boolean;
  children: React.ReactElement<ButtonProps>[];
}

const SegmentedControlsButton: React.FC<ButtonProps & {
  index?: number;
  selected?: boolean;
  size?: 's' | 'm';
  setSelected?: () => void;
}> = ({ text, selected, onClick, index, setSelected, size = 'm', 'data-test-id': testId }) => (
  <button
    data-test-id={testId}
    className={`segmented-btn segmented-btn--${size}${selected ? ' segmented-btn--selected' : ''}`}
    onClick={() => {
      setSelected?.();
      onClick?.(index ?? 0);
    }}
  >
    {text}
  </button>
);

const SegmentedControls: React.FC<SegmentedControlsProps> & {
  Button: typeof SegmentedControlsButton;
} = ({ 'aria-label': ariaLabel, 'data-test-id': testId, defaultSelected = 0, size = 'm', border, children }) => {
  const [selected, setSelected] = useState(defaultSelected);

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      data-test-id={testId}
      className={`segmented-controls segmented-controls--${size}${border ? ' segmented-controls--border' : ''}`}
    >
      {React.Children.map(children, (child, index) =>
        React.cloneElement(child, {
          index,
          selected: selected === index,
          size,
          setSelected: () => setSelected(index),
        })
      )}
    </div>
  );
};

SegmentedControls.Button = SegmentedControlsButton;

export default SegmentedControls;
