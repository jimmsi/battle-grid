// src/types.ts
export interface Unit {
    id: string;
    player: number;
    maxHP: number;
    hp: number;
    movementRange: number;
    attackRange: number;
    attackValue: number;
    position: number | null; // Position on the board, null if not placed yet
  }
  