import { createContext, useContext, useState, ReactNode } from 'react';
import { translations, LanguageKey, TranslationKey } from '../translations';

interface LanguageContextType {
  currentLanguage: LanguageKey;
  setLanguage: (language: LanguageKey) => void;
  t: (key: TranslationKey) => string;
  getVoiceCommand: (command: keyof typeof translations.english.voiceCommands) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageKey>('english');

  const setLanguage = (language: LanguageKey) => {
    setCurrentLanguage(language);
  };

  const t = (key: TranslationKey): string => {
    try {
      const translationObj = translations[currentLanguage];
      const value = translationObj[key as keyof typeof translationObj];
      if (typeof value === 'string') {
        return value;
      }
      // Fallback to English
      const englishObj = translations.english;
      const fallbackValue = englishObj[key as keyof typeof englishObj];
      if (typeof fallbackValue === 'string') {
        return fallbackValue;
      }
      // If key doesn't exist, return a placeholder or the key itself
      console.warn(`Missing translation for key: ${key} in language: ${currentLanguage}`);
      return `[${key}]`; // Show missing translation clearly
    } catch (error) {
      // In case of any error, return the key itself
      console.error(`Translation error for key: ${key}`, error);
      return `[${key}]`;
    }
  };

  const getVoiceCommand = (command: keyof typeof translations.english.voiceCommands): string => {
    return translations[currentLanguage].voiceCommands[command] || 
           translations.english.voiceCommands[command] || 
           command;
  };

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    t,
    getVoiceCommand
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
