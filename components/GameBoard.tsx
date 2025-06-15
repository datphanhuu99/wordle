import React from 'react';
import { EvaluatedGuessRow, LetterState } from '../types';

interface GameBoardProps {
  guesses: EvaluatedGuessRow[];
  currentGuess: string;
  wordLength: number;
  maxGuesses: number;
  isRevealing: boolean;
  currentAttempt: number;
}

const getTileBgColor = (state: LetterState): string => {
  switch (state) {
    case LetterState.CORRECT:
      return 'bg-emerald-500 border-emerald-500 text-white'; // Updated color
    case LetterState.PRESENT:
      return 'bg-yellow-500 border-yellow-500 text-white'; // Updated color (or amber-500)
    case LetterState.ABSENT:
      return 'bg-slate-700 border-slate-700 text-slate-300'; // Updated text color for better contrast
    case LetterState.EMPTY:
    default:
      return 'bg-slate-800 border-slate-600';
  }
};

const GameBoard: React.FC<GameBoardProps> = ({ guesses, currentGuess, wordLength, maxGuesses, isRevealing, currentAttempt }) => {
  const emptyRowsCount = maxGuesses - guesses.length - 1; // -1 for the current guess row if not submitted

  return (
    <div className="grid gap-1.5 p-2 justify-center">
      {guesses.map((guess, rowIndex) => (
        <div key={`guess-${rowIndex}`} className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${wordLength}, minmax(0, 1fr))` }}>
          {guess.map((letter, colIndex) => (
            <div
              key={`guess-${rowIndex}-${colIndex}`}
              className={`tile-reveal flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 border-2 text-2xl sm:text-3xl font-bold uppercase rounded-md shadow-md ${getTileBgColor(letter.state)}`} // Added rounded-md, shadow-md
              style={{ animationDelay: isRevealing && rowIndex === currentAttempt -1 ? `${colIndex * 100}ms` : '0ms' }}
            >
              {letter.char}
            </div>
          ))}
        </div>
      ))}

      {guesses.length < maxGuesses && (
        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${wordLength}, minmax(0, 1fr))` }}>
          {Array.from({ length: wordLength }).map((_, colIndex) => (
            <div
              key={`current-${colIndex}`}
              className={`flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 border-2 text-2xl sm:text-3xl font-bold uppercase rounded-md shadow-md ${currentGuess[colIndex] ? 'border-slate-500' : 'border-slate-600'} bg-slate-800`} // Added rounded-md, shadow-md
            >
              {currentGuess[colIndex] || ''}
            </div>
          ))}
        </div>
      )}

      {Array.from({ length: Math.max(0, emptyRowsCount) }).map((_, rowIndex) => (
        <div key={`empty-${rowIndex}`} className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${wordLength}, minmax(0, 1fr))` }}>
          {Array.from({ length: wordLength }).map((_, colIndex) => (
            <div
              key={`empty-${rowIndex}-${colIndex}`}
              className="flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 border-2 border-slate-600 bg-slate-800 rounded-md shadow-md" // Added rounded-md, shadow-md
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default GameBoard;