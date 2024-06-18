import React from 'react';
import { Unit as UnitType, Terrain, Building } from '../types';

interface SquareProps {
  unit: UnitType | null;
  terrain: Terrain | null;
  building: Building | null;
  onClick: () => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onMouseOver: () => void;
  onMouseOut: () => void;
  onDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
  highlighted: boolean;
  isAttackTarget: boolean;
  onUnitClick: () => void;
}

const Square: React.FC<SquareProps> = ({
  unit,
  terrain,
  building,
  onClick,
  onDrop,
  onDragOver,
  onMouseOver,
  onMouseOut,
  onDragStart,
  highlighted,
  isAttackTarget,
  onUnitClick
}) => {
  return (
    <div
      className={`square ${highlighted ? 'highlighted' : ''} ${isAttackTarget ? 'attack-target' : ''}`}
      onClick={unit ? onUnitClick : onClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      draggable={!!unit}
      onDragStart={unit ? onDragStart : undefined}
    >
      {terrain && <img src={terrain.imagePath} alt={terrain.type} className="terrain-image" />}
      {building && <img src={building.imagePath} alt={building.type} className="building-image" />}
      {unit && (
        <>
          <img src={unit.imagePath} alt={unit.type} className="unit-image" />
          <div className="health-bar">
            <div
              className="health-bar-inner"
              style={{ width: `${(unit.hp / unit.maxHP) * 85}%`, margin: '1px' }}
            ></div>
          </div>
        </>
      )}
    </div>
  );
};

export default Square;
