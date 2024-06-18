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
  cost: number;
  isPaid: boolean;
}

export interface Terrain {
  id: string;
  type: 'Grass' | 'Rock' | 'Water';
  position: number | null;
  imagePath: string;
}

export interface Building {
  id: string;
  type: 'Fort' | 'Castle' | 'Magetower';
  player: number;
  position: number | null; // Position on the board, null if not placed yet
  imagePath: string; // Path to the building's image
  income: number;
  cost: number;
}


  