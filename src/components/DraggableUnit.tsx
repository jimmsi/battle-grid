import React from 'react';
import { Unit as UnitType } from '../types';

interface DraggableUnitProps {
  unit: UnitType;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, unit: UnitType) => void;
}

const DraggableUnit: React.FC<DraggableUnitProps> = ({ unit, onDragStart }) => {
  return (
    <div
      className="unit"
      draggable
      onDragStart={(event) => onDragStart(event, unit)}
    >
      <img src={unit.imagePath} alt={unit.type} className="unit-image" />    </div>
  );
};

export default DraggableUnit;
