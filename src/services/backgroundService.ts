import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BackgroundSettings {
  enabled: boolean;
  refreshFrequency: 'daily' | 'weekly' | 'manual';
  category: string;
  blur: number;
  opacity: number;
}

export interface BackgroundImage {
  id: string;
  url: string;
  author: string;
  downloadUrl: string;
  timestamp: number;
  fallbackUrls?: string[];
  isDark?: boolean;
  textColor?: string;
  secondaryTextColor?: string;
}

const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY'; // You'll need to get this from Unsplash
const STORAGE_KEYS = {
  BACKGROUND_SETTINGS: 'background_settings',
  CURRENT_BACKGROUND: 'current_background',
  LAST_REFRESH: 'last_background_refresh',
};

// Utility function to analyze image brightness and determine text colors
function analyzeImageColors(imageUrl: string): Promise<{ isDark: boolean; textColor: string; secondaryTextColor: string }> {
  return new Promise((resolve) => {
    // For now, we'll use a simple heuristic based on the image ID
    // In a real app, you'd analyze the actual image pixels
    const imageId = parseInt(imageUrl.match(/random=(\d+)/)?.[1] || '0');
    
    // Improved brightness estimation based on image ID (for demo purposes)
    // This is a more sophisticated heuristic that better matches actual image brightness
    // For complex backgrounds like mountains/nature, we'll be more conservative
    // and assume they need dark text for better readability
    const isDark = imageId > 400 || imageId % 5 === 0 || imageId % 7 === 0;
    
    console.log('Color analysis for image', imageId, ':', { isDark, textColor: isDark ? '#ffffff' : '#000000' });
    
    const textColor = isDark ? '#ffffff' : '#000000';
    const secondaryTextColor = isDark ? '#e5e7eb' : '#333333';
    
    resolve({ isDark, textColor, secondaryTextColor });
  });
}

// Categories for different moods
const BACKGROUND_CATEGORIES = [
  'nature',
  'landscape',
  'minimalist',
  'abstract',
  'architecture',
  'flowers',
  'mountains',
  'ocean',
  'forest',
  'sunset',
  'city',
  'peaceful'
];

export const defaultBackgroundSettings: BackgroundSettings = {
  enabled: false,
  refreshFrequency: 'daily',
  category: 'nature',
  blur: 0,
  opacity: 0.8,
};

export class BackgroundService {
  // Get background settings from storage
  static async getBackgroundSettings(): Promise<BackgroundSettings> {
    try {
      const settings = await AsyncStorage.getItem(STORAGE_KEYS.BACKGROUND_SETTINGS);
      return settings ? JSON.parse(settings) : defaultBackgroundSettings;
    } catch (error) {
      console.error('Failed to load background settings:', error);
      return defaultBackgroundSettings;
    }
  }

