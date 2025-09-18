import React, { useEffect, useState } from 'react';
import { View, ImageBackground, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { BackgroundService, BackgroundImage, BackgroundSettings } from '../services/backgroundService';

interface DynamicBackgroundProps {
  children: React.ReactNode;
  onBackgroundLoaded?: (image: BackgroundImage | null) => void;
}

const { width, height } = Dimensions.get('window');

export default function DynamicBackground({ children, onBackgroundLoaded }: DynamicBackgroundProps) {
  const [backgroundImage, setBackgroundImage] = useState<BackgroundImage | null>(null);
  const [settings, setSettings] = useState<BackgroundSettings | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBackgroundSettings();
    checkAndRefreshBackground();
  }, []);

  const loadBackgroundSettings = async () => {
    try {
      const backgroundSettings = await BackgroundService.getBackgroundSettings();
      setSettings(backgroundSettings);
      
      if (backgroundSettings.enabled) {
        const currentBackground = await BackgroundService.getCurrentBackground();
        setBackgroundImage(currentBackground);
        onBackgroundLoaded?.(currentBackground);
      }
    } catch (error) {
      console.error('Failed to load background settings:', error);
    }
  };

  const checkAndRefreshBackground = async () => {
    try {
      setLoading(true);
      const newBackground = await BackgroundService.refreshBackgroundIfNeeded();
      setBackgroundImage(newBackground);
      onBackgroundLoaded?.(newBackground);
    } catch (error) {
      console.error('Failed to refresh background:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshBackground = async () => {
    try {
      setLoading(true);
      const newBackground = await BackgroundService.forceRefreshBackground();
      setBackgroundImage(newBackground);
      onBackgroundLoaded?.(newBackground);
    } catch (error) {
      console.error('Failed to refresh background:', error);
    } finally {
      setLoading(false);
    }
  };

  // If background is disabled or no image, render children with default background
  if (!settings?.enabled || !backgroundImage) {
    return (
      <View style={styles.defaultContainer}>
        {children}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: backgroundImage.url }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {settings.blur > 0 && (
          <BlurView
            intensity={settings.blur}
            style={[styles.blurOverlay, { opacity: settings.opacity }]}
          />
        )}
        
        {!settings.blur && (
          <View style={[styles.overlay, { opacity: 1 - settings.opacity }]} />
        )}

        <View style={styles.content}>
          {children}
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#6366f1" />
          </View>
        )}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  defaultContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});
