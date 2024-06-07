import { Unit } from './types';

export const calculatePossibleMoves = (position: number, range: number, board: (Unit | null)[]): number[] => {
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
          !board[newPosition]
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

export const calculatePossibleAttackTargets = (position: number, board: (Unit | null)[]): number[] => {
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

