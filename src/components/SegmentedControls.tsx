import React, { useState } from 'react';

interface ButtonProps {
  text: string;
  'data-test-id': string;
  onClick?: (index: number) => void;
}

type SegmentedChildProps = ButtonProps & {
  index?: number;
  isSelected?: boolean;
  size?: 's' | 'm';
  setSelected?: () => void;
};

interface SegmentedControlsProps {
  'aria-label': string;
  'data-test-id'?: string;
  defaultSelected?: number;
  size?: 's' | 'm';
  border?: boolean;
  children: React.ReactElement<SegmentedChildProps>[];
}

const SegmentedControlsButton: React.FC<SegmentedChildProps> = ({
  text,
  isSelected,
  onClick,
  index,
  setSelected,
  size = 'm',
  'data-test-id': testId,
}) => (
  <button
    data-test-id={testId}
    className={`segmented-btn segmented-btn--${size}${isSelected ? ' segmented-btn--selected' : ''}`}
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
          isSelected: selected === index,
          size,
          setSelected: () => setSelected(index),
        })
      )}
    </div>
  );
};

SegmentedControls.Button = SegmentedControlsButton;
export default SegmentedControls;

