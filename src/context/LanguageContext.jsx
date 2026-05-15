import React, { createContext, useState, useContext, useEffect } from 'react';
import nl from '../i18n/nl.json';
import en from '../i18n/en.json';
import { supabase } from '../utils/supabaseClient';

const translations = { nl, en };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  // Default to 'nl', but check localStorage first
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('app_language') || 'nl';
  });

  // Whenever language changes, save to localStorage
  useEffect(() => {
    localStorage.setItem('app_language', language);
    // Note: User profile sync is handled in UserContext or Profile component to avoid circular dependencies
  }, [language]);

  // Translation function
  // Usage: t('landing.hero_title_1')
  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        // Fallback to English if key is missing in current language
        let fallbackValue = translations['en'];
        for (const fk of keys) {
            if (fallbackValue && fallbackValue[fk] !== undefined) {
                fallbackValue = fallbackValue[fk];
            } else {
                return key; // Return key name if missing in both
            }
        }
        return fallbackValue;
      }
    }
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
