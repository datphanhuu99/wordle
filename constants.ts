
import { DEFAULT_WORDS as IMPORTED_DEFAULT_WORDS } from './data/defaultWordList';

export const DEFAULT_WORD_LENGTH = 5;
export const MIN_WORD_LENGTH = 3;
export const MAX_WORD_LENGTH = 10;
export const DEFAULT_MAX_GUESSES = 6;
export const MIN_MAX_GUESSES = 3;
export const MAX_MAX_GUESSES = 10;

export const KEYBOARD_LAYOUT = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
];

export const ENTER_KEY = "ENTER";
export const BACKSPACE_KEY = "BACKSPACE";

export const VIETNAMESE_ALPHABET_BASIC = "AĂÂBCDĐEÊGHIKLMNOÔƠPQRSTUƯVXY"; 

// Filter and prepare the default word list according to game rules
const VALID_WORD_CHAR_REGEX_FOR_DEFAULTS = new RegExp(`^[${VIETNAMESE_ALPHABET_BASIC}A-Z]+$`);
export const DEFAULT_WORDS_VALIDATED: string[] = IMPORTED_DEFAULT_WORDS
  .map(word => word.toUpperCase().trim())
  .filter(word => 
    word.length >= MIN_WORD_LENGTH &&
    word.length <= MAX_WORD_LENGTH &&
    VALID_WORD_CHAR_REGEX_FOR_DEFAULTS.test(word)
  )
  .filter((word, index, self) => self.indexOf(word) === index); // Ensure uniqueness

export const PREPARED_DEFAULT_WORD_LIST_STRING = DEFAULT_WORDS_VALIDATED.join('\n'); // Corrected here
