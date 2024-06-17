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
  isAttackTarget: boolean;
}

const Square: React.FC<SquareProps> = ({
  value,
  onClick,
  onDrop,
  onDragOver,
  onMouseOver,
  onMouseOut,
  onDragStart,
  highlighted,
  isAttackTarget
}) => {
  return (
    <div
      className={`square ${highlighted ? 'highlighted' : ''} ${isAttackTarget ? 'attack-target' : ''}`}
      onClick={onClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      draggable={!!value}
      onDragStart={value ? onDragStart : undefined}
    >
     {value && (
        <>
          <img src={value.imagePath} alt={value.type} className="unit-image" />
          <div className="health-bar">
            <div
              className="health-bar-inner"
              style={{ width: `${(value.hp / value.maxHP) * 100}%` }}
            ></div>
          </div>
        </>
      )}
    </div>
  );
};

export default Square;