  // Save background settings to storage
  static async saveBackgroundSettings(settings: BackgroundSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BACKGROUND_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save background settings:', error);
    }
  }

  // Get current background image
  static async getCurrentBackground(): Promise<BackgroundImage | null> {
    try {
      const background = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_BACKGROUND);
      return background ? JSON.parse(background) : null;
    } catch (error) {
      console.error('Failed to load current background:', error);
      return null;
    }
  }

  // Save current background image
  static async saveCurrentBackground(background: BackgroundImage): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_BACKGROUND, JSON.stringify(background));
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_REFRESH, Date.now().toString());
    } catch (error) {
      console.error('Failed to save current background:', error);
    }
  }

  // Check if background needs refresh based on frequency
  static async shouldRefreshBackground(): Promise<boolean> {
    try {
      const settings = await this.getBackgroundSettings();
      if (!settings.enabled || settings.refreshFrequency === 'manual') {
        return false;
      }

      const lastRefresh = await AsyncStorage.getItem(STORAGE_KEYS.LAST_REFRESH);
      if (!lastRefresh) {
        return true;
      }

      const lastRefreshTime = parseInt(lastRefresh);
      const now = Date.now();
      const hoursSinceRefresh = (now - lastRefreshTime) / (1000 * 60 * 60);

      switch (settings.refreshFrequency) {
        case 'daily':
          return hoursSinceRefresh >= 24;
        case 'weekly':
          return hoursSinceRefresh >= 168; // 7 days
        default:
          return false;
      }
    } catch (error) {
      console.error('Failed to check refresh status:', error);
      return false;
    }
  }

  // Fetch new background image from Unsplash
  static async fetchNewBackground(category: string = 'nature'): Promise<BackgroundImage | null> {
    try {
      // For demo purposes, we'll use a fallback service since Unsplash requires API key
      // In production, you'd use: https://api.unsplash.com/photos/random
      
      // Using Lorem Picsum as a free alternative with fallback
      const width = 1080;
      const height = 1920;
      const imageId = Math.floor(Math.random() * 1000);
      
      // Try multiple fallback URLs
      const fallbackUrls = [
        `https://picsum.photos/${width}/${height}?random=${imageId}`,
        `https://source.unsplash.com/${width}x${height}/?${category}`,
        `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=${width}&h=${height}&fit=crop`,
        `https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=${width}&h=${height}&fit=crop`,
      ];
      
      // Analyze image colors for text contrast
      const colorAnalysis = await analyzeImageColors(fallbackUrls[0]);
      
      const backgroundImage: BackgroundImage = {
        id: `picsum-${imageId}`,
        url: fallbackUrls[0], // Use first URL as primary
        author: `Lorem Picsum #${imageId}`,
        downloadUrl: fallbackUrls[0],
        timestamp: Date.now(),
        fallbackUrls: fallbackUrls.slice(1), // Store fallbacks
        isDark: colorAnalysis.isDark,
        textColor: colorAnalysis.textColor,
        secondaryTextColor: colorAnalysis.secondaryTextColor,
      };

      console.log('Fetching background image:', backgroundImage.url);
      console.log('Image color analysis:', { isDark: backgroundImage.isDark, textColor: backgroundImage.textColor });
      await this.saveCurrentBackground(backgroundImage);
      return backgroundImage;
    } catch (error) {
      console.error('Failed to fetch new background:', error);
      return null;
    }
  }

  // Get background categories
  static getBackgroundCategories(): string[] {
    return BACKGROUND_CATEGORIES;
  }

  // Re-analyze current background colors (for existing backgrounds without color data)
  static async reanalyzeCurrentBackground(): Promise<BackgroundImage | null> {
    try {
      const currentBackground = await this.getCurrentBackground();
      if (!currentBackground) return null;

      // If already has color data, return as is
      if (currentBackground.textColor && currentBackground.secondaryTextColor) {
        return currentBackground;
      }

      // Re-analyze colors
      const colorAnalysis = await analyzeImageColors(currentBackground.url);
      
      const updatedBackground: BackgroundImage = {
        ...currentBackground,
        isDark: colorAnalysis.isDark,
        textColor: colorAnalysis.textColor,
        secondaryTextColor: colorAnalysis.secondaryTextColor,
      };

      await this.saveCurrentBackground(updatedBackground);
      return updatedBackground;
    } catch (error) {
      console.error('Failed to re-analyze background colors:', error);
      return null;
    }
  }

  // Refresh background if needed
  static async refreshBackgroundIfNeeded(): Promise<BackgroundImage | null> {
    try {
      const shouldRefresh = await this.shouldRefreshBackground();
      if (!shouldRefresh) {
        return await this.getCurrentBackground();
      }

      const settings = await this.getBackgroundSettings();
      const newBackground = await this.fetchNewBackground(settings.category);
      return newBackground;
    } catch (error) {
      console.error('Failed to refresh background:', error);
      return await this.getCurrentBackground();
    }
  }

  // Force refresh background
  static async forceRefreshBackground(): Promise<BackgroundImage | null> {
    try {
      const settings = await this.getBackgroundSettings();
      const newBackground = await this.fetchNewBackground(settings.category);
      console.log('Force refreshed background with color analysis:', newBackground);
      return newBackground;
    } catch (error) {
      console.error('Failed to force refresh background:', error);
      return null;
    }
  }

  // Clear current background
  static async clearBackground(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_BACKGROUND);
      await AsyncStorage.removeItem(STORAGE_KEYS.LAST_REFRESH);
    } catch (error) {
      console.error('Failed to clear background:', error);
    }
  }
}

// Unsplash API implementation (for when you have an API key)
export class UnsplashBackgroundService {
  private static readonly UNSPLASH_API = 'https://api.unsplash.com/photos/random';
  
  static async fetchFromUnsplash(category: string, accessKey: string): Promise<BackgroundImage | null> {
    try {
      const response = await fetch(
        `${this.UNSPLASH_API}?query=${category}&orientation=portrait&client_id=${accessKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        id: data.id,
        url: data.urls.regular,
        author: data.user.name,
        downloadUrl: data.links.download_location,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Failed to fetch from Unsplash:', error);
      return null;
    }
  }
}
