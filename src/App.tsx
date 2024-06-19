import React, { useState } from 'react';
import Board from './components/Board';
import DraggableUnit from './components/DraggableUnit';
import { Unit as UnitType, Terrain as TerrainType, Building as BuildingType } from './types';
import { calculatePossibleMoves } from './utils';
import { calculatePossibleMeleeAttackTargets } from './utils';
import { calculatePossiblePenetratingDistanceAttackTargets } from './utils';
import { calculatePossibleNonPenetratingDistanceAttackTargets } from './utils';
import { calculatePossiblePenetratingHorizontalVerticalDistanceAttackTargets } from './utils';
import './App.css';

const initialUnits: UnitType[] = [
  { id: '1', player: 1, type: 'Soldier', maxHP: 50, hp: 50, movementRange: 2, attackRange: 1, attackValue: 20, position: null, isPenetratingAttack: false, imagePath: '/images/soldier.png', cost: 50, isPaid: false },
  //  { id: '2', player: 1, type: 'Archer', maxHP: 80, hp: 80, movementRange: 3, attackRange: 4, attackValue: 10, position: null, isPenetratingAttack: false },
  //  { id: '3', player: 1, type: 'Knight', maxHP: 200, hp: 200, movementRange: 2, attackRange: 5, attackValue: 40, position: null, isPenetratingAttack: false },
  //  { id: '4', player: 1, type: 'Crossbow Ranger', maxHP: 150, hp: 150, movementRange: 3, attackRange: 4, attackValue: 20, position: null, isPenetratingAttack: false },
  { id: '5', player: 1, type: 'Artillery', maxHP: 50, hp: 50, movementRange: 1, attackRange: 6, attackValue: 50, position: null, isPenetratingAttack: true, imagePath: '/images/ballista.png', cost: 150, isPaid: false },
  { id: '6', player: 1, type: 'Mage', maxHP: 50, hp: 50, movementRange: 1, attackRange: 3, attackValue: 25, position: null, isPenetratingAttack: true, imagePath: '/images/mage.png', cost: 150, isPaid: false },

  { id: '7', player: 2, type: 'Soldier', maxHP: 50, hp: 50, movementRange: 2, attackRange: 1, attackValue: 20, position: null, isPenetratingAttack: false, imagePath: '/images/soldier.png', cost: 50, isPaid: false },
  // { id: '8', player: 2, type: 'Archer', maxHP: 80, hp: 80, movementRange: 3, attackRange: 4, attackValue: 10, position: null, isPenetratingAttack: false },
  // { id: '9', player: 2, type: 'Knight', maxHP: 200, hp: 200, movementRange: 2, attackRange: 5, attackValue: 40, position: null, isPenetratingAttack: false },
  // { id: '10', player: 2, type: 'Crossbow Ranger', maxHP: 150, hp: 150, movementRange: 3, attackRange: 4, attackValue: 20, position: null, isPenetratingAttack: false },
  { id: '11', player: 2, type: 'Artillery', maxHP: 50, hp: 50, movementRange: 1, attackRange: 6, attackValue: 50, position: null, isPenetratingAttack: true, imagePath: '/images/ballista.png', cost: 50, isPaid: false },
  { id: '12', player: 2, type: 'Mage', maxHP: 50, hp: 50, movementRange: 1, attackRange: 3, attackValue: 15, position: null, isPenetratingAttack: true, imagePath: '/images/mage.png', cost: 50, isPaid: false }
];

const initialBuildings: BuildingType[] = [
  { id: 'b1', type: 'Fort', player: 1, position: null, imagePath: '/images/fort.png', income: 50, cost: 100 },
  { id: 'b2', type: 'Castle', player: 1, position: null, imagePath: '/images/castle.png', income: 50, cost: 150 },
  { id: 'b3', type: 'Magetower', player: 1, position: null, imagePath: '/images/magetower.png', income: 50, cost: 150 },
  { id: 'b1', type: 'Fort', player: 2, position: null, imagePath: '/images/fort.png', income: 50, cost: 100 },
  { id: 'b2', type: 'Castle', player: 2, position: null, imagePath: '/images/castle.png', income: 50, cost: 150 },
  { id: 'b3', type: 'Magetower', player: 2, position: null, imagePath: '/images/magetower.png', income: 50, cost: 150 }
];


