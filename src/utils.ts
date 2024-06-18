import { Unit, Terrain, Building } from './types';

export const calculatePossibleMoves = (
  position: number,
  range: number,
  board: (Unit | null)[],
  terrainBoard: (Terrain | null)[],
  buildingBoard: (Building | null)[]
): number[] => {
  const possibleMoves: Set<number> = new Set();
  const boardSize = 12;

  // Endast horisontella och vertikala rörelser
  const directions = [
    -1, 1, // left, right
    -boardSize, boardSize // up, down
  ];

  const queue: [number, number][] = [[position, 0]];
  possibleMoves.add(position);

  while (queue.length > 0) {
    const [currentPosition, currentRange] = queue.shift()!;
    if (currentRange < range) {
      for (const direction of directions) {
        const newPosition = currentPosition + direction; // Den nya rutan som testas mot villkoren

        // Beräkna kolumnindex för nuvarande och nya rutan
        const currentCol = currentPosition % boardSize;

        if (
          newPosition >= 0 &&
          newPosition < boardSize * boardSize &&
          !possibleMoves.has(newPosition) &&
          !board[newPosition] &&
          (!terrainBoard[newPosition] || (terrainBoard[newPosition]?.type !== 'Water' && terrainBoard[newPosition]?.type !== 'Rock')) &&
          !buildingBoard[newPosition] // betrakta byggnader som hinder
        ) {
          if (
            (direction === -1 && currentCol > 0) || // left, ensuring not moving left from first column
            (direction === 1 && currentCol < boardSize - 1) || // right, ensuring not moving right from last column
            (direction === -boardSize) || // up
            (direction === boardSize) // down
          ) {
            queue.push([newPosition, currentRange + 1]);
            possibleMoves.add(newPosition);
          }
        }
      }
    }
  }

  return Array.from(possibleMoves);
};


export const calculatePossibleMeleeAttackTargets = (position: number, board: (Unit | null)[]): number[] => {
  const possibleTargets: number[] = [];
  const boardSize = 12;

  // Endast horisontella och vertikala grannar
  const directions = [
    -1, 1, // left, right
    -boardSize, boardSize // up, down
  ];

  for (const direction of directions) {
    const newPosition = position + direction; // Den nya rutan som testas mot villkoren

    // Beräkna kolumnindex för nuvarande och nya rutan
    const currentCol = position % boardSize;

    // Kontrollera om rörelsen korsar kolumngränsen
    if (
      newPosition >= 0 &&
      newPosition < boardSize * boardSize &&
      (direction === -1 && currentCol > 0 || // left, ensuring not moving left from first column
        direction === 1 && currentCol < boardSize - 1 || // right, ensuring not moving right from last column
        direction === -boardSize || // up
        direction === boardSize) // down
    ) {
      const targetUnit = board[newPosition];
      if (targetUnit && targetUnit.player !== board[position]?.player) { // Kontrollera om det är en fiendeenhet
        possibleTargets.push(newPosition);
      }
    }
  }

  return possibleTargets;
};

export const calculatePossiblePenetratingDistanceAttackTargets = (
  position: number,
  attackRange: number,
  board: (Unit | null)[],
  isHealing: boolean = false // Lägg till parameter för healing
): number[] => {
  const possibleTargets: number[] = [];
  const boardSize = 12;

  const startX = position % boardSize;
  const startY = Math.floor(position / boardSize);

  for (let x = -attackRange; x <= attackRange; x++) {
    for (let y = -attackRange; y <= attackRange; y++) {
      const targetX = startX + x;
      const targetY = startY + y;
      const targetPosition = targetY * boardSize + targetX;

      if (
        targetX >= 0 && targetX < boardSize &&
        targetY >= 0 && targetY < boardSize &&
        targetPosition !== position // exclude the unit's own position
      ) {
        const distance = Math.sqrt(x * x + y * y); // Euclidean distance
        if (distance <= attackRange) {
          // Exkludera närmaste grannar (en ruta ifrån i alla riktningar)
          if (!(Math.abs(x) <= 1 && Math.abs(y) <= 1)) {
            const targetUnit = board[targetPosition];
            if (isHealing) {
              // Om vi utför healing, inkludera egna enheter
              if (targetUnit && targetUnit.player === board[position]?.player) {
                possibleTargets.push(targetPosition);
              }
            } else {
              // Om vi utför en attack, inkludera fiendenheter
              if (targetUnit && targetUnit.player !== board[position]?.player) {
                possibleTargets.push(targetPosition);
              }
            }
          }
        }
      }
    }
  }

  return possibleTargets;
};

