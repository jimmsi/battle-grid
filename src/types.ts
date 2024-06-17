export interface Unit {
  id: string;
  player: number;
  maxHP: number;
  hp: number;
  movementRange: number;
  attackRange: number;
  attackValue: number;
  position: number | null; // Position on the board, null if not placed yet
  isPenetratingAttack: boolean; // Ny variabel för att ange om distansattacken är genomträngande
  type: string;
  imagePath: string;
}

export interface Terrain {
  id: string;
  type: 'grass' | 'rock' | 'water';
  position: number | null;
  imagePath: string;
}


  