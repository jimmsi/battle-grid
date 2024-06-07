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
      {`Player ${unit.player} Unit`}
    </div>
  );
};

export default DraggableUnit;