export const calculatePossiblePenetratingHorizontalVerticalDistanceAttackTargets = (
  position: number,
  attackRange: number,
  board: (Unit | null)[],
): number[] => {
  const possibleTargets: number[] = [];
  const boardSize = 12;

  const startX = position % boardSize;
  const startY = Math.floor(position / boardSize);

  for (let i = -attackRange; i <= attackRange; i++) {
    // Horisontellt
    if (i !== 0) { // Exkludera den egna rutan
      const targetX = startX + i;
      const targetY = startY;
      const targetPosition = targetY * boardSize + targetX;

      if (
        targetX >= 0 && targetX < boardSize &&
        targetPosition !== position && // exclude the unit's own position
        Math.abs(i) > 1 // Exkludera närmaste grannar
      ) {
        const targetUnit = board[targetPosition];

        // Om vi utför en attack, inkludera fiendenheter
        if (targetUnit && targetUnit.player !== board[position]?.player) {
          possibleTargets.push(targetPosition);
        }

      }
    }

    // Vertikalt
    if (i !== 0) { // Exkludera den egna rutan
      const targetX = startX;
      const targetY = startY + i;
      const targetPosition = targetY * boardSize + targetX;

      if (
        targetY >= 0 && targetY < boardSize &&
        targetPosition !== position && // exclude the unit's own position
        Math.abs(i) > 1 // Exkludera närmaste grannar
      ) {
        const targetUnit = board[targetPosition];
        // Om vi utför en attack, inkludera fiendenheter
        if (targetUnit && targetUnit.player !== board[position]?.player) {
          possibleTargets.push(targetPosition);
        }
      }
    }
  }

  return possibleTargets;
};



export const calculatePossibleNonPenetratingDistanceAttackTargets = (
  position: number,
  attackRange: number,
  board: (Unit | null)[],
  terrainBoard: (Terrain | null)[],
  buildingBoard: (Building | null)[]
): number[] => {
  const possibleTargets: number[] = [];
  const boardSize = 12;

  const startX = position % boardSize;
  const startY = Math.floor(position / boardSize);

  for (let x = -attackRange; x <= attackRange; x++) {
    for (let y = -attackRange; y <= attackRange; y++) {
      const targetX = startX + x;
      const targetY = startY + y;
      const targetPosition = targetY * boardSize + targetX;

      if (
        targetX >= 0 && targetX < boardSize &&
        targetY >= 0 && targetY < boardSize &&
        targetPosition !== position // exclude the unit's own position
      ) {
        const distance = Math.sqrt(x * x + y * y); // Euclidean distance
        if (distance <= attackRange) {
          let isBlocked = false;
          let dx = Math.abs(targetX - startX);
          let dy = Math.abs(targetY - startY);
          let sx = startX < targetX ? 1 : -1;
          let sy = startY < targetY ? 1 : -1;
          let err = dx - dy;

          let checkX = startX;
          let checkY = startY;

          while (checkX !== targetX || checkY !== targetY) {
            const e2 = err * 2;
            if (e2 > -dy) {
              err -= dy;
              checkX += sx;
            }
            if (e2 < dx) {
              err += dx;
              checkY += sy;
            }

            if (checkX === targetX && checkY === targetY) break; // reached the target

            const checkPosition = checkY * boardSize + checkX;
            if (board[checkPosition] ||
              (terrainBoard[checkPosition] && terrainBoard[checkPosition]?.type === 'Rock') ||
              buildingBoard[checkPosition]) {
              isBlocked = true;
              break;
            }
          }

          if (!isBlocked) {
            const targetUnit = board[targetPosition];
            if (targetUnit && targetUnit.player !== board[position]?.player) {
              possibleTargets.push(targetPosition);
            }
          }
        }
      }
    }
  }

  return possibleTargets;
};





