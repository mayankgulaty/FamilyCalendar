import React, { createContext, useContext, useState, useEffect } from 'react';
import { BackgroundService, BackgroundImage } from '../services/backgroundService';

interface TextColors {
  primary: string;
  secondary: string;
  isDark: boolean;
}

interface TextColorContextType {
  textColors: TextColors;
  updateTextColors: (background: BackgroundImage | null) => void;
}

const TextColorContext = createContext<TextColorContextType | undefined>(undefined);

const defaultTextColors: TextColors = {
  primary: '#000000', // Pure black for light backgrounds - better contrast
  secondary: '#333333', // Dark gray for secondary text on light backgrounds - better contrast
};

export function TextColorProvider({ children }: { children: React.ReactNode }) {
  const [textColors, setTextColors] = useState<TextColors>(defaultTextColors);

  useEffect(() => {
    // Load initial text colors from current background
    loadTextColors();
  }, []);

  const loadTextColors = async () => {
    try {
      const currentBackground = await BackgroundService.getCurrentBackground();
      updateTextColors(currentBackground);
    } catch (error) {
      console.error('Failed to load text colors:', error);
      setTextColors(defaultTextColors);
    }
  };

  const updateTextColors = (background: BackgroundImage | null) => {
    if (background?.textColor && background?.secondaryTextColor) {
      setTextColors({
        primary: background.textColor,
        secondary: background.secondaryTextColor,
        isDark: background.isDark || false,
      });
    } else {
      setTextColors(defaultTextColors);
    }
  };

  return (
    <TextColorContext.Provider value={{ textColors, updateTextColors }}>
      {children}
    </TextColorContext.Provider>
  );
}

export function useTextColors() {
  const context = useContext(TextColorContext);
  if (context === undefined) {
    throw new Error('useTextColors must be used within a TextColorProvider');
  }
  return context;
}
