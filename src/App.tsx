import React, { useState } from 'react';
import Board from './components/Board';
import DraggableUnit from './components/DraggableUnit';
import { Unit as UnitType } from './types';
import { calculatePossibleMoves } from './utils';
import { calculatePossibleAttackTargets } from './utils';
import './App.css';

const initialUnits: UnitType[] = [
  { id: '1', player: 1, maxHP: 100, hp: 100, movementRange: 3, attackRange: 1, attackValue: 10, position: null },
  { id: '2', player: 2, maxHP: 100, hp: 100, movementRange: 1, attackRange: 1, attackValue: 10, position: null },
];

const createEmptyBoard = () => Array(12 * 12).fill(null);

const App: React.FC = () => {
  const [units, setUnits] = useState<UnitType[]>(initialUnits);
  const [board, setBoard] = useState<(UnitType | null)[]>(createEmptyBoard());
  const [highlightedSquares, setHighlightedSquares] = useState<number[]>([]);
  const [highlightedAttackTargets, setHighlightedAttackTargets] = useState<number[]>([]);
  const [draggingUnit, setDraggingUnit] = useState<UnitType | null>(null);

  const handleNewUnitDragStart = (event: React.DragEvent<HTMLDivElement>, unit: UnitType) => {
    const newUnit = { ...unit, id: `${unit.id}-${new Date().getTime()}`, position: null };
    event.dataTransfer.setData('unit', JSON.stringify(newUnit));
    setDraggingUnit(newUnit);
  };

  const handleSquareDragStart = (event: React.DragEvent<HTMLDivElement>, index: number) => {
    const unit = board[index];
    if (unit) {
      event.dataTransfer.setData('unit', JSON.stringify(unit));
      setDraggingUnit(unit);
      const possibleMoves = calculatePossibleMoves(unit.position!, unit.movementRange, board);
      setHighlightedSquares(possibleMoves);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, index: number) => {
    event.preventDefault();
    const unitData = event.dataTransfer.getData('unit');
    if (unitData) {
      const unit: UnitType = JSON.parse(unitData);
      if (highlightedSquares.includes(index) || unit.position === null) {
        const updatedUnit = { ...unit, position: index };
        const updatedUnits = units.map(u => u.id === unit.id ? updatedUnit : u.position === null ? u : updatedUnit);
        const updatedBoard = board.slice();
        if (unit.position !== null) {
          updatedBoard[unit.position] = null; // Clear the old position if the unit was already on the board
        }
        updatedBoard[index] = updatedUnit;
        setUnits(updatedUnits);
        setBoard(updatedBoard);
        setHighlightedSquares([]);
        setDraggingUnit(null);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleSquareClick = (index: number) => {
    console.log(`Square ${index} clicked`);
  };

  const handleMouseOver = (unit: UnitType) => {
    if (unit.position !== null && !draggingUnit) {
      const possibleMoves = calculatePossibleMoves(unit.position, unit.movementRange, board);
      const possibleAttackTargets = calculatePossibleAttackTargets(unit.position, board);
      setHighlightedSquares(possibleMoves);
      // Highlight attack targets in a different way, e.g., setting a different state or adding a class
      // For simplicity, let's assume we have another state for attack targets
      setHighlightedAttackTargets(possibleAttackTargets);
    }
  };
  

  const handleMouseOut = () => {
    if (!draggingUnit) {
      setHighlightedSquares([]);
    }
  };

  return (
    <div className="game">
      <div className="units">
        {initialUnits.map(unit => (
          <DraggableUnit key={unit.id} unit={unit} onDragStart={handleNewUnitDragStart} />
        ))}
      </div>
      <div className="board-container">
        <Board
          board={board}
          onSquareClick={handleSquareClick}
          onSquareDrop={handleDrop}
          onSquareDragOver={handleDragOver}
          onMouseOverUnit={handleMouseOver}
          onMouseOutUnit={handleMouseOut}
          onSquareDragStart={handleSquareDragStart}
          highlightedSquares={highlightedSquares}
          highlightedAttackTargets={highlightedAttackTargets}
        />
      </div>
    </div>
  );
};

export default App;
