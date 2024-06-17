import React, { useState } from 'react';
import Board from './components/Board';
import DraggableUnit from './components/DraggableUnit';
import { Unit as UnitType } from './types';
import { Terrain as Terrain } from './types';
import { calculatePossibleMoves } from './utils';
import { calculatePossibleMeleeAttackTargets } from './utils';
import { calculatePossiblePenetratingDistanceAttackTargets } from './utils';
import { calculatePossibleNonPenetratingDistanceAttackTargets } from './utils';
import './App.css';

const initialUnits: UnitType[] = [
  { id: '1', player: 1, type: 'Soldier', maxHP: 100, hp: 100, movementRange: 2, attackRange: 1, attackValue: 20, position: null, isPenetratingAttack: false, imagePath: '/images/soldier.png' },
//  { id: '2', player: 1, type: 'Archer', maxHP: 80, hp: 80, movementRange: 3, attackRange: 4, attackValue: 10, position: null, isPenetratingAttack: false },
//  { id: '3', player: 1, type: 'Knight', maxHP: 200, hp: 200, movementRange: 2, attackRange: 5, attackValue: 40, position: null, isPenetratingAttack: false },
//  { id: '4', player: 1, type: 'Crossbow Ranger', maxHP: 150, hp: 150, movementRange: 3, attackRange: 4, attackValue: 20, position: null, isPenetratingAttack: false },
  { id: '5', player: 1, type: 'Artillery', maxHP: 100, hp: 100, movementRange: 1, attackRange: 6, attackValue: 50, position: null, isPenetratingAttack: true, imagePath: '/images/ballista.png' },
  { id: '6', player: 2, type: 'Soldier', maxHP: 100, hp: 100, movementRange: 2, attackRange: 1, attackValue: 20, position: null, isPenetratingAttack: false, imagePath: '/images/soldier.png' },
 // { id: '7', player: 2, type: 'Archer', maxHP: 80, hp: 80, movementRange: 3, attackRange: 4, attackValue: 10, position: null, isPenetratingAttack: false },
 // { id: '8', player: 2, type: 'Knight', maxHP: 200, hp: 200, movementRange: 2, attackRange: 5, attackValue: 40, position: null, isPenetratingAttack: false },
 // { id: '9', player: 2, type: 'Crossbow Ranger', maxHP: 150, hp: 150, movementRange: 3, attackRange: 4, attackValue: 20, position: null, isPenetratingAttack: false },
  { id: '10', player: 2, type: 'Artillery', maxHP: 100, hp: 100, movementRange: 1, attackRange: 6, attackValue: 50, position: null, isPenetratingAttack: true, imagePath: '/images/ballista.png' }
];

const initialTerrain: Terrain[] = [
  { id: 't1', type: 'grass', position: null, imagePath: '/images/grass.png' },
  { id: 't2', type: 'rock', position: null, imagePath: '/images/rock.png' },
  { id: 't3', type: 'water', position: null, imagePath: '/images/water.png' },
  // Lägg till fler terräng-tiles här om nödvändigt
];


const createEmptyBoard = () => Array(12 * 12).fill(null);

const App: React.FC = () => {
  const [units, setUnits] = useState<UnitType[]>(initialUnits);
  const [terrain, setTerrain] = useState<Terrain[]>(initialTerrain);
  const [board, setBoard] = useState<(UnitType | null)[]>(createEmptyBoard());
  const [highlightedSquares, setHighlightedSquares] = useState<number[]>([]);
  const [highlightedAttackTargets, setHighlightedAttackTargets] = useState<number[]>([]);
  const [draggingUnit, setDraggingUnit] = useState<UnitType | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<UnitType | null>(null);

  const handleTerrainDragStart = (event: React.DragEvent<HTMLDivElement>, terrain: Terrain) => {
    const newTerrain = { ...terrain, id: `${terrain.id}-${new Date().getTime()}`, position: null };
    event.dataTransfer.setData('terrain', JSON.stringify(newTerrain));
  }; 

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

      // Skapa en drag-image och applicera rätt klass
      const dragImage = document.createElement('img');
      dragImage.src = unit.imagePath;
      dragImage.classList.add('drag-image');
      document.body.appendChild(dragImage);
      event.dataTransfer.setDragImage(dragImage, 25, 25); // Justera offset efter behov
      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 0);
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

  const handleMouseOver = (unit: UnitType) => {
    if (unit.position !== null && !draggingUnit && !selectedUnit) {
      const possibleMoves = calculatePossibleMoves(unit.position, unit.movementRange, board);
      let possibleAttackTargets: number[];

      if (unit.attackRange === 1) {
        possibleAttackTargets = calculatePossibleMeleeAttackTargets(unit.position, board);
      } else if (unit.isPenetratingAttack) {
        possibleAttackTargets = calculatePossiblePenetratingDistanceAttackTargets(unit.position, unit.attackRange, board);
      } else {
        possibleAttackTargets = calculatePossibleNonPenetratingDistanceAttackTargets(unit.position, unit.attackRange, board);
      }

      setHighlightedSquares(possibleMoves);
      setHighlightedAttackTargets(possibleAttackTargets);
    }
  };

  const handleMouseOut = () => {
    if (!draggingUnit) {
      setHighlightedSquares([]);
      if (!selectedUnit) {
        setHighlightedAttackTargets([]);
      }
    }
  };

  const handleUnitClick = (unit: UnitType) => {
    if (!selectedUnit) {
      // Välj en enhet för attack, oavsett spelare
      setSelectedUnit(unit);
      // Behåll de nuvarande highlightade målen
    } else if (selectedUnit && highlightedAttackTargets.includes(unit.position!)) {
      // Kontrollera att den valda enheten och målenheten tillhör olika spelare
      if (selectedUnit.player !== unit.player) {
        // Utför attacken
        unit.hp -= selectedUnit.attackValue;
        console.log(`Attack successful! ${selectedUnit.id} attacked ${unit.id} for ${selectedUnit.attackValue} damage.`);
        if (unit.hp <= 0) {
          console.log(`${unit.id} has been defeated.`);
          // Ta bort enheten från brädet om hp <= 0
          const updatedBoard = board.slice();
          updatedBoard[unit.position!] = null;
          setBoard(updatedBoard);
        } else {
          console.log(`${unit.id} has ${unit.hp} HP remaining.`);
        }

        // Återställ tillstånd efter attacken
        setSelectedUnit(null);
        setHighlightedSquares([]);
        setHighlightedAttackTargets([]);
      } else {
        console.log("Cannot attack your own units.");
      }
    } else {
      // Återställ tillståndet om en tom ruta eller en enhet som inte är ett möjligt mål klickas
      setSelectedUnit(null);
      setHighlightedSquares([]);
      setHighlightedAttackTargets([]);
      console.log("Invalid target selected. Resetting state.");
    }
  };

  const handleSquareClick = (index: number) => {
    if (!board[index]) {
      // Hantera klick på tom ruta
      setSelectedUnit(null);
      setHighlightedSquares([]);
      setHighlightedAttackTargets([]);
      console.log("Clicked on an empty square. Resetting state.");
    }
  };

  return (
    <div className="game">
      <div className="units player1-units">
        {units.filter(unit => unit.player === 1).map(unit => (
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
          handleUnitClick={handleUnitClick}
        />
      </div>
      <div className="units player2-units">
        {units.filter(unit => unit.player === 2).map(unit => (
          <DraggableUnit key={unit.id} unit={unit} onDragStart={handleNewUnitDragStart} />
        ))}
      </div>
    </div>
  );
};

export default App;
