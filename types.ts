
export enum LetterState {
  INITIAL = 'initial', // Not yet guessed, default for keyboard
  CORRECT = 'correct', // Green tile, green key
  PRESENT = 'present', // Yellow tile, yellow key
  ABSENT = 'absent',   // Gray tile, gray key
  EMPTY = 'empty',     // Empty tile before guessing
}

export interface EvaluatedLetter {
  char: string;
  state: LetterState;
}

export type EvaluatedGuessRow = EvaluatedLetter[];

export interface LetterStatusMap {
  [key: string]: LetterState;
}

export enum GameStatus {
  SETTINGS = 'settings',
  PLAYING = 'playing',
  WON = 'won',
  LOST = 'lost',
}
    