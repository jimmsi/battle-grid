// src/components/Unit.tsx
import React from 'react';
import { Unit as UnitType } from '../types';

interface UnitProps {
    unit: UnitType;
    onDragStart: (event: React.DragEvent<HTMLDivElement>, unit: UnitType) => void;
}

const Unit: React.FC<UnitProps> = ({ unit, onDragStart }) => {
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

export default Unit; 
