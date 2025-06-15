import React, { useState, useEffect, useCallback } from 'react';
import { DEFAULT_MAX_GUESSES, MIN_WORD_LENGTH, MAX_WORD_LENGTH, MIN_MAX_GUESSES, MAX_MAX_GUESSES, VIETNAMESE_ALPHABET_BASIC, PREPARED_DEFAULT_WORD_LIST_STRING } from '../constants';
import { parseWordList as utilityParseWordList } from '../utils/wordUtils';

interface SettingsFormProps {
  onStartGame: (wordList: string[], maxGuesses: number) => void;
  initialWordList?: string; 
  initialMaxGuesses?: number;
}

const VALID_WORD_CHAR_REGEX = new RegExp(`^[${VIETNAMESE_ALPHABET_BASIC}A-Z]+$`);

const SettingsForm: React.FC<SettingsFormProps> = ({ 
    onStartGame, 
    initialWordList = PREPARED_DEFAULT_WORD_LIST_STRING, 
    initialMaxGuesses = DEFAULT_MAX_GUESSES 
}) => {
  const [wordListInput, setWordListInput] = useState(initialWordList);
  const [processedWords, setProcessedWords] = useState<string[]>([]);
  const [maxGuesses, setMaxGuesses] = useState(initialMaxGuesses);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    setWordListInput(initialWordList);
    setMaxGuesses(initialMaxGuesses);
  }, [initialWordList, initialMaxGuesses]);

  useEffect(() => {
    const parsedRawWords = utilityParseWordList(wordListInput);
    let currentInfo: string | null = null;
    let currentError: string | null = null;

    if (wordListInput.trim() === '') {
      setProcessedWords([]);
      currentError = "Word list cannot be empty. Please enter words or load defaults.";
    } else {
      let invalidCharFound = false;
      let invalidLengthFound = false;

      const validWords = parsedRawWords.filter(word => {
        const isLengthValid = word.length >= MIN_WORD_LENGTH && word.length <= MAX_WORD_LENGTH;
        const hasValidChars = VALID_WORD_CHAR_REGEX.test(word);
        
        if (!isLengthValid) invalidLengthFound = true;
        if (!hasValidChars) invalidCharFound = true;
        
        return isLengthValid && hasValidChars;
      });

      if (parsedRawWords.length > 0 && validWords.length === 0) {
        let specificError = `Each word must be ${MIN_WORD_LENGTH}-${MAX_WORD_LENGTH} characters long`;
        if (invalidCharFound && invalidLengthFound) {
          specificError += ` and contain only allowed letters (A-Z, ${VIETNAMESE_ALPHABET_BASIC.substring(0,3)}...).`;
        } else if (invalidCharFound) {
          specificError = `Each word must contain only allowed letters (A-Z, ${VIETNAMESE_ALPHABET_BASIC.substring(0,3)}...).`;
        }
        currentError = `All words provided are invalid. ${specificError}`;
        setProcessedWords([]);
      } else if (parsedRawWords.length > 0 && validWords.length < parsedRawWords.length) {
        let reason = "length or contained invalid characters";
        if (invalidCharFound && !invalidLengthFound) reason = "contained invalid characters";
        else if (!invalidCharFound && invalidLengthFound) reason = "length";
        
        currentInfo = `Some words were filtered out due to ${reason}. Using ${validWords.length} valid word(s).`;
        setProcessedWords(validWords);
      } else if (validWords.length > 0) {
        setProcessedWords(validWords);
        if (wordListInput === PREPARED_DEFAULT_WORD_LIST_STRING) {
            currentInfo = `Loaded ${validWords.length} default words.`;
        } else {
            currentInfo = `Using ${validWords.length} custom valid word(s).`;
        }
      } else {
        setProcessedWords([]);
        currentError = "No valid words found in the list.";
      }
    }
    setError(currentError);
    setInfo(currentError ? null : currentInfo);

  }, [wordListInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (processedWords.length === 0) {
      if (wordListInput.trim() === '') {
        setError("Please provide a list of words or load defaults.");
      } else {
        let specificError = `Each word must be between ${MIN_WORD_LENGTH} and ${MAX_WORD_LENGTH} characters long and contain only allowed letters.`;
        setError(`No valid words found. ${specificError}`);
      }
      setInfo(null);
      return;
    }
    onStartGame(processedWords, maxGuesses);
  };

  const handleLoadDefaults = () => {
    setWordListInput(PREPARED_DEFAULT_WORD_LIST_STRING);
  };

  return (
    <div className="bg-slate-800 p-6 sm:p-8 rounded-lg shadow-xl max-w-lg mx-auto w-full">
      <h2 className="text-3xl font-bold text-emerald-400 mb-6 text-center">Game Settings</h2> {/* Updated text color */}
      {error && <p className="p-3 rounded-md mb-4 text-sm bg-red-700/50 text-red-200">{error}</p>} {/* Updated styles */}
      {info && !error && <p className="p-3 rounded-md mb-4 text-sm bg-emerald-700/50 text-emerald-200">{info}</p>} {/* Updated styles */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="wordList" className="block text-sm font-medium text-slate-300 mb-1">
            Custom Word List
          </label>
          <textarea
            id="wordList"
            value={wordListInput}
            onChange={(e) => setWordListInput(e.target.value)}
            rows={8}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-slate-100 placeholder-slate-400" // Updated focus styles
            placeholder="Enter words separated by spaces, commas, or new lines..."
            aria-describedby="wordListHelp"
            spellCheck={true}
          />
          <div className="flex justify-between items-center mt-1">
            <p id="wordListHelp" className="text-xs text-slate-400">
              {MIN_WORD_LENGTH}-{MAX_WORD_LENGTH} chars, A-Z, {VIETNAMESE_ALPHABET_BASIC.substring(0,3)}... Duplicates removed.
            </p>
            <button 
                type="button" 
                onClick={handleLoadDefaults}
                className="text-xs text-emerald-400 hover:text-emerald-300 underline" // Updated text color
            >
                Load Default Words
            </button>
          </div>
        </div>
        
        <div>
          <label htmlFor="maxGuesses" className="block text-sm font-medium text-slate-300 mb-1">
            Max Guesses ({MIN_MAX_GUESSES}-{MAX_MAX_GUESSES})
          </label>
          <input
            type="number"
            id="maxGuesses"
            value={maxGuesses}
            onChange={(e) => setMaxGuesses(Math.max(MIN_MAX_GUESSES, Math.min(MAX_MAX_GUESSES, parseInt(e.target.value, 10) || MIN_MAX_GUESSES)))}
            min={MIN_MAX_GUESSES}
            max={MAX_MAX_GUESSES}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-slate-100" // Updated focus styles
          />
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-md shadow-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50" // Updated bg color
          disabled={processedWords.length === 0} 
        >
          Start Game
        </button>
      </form>
    </div>
  );
};

export default SettingsForm;