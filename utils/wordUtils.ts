
import { LetterState, EvaluatedLetter } from '../types';

export const evaluateGuess = (guess: string, secretWord: string): EvaluatedLetter[] => {
  const result: EvaluatedLetter[] = [];
  const guessUpper = guess.toUpperCase();
  const secretUpper = secretWord.toUpperCase();
  const wordLength = secretUpper.length;

  const secretLetterCounts: { [key: string]: number } = {};
  for (const letter of secretUpper) {
    secretLetterCounts[letter] = (secretLetterCounts[letter] || 0) + 1;
  }

  // Initialize result with all letters marked as absent initially
  for (let i = 0; i < wordLength; i++) {
    result.push({ char: guessUpper[i], state: LetterState.ABSENT });
  }

  // First pass: Check for correct letters (green)
  for (let i = 0; i < wordLength; i++) {
    if (guessUpper[i] === secretUpper[i]) {
      result[i] = { char: guessUpper[i], state: LetterState.CORRECT };
      secretLetterCounts[guessUpper[i]]--;
    }
  }

  // Second pass: Check for present letters (yellow)
  for (let i = 0; i < wordLength; i++) {
    if (result[i].state !== LetterState.CORRECT) { // Only check if not already correct
      if (secretUpper.includes(guessUpper[i]) && secretLetterCounts[guessUpper[i]] > 0) {
        result[i] = { char: guessUpper[i], state: LetterState.PRESENT };
        secretLetterCounts[guessUpper[i]]--;
      }
    }
  }
  return result;
};

export const parseWordList = (rawList: string): string[] => {
  return rawList
    .split(/[\s,;\n]+/) // Split by spaces, commas, semicolons, or newlines
    .map(word => word.trim().toUpperCase())
    .filter(word => word.length > 0)
    .filter((word, index, self) => self.indexOf(word) === index); // Unique words
};
    