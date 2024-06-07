import React from 'react';
import Square from './Square';
import { Unit } from '../types';

interface BoardProps {
  board: (Unit | null)[];
  onSquareClick: (index: number) => void;
  onSquareDrop: (event: React.DragEvent<HTMLDivElement>, index: number) => void;
  onSquareDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onMouseOverUnit: (unit: Unit) => void;
  onMouseOutUnit: () => void;
  onSquareDragStart: (event: React.DragEvent<HTMLDivElement>, index: number) => void;
  highlightedSquares: number[];
}

const Board: React.FC<BoardProps> = ({
  board,
  onSquareClick,
  onSquareDrop,
  onSquareDragOver,
  onMouseOverUnit,
  onMouseOutUnit,
  onSquareDragStart,
  highlightedSquares
}) => {
  const renderSquare = (index: number) => {
    return (
      <Square
        key={index}
        value={board[index]}
        onClick={() => onSquareClick(index)}
        onDrop={(event) => onSquareDrop(event, index)}
        onDragOver={onSquareDragOver}
        highlighted={highlightedSquares.includes(index)}
        onMouseOver={() => board[index] && onMouseOverUnit(board[index]!)}
        onMouseOut={onMouseOutUnit}
        onDragStart={(event) => onSquareDragStart(event, index)}
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
