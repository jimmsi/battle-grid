import React from 'react';
import { Unit } from '../types';

interface SquareProps {
  value: Unit | null;
  onClick: () => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onMouseOver: () => void;
  onMouseOut: () => void;
  onDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
  highlighted: boolean;
}

const Square: React.FC<SquareProps> = ({
  value,
  onClick,
  onDrop,
  onDragOver,
  onMouseOver,
  onMouseOut,
  onDragStart,
  highlighted
}) => {
  return (
    <div
      className={`square ${highlighted ? 'highlighted' : ''}`}
      onClick={onClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      draggable={!!value}
      onDragStart={value ? onDragStart : undefined}
    >
      {value ? `P${value.player}` : ''}
    </div>
  );
};

export default Square;
