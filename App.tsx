import React, { useState, useEffect, useCallback } from 'react';
import GameBoard from './components/GameBoard';
import Keyboard from './components/Keyboard';
import Modal from './components/Modal';
import SettingsForm from './components/SettingsForm';
import { GameStatus, LetterState, LetterStatusMap, EvaluatedGuessRow } from './types';
import { evaluateGuess } from './utils/wordUtils'; 
import { ENTER_KEY, BACKSPACE_KEY, DEFAULT_MAX_GUESSES, KEYBOARD_LAYOUT, MIN_WORD_LENGTH, VIETNAMESE_ALPHABET_BASIC, PREPARED_DEFAULT_WORD_LIST_STRING } from './constants';

const VALID_KEY_PRESS_REGEX = new RegExp(`^[${VIETNAMESE_ALPHABET_BASIC}A-Z]$`, 'i');

const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.SETTINGS);
  const [wordList, setWordList] = useState<string[]>([]);
  const [secretWord, setSecretWord] = useState<string>('');
  const [wordLength, setWordLength] = useState<number>(MIN_WORD_LENGTH); 
  const [maxGuesses, setMaxGuesses] = useState<number>(DEFAULT_MAX_GUESSES);
  
  const [guesses, setGuesses] = useState<EvaluatedGuessRow[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [letterStatuses, setLetterStatuses] = useState<LetterStatusMap>({});
  
  const [notification, setNotification] = useState<string | null>(null);
  const [isRevealing, setIsRevealing] = useState<boolean>(false);

  const [initialSettings, setInitialSettings] = useState({
    wordList: PREPARED_DEFAULT_WORD_LIST_STRING, 
    maxGuesses: DEFAULT_MAX_GUESSES,
  });

  const [phonetic, setPhonetic] = useState<string | null>(null);
  const [meaning, setMeaning] = useState<string | null>(null);
  const [wordInfoLoading, setWordInfoLoading] = useState<boolean>(false);
  const [wordInfoError, setWordInfoError] = useState<string | null>(null);

  const fetchWordInfo = useCallback(async (word: string) => {
    if (!word) return;
    setWordInfoLoading(true);
    setPhonetic(null);
    setMeaning(null);
    setWordInfoError(null);
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Definition not found for "${word}". The API might not have all words, especially proper nouns or very specific terms.`);
        }
        throw new Error(`API error: ${response.statusText}`);
      }
      const data = await response.json();
      if (data && data.length > 0) {
        const firstEntry = data[0];
        const phoneticData = firstEntry.phonetics?.find((p: any) => p.text);
        setPhonetic(phoneticData?.text || null);
        const firstMeaningData = firstEntry.meanings?.[0];
        const firstDefinitionData = firstMeaningData?.definitions?.[0]?.definition;
        setMeaning(firstDefinitionData || "No definition found in API response.");
      } else {
        setMeaning("No definition details found in API response.");
      }
    } catch (error: any) {
      console.error("Error fetching word info:", error);
      setWordInfoError(error.message || "Failed to load word information.");
    } finally {
      setWordInfoLoading(false);
    }
  }, []);

  const clearWordInfo = useCallback(() => {
    setPhonetic(null);
    setMeaning(null);
    setWordInfoError(null);
    setWordInfoLoading(false);
  }, []);

  const resetGameState = useCallback(() => {
    if (wordList.length === 0) {
      console.error("Word list is empty. Returning to settings.");
      setGameStatus(GameStatus.SETTINGS); 
      setNotification("No valid words to play with. Please check settings.");
      return;
    }

    clearWordInfo();
    const newSecretWord = wordList[Math.floor(Math.random() * wordList.length)];
    setSecretWord(newSecretWord);
    setWordLength(newSecretWord.length); 

    setGuesses([]);
    setCurrentGuess('');
    const initialStatuses: LetterStatusMap = {};
    KEYBOARD_LAYOUT.flat().forEach(key => {
      if (key !== ENTER_KEY && key !== BACKSPACE_KEY) {
        initialStatuses[key.toUpperCase()] = LetterState.INITIAL;
      }
    });
    setLetterStatuses(initialStatuses);
    setNotification(null); 
  }, [wordList, clearWordInfo]);

  const handleStartGame = useCallback((newWordList: string[], newMaxGuesses: number) => {
    setInitialSettings({ 
      wordList: newWordList.join('\n'), 
      maxGuesses: newMaxGuesses 
    });
    
    setWordList(newWordList);
    setMaxGuesses(newMaxGuesses);
    setGameStatus(GameStatus.PLAYING);
  }, []);

  useEffect(() => {
    if (gameStatus === GameStatus.PLAYING) { 
      resetGameState();
    } else if ((gameStatus === GameStatus.WON || gameStatus === GameStatus.LOST) && secretWord) {
      fetchWordInfo(secretWord);
    }
  }, [gameStatus, resetGameState, secretWord, fetchWordInfo]);

  const showNotification = (message: string, duration: number = 2000) => {
    setNotification(message);
    setTimeout(() => setNotification(null), duration);
  };

  const processSubmit = useCallback(() => {
    if (currentGuess.length !== wordLength) {
      showNotification(`Word must be ${wordLength} letters long.`);
      return;
    }
    
    setIsRevealing(true);
    const evaluatedGuess = evaluateGuess(currentGuess, secretWord);
    
    setTimeout(() => {
        setGuesses(prev => [...prev, evaluatedGuess]);
        
        const newLetterStatuses = { ...letterStatuses };
        evaluatedGuess.forEach(letter => {
          const charUpper = letter.char.toUpperCase();
          if (letter.state === LetterState.CORRECT) {
            newLetterStatuses[charUpper] = LetterState.CORRECT;
          } else if (letter.state === LetterState.PRESENT && newLetterStatuses[charUpper] !== LetterState.CORRECT) {
            newLetterStatuses[charUpper] = LetterState.PRESENT;
          } else if (letter.state === LetterState.ABSENT && (!newLetterStatuses[charUpper] || newLetterStatuses[charUpper] === LetterState.INITIAL)) {
            newLetterStatuses[charUpper] = LetterState.ABSENT;
          }
        });
        setLetterStatuses(newLetterStatuses);
        setCurrentGuess('');
        setIsRevealing(false);

        if (evaluatedGuess.every(l => l.state === LetterState.CORRECT)) {
          setGameStatus(GameStatus.WON);
        } else if (guesses.length + 1 >= maxGuesses) {
          setGameStatus(GameStatus.LOST);
        }
    }, wordLength * 100 + 100); 

  }, [currentGuess, wordLength, secretWord, letterStatuses, guesses.length, maxGuesses]);

  const handleKeyPress = useCallback((key: string) => {
    if (gameStatus !== GameStatus.PLAYING || isRevealing) return;

    const upperKey = key.toUpperCase();

    if (upperKey === ENTER_KEY) {
      processSubmit();
    } else if (upperKey === BACKSPACE_KEY) {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (currentGuess.length < wordLength && VALID_KEY_PRESS_REGEX.test(key) && key.length === 1) { 
      setCurrentGuess(prev => prev + upperKey);
    }
  }, [gameStatus, isRevealing, currentGuess.length, wordLength, processSubmit]);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return; 
      if (gameStatus === GameStatus.SETTINGS && (e.key === "Enter" || e.key === "Escape")) {
        if (document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'INPUT') {
            return;
        }
      }
      if (isRevealing) return;
      
      if (gameStatus === GameStatus.PLAYING) {
        if (e.key.toUpperCase() === ENTER_KEY) {
          handleKeyPress(ENTER_KEY);
        } else if (e.key.toUpperCase() === BACKSPACE_KEY) {
          handleKeyPress(BACKSPACE_KEY);
        } else if (e.key.length === 1 && VALID_KEY_PRESS_REGEX.test(e.key)) { 
          handleKeyPress(e.key.toUpperCase());
        }
      }
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [handleKeyPress, gameStatus, isRevealing]); 

  const playAgain = () => {
    clearWordInfo();
    if (wordList.length > 0) {
        setGameStatus(GameStatus.PLAYING); 
    } else {
        changeSettings(); 
        showNotification("No words available. Please update settings.", 3000);
    }
  };
  
  const changeSettings = () => {
    clearWordInfo();
    setGameStatus(GameStatus.SETTINGS);
  };

  if (gameStatus === GameStatus.SETTINGS) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        {notification && ( 
            <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-red-600/80 text-white px-6 py-3 rounded-md shadow-lg z-50 transition-opacity duration-300"> {/* Updated color */}
            {notification}
            </div>
        )}
        <SettingsForm 
          onStartGame={handleStartGame} 
          initialWordList={initialSettings.wordList}
          initialMaxGuesses={initialSettings.maxGuesses}
        />
      </div>
    );
  }

  const renderWordInfoModalContent = () => {
    return (
      <>
        {wordInfoLoading && <p className="text-center text-emerald-300 my-2 text-sm">Loading word information...</p>} {/* Updated text color */}
        {wordInfoError && <p className="text-center text-red-400 my-2 text-sm">{wordInfoError}</p>}
        {!wordInfoLoading && !wordInfoError && (
          <>
            {phonetic && <p className="text-center text-slate-400 text-md my-1">Phonetic: <em className="text-slate-200 font-medium">{phonetic}</em></p>} {/* Updated text color */}
            {meaning && <p className="text-center text-slate-300 text-sm my-1 leading-relaxed px-2">Meaning: {meaning}</p>}
            {(!phonetic && !meaning) && <p className="text-center text-slate-500 my-2 text-sm">Phonetic and meaning information not available.</p>}
          </>
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen py-4 sm:py-8">
      <header className="mb-4 sm:mb-6"> {/* Adjusted margin */}
        <h1 className="text-4xl sm:text-5xl font-bold tracking-wider text-emerald-400" style={{ fontFamily: "'Poppins', sans-serif" }}>WORDLE</h1> {/* Updated text color and font explicitly for header */}
      </header>

      {notification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-emerald-600/90 text-white px-6 py-3 rounded-md shadow-lg z-50 transition-opacity duration-300"> {/* Updated color */}
          {notification}
        </div>
      )}
      
      <main className="flex-grow flex flex-col items-center justify-center w-full max-w-md mx-auto px-2">
       {wordLength > 0 && ( 
          <GameBoard
            guesses={guesses}
            currentGuess={currentGuess}
            wordLength={wordLength}
            maxGuesses={maxGuesses}
            isRevealing={isRevealing}
            currentAttempt={guesses.length}
          />
        )}
      </main>

      <div className="mt-auto w-full max-w-xl px-1">
        <Keyboard letterStatuses={letterStatuses} onKeyPress={handleKeyPress} disabled={isRevealing || gameStatus !== GameStatus.PLAYING} />
      </div>

      <Modal
        isOpen={gameStatus === GameStatus.WON}
        title="Congratulations!"
        onClose={playAgain}
        showCloseButton={false}
      >
        <p className="text-center text-lg mb-2">You guessed the word: <strong className="text-emerald-400">{secretWord}</strong></p> {/* Updated color */}
        {renderWordInfoModalContent()}
        <p className="text-center mb-6 mt-3">It took you {guesses.length} {guesses.length === 1 ? 'guess' : 'guesses'}.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={playAgain} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-6 rounded-md shadow-md transition-colors">Play Again</button> {/* Updated color */}
            <button onClick={changeSettings} className="w-full sm:w-auto bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-6 rounded-md shadow-md transition-colors">Change Settings</button>
        </div>
      </Modal>

      <Modal
        isOpen={gameStatus === GameStatus.LOST}
        title="Game Over"
        onClose={playAgain}
        showCloseButton={false}
      >
        <p className="text-center text-lg mb-2">The word was: <strong className="text-yellow-400">{secretWord}</strong></p>
        {renderWordInfoModalContent()}
        <p className="text-center mb-6 mt-3">Better luck next time!</p>
         <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={playAgain} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-6 rounded-md shadow-md transition-colors">Play Again</button> {/* Updated color */}
            <button onClick={changeSettings} className="w-full sm:w-auto bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-6 rounded-md shadow-md transition-colors">Change Settings</button>
        </div>
      </Modal>
    </div>
  );
};

export default App;