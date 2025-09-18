import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, themes } from '../types/themes';

interface ThemeState {
  currentTheme: Theme;
  availableThemes: Theme[];
}

type ThemeAction = 
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_THEMES'; payload: Theme[] };

const initialState: ThemeState = {
  currentTheme: themes[0], // Default to 'Sunset Dreams'
  availableThemes: themes,
};

function themeReducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case 'SET_THEME':
      return {
        ...state,
        currentTheme: action.payload,
      };
    case 'SET_THEMES':
      return {
        ...state,
        availableThemes: action.payload,
      };
    default:
      return state;
  }
}

interface ThemeContextType {
  state: ThemeState;
  dispatch: React.Dispatch<ThemeAction>;
  setTheme: (theme: Theme) => void;
  getThemeById: (id: string) => Theme | undefined;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Load saved theme on app start
  useEffect(() => {
    loadSavedTheme();
  }, []);

  // Save theme when it changes
  useEffect(() => {
    saveTheme(state.currentTheme);
  }, [state.currentTheme]);

  const loadSavedTheme = async () => {
    try {
      const savedThemeId = await AsyncStorage.getItem('selectedTheme');
      if (savedThemeId) {
        const theme = themes.find(t => t.id === savedThemeId);
        if (theme) {
          dispatch({ type: 'SET_THEME', payload: theme });
        }
      }
    } catch (error) {
      console.error('Error loading saved theme:', error);
    }
  };

  const saveTheme = async (theme: Theme) => {
    try {
      await AsyncStorage.setItem('selectedTheme', theme.id);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const setTheme = (theme: Theme) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  const getThemeById = (id: string): Theme | undefined => {
    return themes.find(theme => theme.id === id);
  };

  const value: ThemeContextType = {
    state,
    dispatch,
    setTheme,
    getThemeById,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