const initialTerrain: TerrainType[] = [
  { id: 't1', type: 'Water', position: null, imagePath: '/images/water.png' },
  { id: 't2', type: 'Grass', position: null, imagePath: '/images/grass.png' },
  { id: 't3', type: 'Rock', position: null, imagePath: '/images/rock.png' }
];

const createEmptyBoard = () => Array(12 * 12).fill(null);

const App: React.FC = () => {
  const [units, setUnits] = useState<UnitType[]>(initialUnits);
  const [board, setBoard] = useState<(UnitType | null)[]>(createEmptyBoard());
  const [terrainBoard, setTerrainBoard] = useState<(TerrainType | null)[]>(createEmptyBoard());
  const [buildingBoard, setBuildingBoard] = useState<(BuildingType | null)[]>(createEmptyBoard());
  const [highlightedSquares, setHighlightedSquares] = useState<number[]>([]);
  const [highlightedAttackTargets, setHighlightedAttackTargets] = useState<number[]>([]);
  const [draggingUnit, setDraggingUnit] = useState<UnitType | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<UnitType | null>(null);
  const [originalPosition, setOriginalPosition] = useState<number | null>(null);
  const [draggingTerrain, setDraggingTerrain] = useState<TerrainType | null>(null);
  const [draggingBuilding, setDraggingBuilding] = useState<BuildingType | null>(null);
  const [player1Economy, setPlayer1Economy] = useState<number>(500); // Start ekonomi för spelare 1
  const [player2Economy, setPlayer2Economy] = useState<number>(500); // Start ekonomi för spelare 2


  const handleNewUnitDragStart = (event: React.DragEvent<HTMLDivElement>, unit: UnitType) => {
    const allowedUnits = new Map<string, Set<number>>();

    buildingBoard.forEach(building => {
      if (building && building.player === unit.player) {
        const adjacentPositions = calculateAdjacentPositions(building.position!);
        switch (building.type) {
          case 'Fort':
            if (!allowedUnits.has('Soldier')) allowedUnits.set('Soldier', new Set<number>());
            if (!allowedUnits.has('Archer')) allowedUnits.set('Archer', new Set<number>());
            adjacentPositions.forEach(pos => {
              allowedUnits.get('Soldier')?.add(pos);
              allowedUnits.get('Archer')?.add(pos);
            });
            break;
          case 'Castle':
            if (!allowedUnits.has('Knight')) allowedUnits.set('Knight', new Set<number>());
            if (!allowedUnits.has('Crossbow Ranger')) allowedUnits.set('Crossbow Ranger', new Set<number>());
            if (!allowedUnits.has('Artillery')) allowedUnits.set('Artillery', new Set<number>());
            adjacentPositions.forEach(pos => {
              allowedUnits.get('Knight')?.add(pos);
              allowedUnits.get('Crossbow Ranger')?.add(pos);
              allowedUnits.get('Artillery')?.add(pos);
            });
            break;
          case 'Magetower':
            if (!allowedUnits.has('Mage')) allowedUnits.set('Mage', new Set<number>());
            adjacentPositions.forEach(pos => {
              allowedUnits.get('Mage')?.add(pos);
            });
            break;
        }
      }
    });

    if (allowedUnits.has(unit.type)) {
      const newUnit = { ...unit, id: `${unit.id}-${new Date().getTime()}`, position: null };
      event.dataTransfer.setData('unit', JSON.stringify(newUnit));
      event.dataTransfer.setData('allowedPositions', JSON.stringify(Array.from(allowedUnits.get(unit.type)!)));
      setDraggingUnit(newUnit);
    } else {
      console.log(`Cannot place unit of type ${unit.type} without the appropriate building.`);
    }
  };

  const calculateAdjacentPositions = (position: number): number[] => {
    const boardSize = 12;
    const adjacentPositions: number[] = [];

    const directions = [
      -1, 1, // left, right
      -boardSize, boardSize, // up, down
      -boardSize - 1, -boardSize + 1, // up-left, up-right
      boardSize - 1, boardSize + 1 // down-left, down-right
    ];

    for (const direction of directions) {
      const newPosition = position + direction;
      if (newPosition >= 0 && newPosition < boardSize * boardSize) {
        adjacentPositions.push(newPosition);
      }
    }

    return adjacentPositions;
  };


  const handleTerrainDragStart = (event: React.DragEvent<HTMLDivElement>, terrain: TerrainType) => {
    const newTerrain = { ...terrain, id: `${terrain.id}-${new Date().getTime()}`, position: null };
    event.dataTransfer.setData('terrain', JSON.stringify(newTerrain));
    setDraggingTerrain(newTerrain);
  };

  const handleBuildingDragStart = (event: React.DragEvent<HTMLDivElement>, building: BuildingType) => {
    const newBuilding = { ...building, id: `${building.id}-${new Date().getTime()}`, position: null };
    event.dataTransfer.setData('building', JSON.stringify(newBuilding));
    setDraggingBuilding(newBuilding);
  };

  const handleSquareDragStart = (event: React.DragEvent<HTMLDivElement>, index: number) => {
    const unit = board[index];
    if (unit) {
      event.dataTransfer.setData('unit', JSON.stringify(unit));
      setDraggingUnit(unit);

      // Spara den ursprungliga positionen
      setOriginalPosition(index);

      const possibleMoves = calculatePossibleMoves(unit.position!, unit.movementRange, board, terrainBoard, buildingBoard);
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
    const terrainData = event.dataTransfer.getData('terrain');
    const buildingData = event.dataTransfer.getData('building');

    if (unitData) {
      const unit: UnitType = JSON.parse(unitData);
      const allowedPositions: number[] = JSON.parse(event.dataTransfer.getData('allowedPositions') || '[]');

      // Kontrollera om enheten placeras första gången
      const isFirstPlacement = unit.position === null;

      if ((highlightedSquares.includes(index) || isFirstPlacement) && (unit.position !== null || allowedPositions.includes(index))) {
        const playerEconomy = unit.player === 1 ? player1Economy : player2Economy;
        const unitCost = isFirstPlacement ? unit.cost : 0;
        // Kostnad endast första gången enheten placeras

        if (buildingBoard[index] || board[index] || terrainBoard[index]) {
          console.log(`Cannot place unit on a tile with another unit, building or terrain.`);

          // Kontrollera att originalPosition inte är null innan du återställer enheten
          if (originalPosition !== null) {
            const updatedBoard = board.slice();
            updatedBoard[originalPosition] = unit;
            setBoard(updatedBoard);
          } else {
            console.log(`Original position is null, cannot restore unit to original position.`);
          }
          return;
        }

        if (playerEconomy >= unitCost) {
          const updatedUnit = { ...unit, position: index, isPaid: true }; // Sätt isPaid till true när enheten placeras första gången
          const updatedUnits = units.map(u => u.id === unit.id ? updatedUnit : u);
          const updatedBoard = board.slice();
          if (originalPosition !== null) {
            updatedBoard[originalPosition] = null; // Ta bort från ursprunglig position
          }// Ta bort från ursprunglig position
          updatedBoard[index] = updatedUnit;
          setUnits(updatedUnits);
          setBoard(updatedBoard);
          setHighlightedSquares([]);
          setDraggingUnit(null);

          if (isFirstPlacement) {
            if (unit.player === 1) {
              setPlayer1Economy(player1Economy - unit.cost);
            } else {
              setPlayer2Economy(player2Economy - unit.cost);
            }
          }
        } else {
          console.log(`Not enough economy to place ${unit.type}.`);
          // Återställ till ursprunglig position
          if (originalPosition !== null) {
            const updatedBoard = board.slice();
            updatedBoard[originalPosition] = unit;
            setBoard(updatedBoard);
          }
        }
      } else {
        // Återställ till ursprunglig position
        if (originalPosition !== null) {
          const updatedBoard = board.slice();
          updatedBoard[originalPosition] = unit;
          setBoard(updatedBoard);
        }
      }
    } else if (terrainData) {
      const terrain: TerrainType = JSON.parse(terrainData);

      if (buildingBoard[index] || board[index] || terrainBoard[index]) {
        console.log(`Cannot place terrain on a tile with another unit, building or terrain.`);
        return;
      }

      const updatedTerrain = { ...terrain, position: index };
      const updatedTerrainBoard = terrainBoard.slice();
      updatedTerrainBoard[index] = updatedTerrain;
      setTerrainBoard(updatedTerrainBoard);
      setDraggingTerrain(null);
    } else if (buildingData) {
      const building: BuildingType = JSON.parse(buildingData);
      const playerEconomy = building.player === 1 ? player1Economy : player2Economy;

      if (buildingBoard[index] || board[index] || terrainBoard[index]) {
        console.log(`Cannot place building on a tile with another unit, building or terrain.`);
        return;
      }

      if (playerEconomy >= building.cost) {
        const updatedBuilding = { ...building, position: index };
        const updatedBuildingBoard = buildingBoard.slice();
        updatedBuildingBoard[index] = updatedBuilding;
        setBuildingBoard(updatedBuildingBoard);
        setDraggingBuilding(null);

        if (building.player === 1) {
          setPlayer1Economy(player1Economy - building.cost);
        } else {
          setPlayer2Economy(player2Economy - building.cost);
        }
      } else {
        console.log(`Not enough economy to place ${building.type}.`);
      }
    }
  };



  const handleDragOver = (event: React.DragEvent<HTMLDivElement>, index: number) => {
    event.preventDefault();
    if (draggingUnit && draggingUnit.position !== null) {
      const possibleMoves = calculatePossibleMoves(draggingUnit.position, draggingUnit.movementRange, board, terrainBoard, buildingBoard);
      if (possibleMoves.includes(index)) {
        // Temporärt flytta enheten till den nya rutan under dragningen
        const updatedBoard = board.slice();
        if (originalPosition !== null) {
          updatedBoard[originalPosition] = null; // Clear the old position if the unit was already on the board
        }
        updatedBoard[index] = draggingUnit; // Sätt enheten på den nya positionen

        let possibleAttackTargets: number[];
        if (draggingUnit.attackRange === 1) {
          possibleAttackTargets = calculatePossibleMeleeAttackTargets(index, updatedBoard);
        } else if (draggingUnit.type === 'Artillery') {
          possibleAttackTargets = calculatePossiblePenetratingHorizontalVerticalDistanceAttackTargets(index, draggingUnit.attackRange, updatedBoard);
        } else if (draggingUnit.isPenetratingAttack || draggingUnit.type === 'Mage') {
          const isHealing = draggingUnit.type === 'Mage';
          possibleAttackTargets = calculatePossiblePenetratingDistanceAttackTargets(index, draggingUnit.attackRange, updatedBoard, isHealing);
        } else {
          possibleAttackTargets = calculatePossibleNonPenetratingDistanceAttackTargets(index, draggingUnit.attackRange, updatedBoard, terrainBoard, buildingBoard);
        }
        setHighlightedAttackTargets(possibleAttackTargets);
      }
      else {
        setHighlightedAttackTargets([]);
      }
    }
  };





  const handleMouseOver = (unit: UnitType) => {
    if (unit.position !== null && !draggingUnit && !selectedUnit) {
      const possibleMoves = calculatePossibleMoves(unit.position, unit.movementRange, board, terrainBoard, buildingBoard);
      let possibleAttackTargets: number[];

      if (unit.attackRange === 1) {
        possibleAttackTargets = calculatePossibleMeleeAttackTargets(unit.position, board);
      } else if (unit.type === 'Artillery') {
        possibleAttackTargets = calculatePossiblePenetratingHorizontalVerticalDistanceAttackTargets(unit.position, unit.attackRange, board);
      } else if (unit.isPenetratingAttack || unit.type === 'Mage') {
        const isHealing = unit.type === 'Mage';
        possibleAttackTargets = calculatePossiblePenetratingDistanceAttackTargets(unit.position, unit.attackRange, board, isHealing);
      } else {
        possibleAttackTargets = calculatePossibleNonPenetratingDistanceAttackTargets(unit.position, unit.attackRange, board, terrainBoard, buildingBoard);
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
      // Välj en enhet för attack eller healing, oavsett spelare
      setSelectedUnit(unit);
      // Behåll de nuvarande highlightade målen
    } else if (selectedUnit && highlightedAttackTargets.includes(unit.position!)) {
      // Kontrollera om den valda enheten är en Mage och om målenheten tillhör samma spelare
      if (selectedUnit.type === 'Mage' && selectedUnit.player === unit.player) {
        // Utför healing
        unit.hp = Math.min(unit.maxHP, unit.hp + selectedUnit.attackValue);
        console.log(`Healing successful! ${selectedUnit.id} healed ${unit.id} for ${selectedUnit.attackValue} HP.`);
        console.log(`${unit.id} has ${unit.hp} HP now.`);

        // Återställ tillstånd efter healing
        setSelectedUnit(null);
        setHighlightedSquares([]);
        setHighlightedAttackTargets([]);
      } else if (selectedUnit.player !== unit.player) {
        // Utför attack
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
        console.log("Cannot attack or heal your own units.");
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

  const generateIncome = (player: number) => {
    const playerBuildings = buildingBoard.filter(building => building?.player === player);
    const income = playerBuildings.reduce((total, building) => total + (building?.income || 0), 0);

    if (player === 1) {
      setPlayer1Economy(player1Economy + income);
    } else {
      setPlayer2Economy(player2Economy + income);
    }
  };


  return (
    <div className="game">
      <div className="units player1-units">
        {units.filter(unit => unit.player === 1).map(unit => (
          <DraggableUnit key={unit.id} unit={unit} onDragStart={handleNewUnitDragStart} />
        ))}
        {initialBuildings.filter(building => building.player === 1).map(building => (
          <div
            key={building.id}
            className="building-tile"
            draggable
            onDragStart={(event) => handleBuildingDragStart(event, building)}
          >
            <img src={building.imagePath} alt={building.type} className="building-image" />
          </div>
        ))}
        <button onClick={() => generateIncome(1)}>Collect Income</button>
        <div>Economy: {player1Economy}</div>
      </div>
      <div className="terrain">
        {initialTerrain.map(tile => (
          <div
            key={tile.id}
            className="terrain-tile"
            draggable
            onDragStart={(event) => handleTerrainDragStart(event, tile)}
          >
            <img src={tile.imagePath} alt={tile.type} className="terrain-image" />
          </div>
        ))}
      </div>
      <div className="board-container">
        <Board
          board={board}
          terrainBoard={terrainBoard}
          buildingBoard={buildingBoard}
          onSquareClick={handleSquareClick}
          onSquareDrop={handleDrop}
          onSquareDragOver={handleDragOver}
          onMouseOverUnit={handleMouseOver}
          onMouseOutUnit={handleMouseOut}
          onSquareDragStart={handleSquareDragStart}
          highlightedSquares={highlightedSquares}
          highlightedAttackTargets={highlightedAttackTargets}
          onUnitClick={handleUnitClick}
        />
      </div>
      <div className="units player2-units">
        {units.filter(unit => unit.player === 2).map(unit => (
          <DraggableUnit key={unit.id} unit={unit} onDragStart={handleNewUnitDragStart} />
        ))}
        {initialBuildings.filter(building => building.player === 2).map(building => (
          <div
            key={building.id}
            className="building-tile"
            draggable
            onDragStart={(event) => handleBuildingDragStart(event, building)}
          >
            <img src={building.imagePath} alt={building.type} className="building-image" />
          </div>
        ))}
        <button onClick={() => generateIncome(2)}>Collect Income</button>
        <div>Economy: {player2Economy}</div>
      </div>
    </div>
  );

}

export default App;
