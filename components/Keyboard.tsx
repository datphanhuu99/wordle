import React from 'react';
import { LetterState, LetterStatusMap } from '../types';
import { KEYBOARD_LAYOUT, ENTER_KEY, BACKSPACE_KEY } from '../constants';

interface KeyboardProps {
  letterStatuses: LetterStatusMap;
  onKeyPress: (key: string) => void;
  disabled?: boolean;
}

const getKeyBgColor = (state: LetterState): string => {
  switch (state) {
    case LetterState.CORRECT:
      return 'bg-emerald-600 hover:bg-emerald-500 text-white'; // Updated color
    case LetterState.PRESENT:
      return 'bg-yellow-600 hover:bg-yellow-500 text-white'; // Updated color (or amber-600)
    case LetterState.ABSENT:
      return 'bg-slate-600 hover:bg-slate-500 text-slate-200'; // Updated color
    case LetterState.INITIAL:
    default:
      return 'bg-slate-500 hover:bg-slate-400 text-white'; // Original is fine
  }
};

const Keyboard: React.FC<KeyboardProps> = ({ letterStatuses, onKeyPress, disabled }) => {
  return (
    <div className="flex flex-col items-center gap-2 mt-4 sm:mt-8 px-1">
      {KEYBOARD_LAYOUT.map((row, rowIndex) => (
        <div key={`kb-row-${rowIndex}`} className="flex justify-center gap-1 sm:gap-1.5">
          {row.map((key) => {
            const isSpecialKey = key === ENTER_KEY || key === BACKSPACE_KEY;
            const status = letterStatuses[key] || LetterState.INITIAL;
            const widthClass = isSpecialKey ? 'px-3 sm:px-4 text-xs sm:text-sm flex-grow min-w-[40px] sm:min-w-[56px]' : 'w-8 h-12 sm:w-10 sm:h-14 text-sm sm:text-base';
            
            return (
              <button
                key={key}
                onClick={() => onKeyPress(key)}
                disabled={disabled}
                className={`keyboard-button transition-all rounded-md shadow-sm font-bold uppercase flex items-center justify-center
                            ${widthClass} ${getKeyBgColor(status)}
                            ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`} // Added rounded-md, shadow-sm
              >
                {key === BACKSPACE_KEY ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75 14.25 12m0 0 2.25 2.25M14.25 12l2.25-2.25M14.25 12 12 14.25m-2.58 4.92-6.374-6.375a1.125 1.125 0 0 1 0-1.59L9.42 4.83c.21-.211.497-.33.795-.33H19.5a2.25 2.25 0 0 1 2.25 2.25v10.5a2.25 2.25 0 0 1-2.25 2.25h-9.284c-.298 0-.585-.119-.795-.33Z" />
                  </svg>
                ) : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;