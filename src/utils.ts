import { Unit } from './types'; 

export const calculatePossibleMoves = (position: number, range: number, board: (Unit | null)[]): number[] => {
  const possibleMoves: Set<number> = new Set();
  const boardSize = 12;

  const directions = [
    -1, 1, // left, right
    -boardSize, boardSize, // up, down
    -boardSize - 1, -boardSize + 1, // up-left, up-right
    boardSize - 1, boardSize + 1 // down-left, down-right
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
        const newCol = newPosition % boardSize;

        // Kontrollera om rörelsen korsar kolumngränsen
        if (Math.abs(currentCol - newCol) > 1 && Math.abs(currentCol - newCol) !== (boardSize - 1)) {
          continue; // Om skillnaden i kolumnindex är större än 1, hoppa över denna iteration
        }

        if (
          newPosition >= 0 &&
          newPosition < boardSize * boardSize &&
          !possibleMoves.has(newPosition) &&
          !board[newPosition] // Kontrollera om rutan redan är upptagen
        ) {
          queue.push([newPosition, currentRange + 1]);
          possibleMoves.add(newPosition);
        }
      }
    }
  }

  return Array.from(possibleMoves);
};
