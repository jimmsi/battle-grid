import React from 'react';
import Square from './Square';
import { Unit, Terrain, Building } from '../types';

interface BoardProps {
  board: (Unit | null)[];
  terrainBoard: (Terrain | null)[];
  buildingBoard: (Building | null)[];
  onSquareClick: (index: number) => void;
  onSquareDrop: (event: React.DragEvent<HTMLDivElement>, index: number) => void;
  onSquareDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onMouseOverUnit: (unit: Unit) => void;
  onMouseOutUnit: () => void;
  onSquareDragStart: (event: React.DragEvent<HTMLDivElement>, index: number) => void;
  highlightedSquares: number[];
  highlightedAttackTargets: number[];
  onUnitClick: (unit: Unit) => void;
}

const Board: React.FC<BoardProps> = ({
  board,
  terrainBoard,
  buildingBoard,
  onSquareClick,
  onSquareDrop,
  onSquareDragOver,
  onMouseOverUnit,
  onMouseOutUnit,
  onSquareDragStart,
  highlightedSquares,
  highlightedAttackTargets,
  onUnitClick
}) => {
  const renderSquare = (index: number) => {
    const unit = board[index];
    const terrainTile = terrainBoard[index];
    const buildingTile = buildingBoard[index];
    const isHighlighted = highlightedSquares.includes(index);
    const isAttackTarget = highlightedAttackTargets.includes(index);

    return (
      <Square
        key={index}
        unit={unit}
        terrain={terrainTile}
        building={buildingTile}
        onClick={() => unit ? onUnitClick(unit) : onSquareClick(index)}
        onDrop={(event) => onSquareDrop(event, index)}
        onDragOver={onSquareDragOver}
        highlighted={isHighlighted}
        isAttackTarget={isAttackTarget}
        onMouseOver={() => unit && onMouseOverUnit(unit)}
        onMouseOut={onMouseOutUnit}
        onDragStart={(event) => onSquareDragStart(event, index)}
        onUnitClick={() => unit && onUnitClick(unit)}
      />
    );
  };

  return (
    <div className="board">
      {board.map((_, index) => renderSquare(index))}
    </div>
  );
};

export default Board;

