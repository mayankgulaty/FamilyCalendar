import React, { useEffect, useState } from 'react';
import { View, ImageBackground, StyleSheet, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { BackgroundService, BackgroundImage, BackgroundSettings } from '../services/backgroundService';

interface DynamicBackgroundProps {
  children: React.ReactNode;
  refreshTrigger?: number; // Add refresh trigger prop
}

const { width, height } = Dimensions.get('window');

export default function DynamicBackground({ children, refreshTrigger }: DynamicBackgroundProps) {
  const [backgroundImage, setBackgroundImage] = useState<BackgroundImage | null>(null);
  const [settings, setSettings] = useState<BackgroundSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    loadBackgroundSettings();
    checkAndRefreshBackground();
  }, []);

  // Listen for refresh trigger changes
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      console.log('Refresh trigger changed, reloading background settings...');
      loadBackgroundSettings();
      checkAndRefreshBackground();
    }
  }, [refreshTrigger]);

  const loadBackgroundSettings = async () => {
    try {
      console.log('Loading background settings...');
      const backgroundSettings = await BackgroundService.getBackgroundSettings();
      console.log('Background settings loaded:', backgroundSettings);
      setSettings(backgroundSettings);
      
      if (backgroundSettings.enabled) {
        const currentBackground = await BackgroundService.getCurrentBackground();
        console.log('Current background:', currentBackground);
        setBackgroundImage(currentBackground);
      } else {
        console.log('Background is disabled');
        setBackgroundImage(null);
      }
    } catch (error) {
      console.error('Failed to load background settings:', error);
    }
  };

  const checkAndRefreshBackground = async () => {
    try {
      const backgroundSettings = await BackgroundService.getBackgroundSettings();
      if (!backgroundSettings.enabled) {
        setBackgroundImage(null);
        return;
      }
      
      setLoading(true);
      const newBackground = await BackgroundService.refreshBackgroundIfNeeded();
      setBackgroundImage(newBackground);
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

  // If image failed to load, show fallback
  if (imageError) {
    return (
      <View style={styles.container}>
        <View style={[styles.backgroundImage, styles.fallbackBackground]}>
          <View style={styles.content}>
            {children}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: backgroundImage.url }}
        style={styles.backgroundImage}
        resizeMode="cover"
        onError={(error) => {
          console.error('Failed to load background image:', error);
          setImageError(true);
          // Try fallback URLs if available
          if (backgroundImage.fallbackUrls && backgroundImage.fallbackUrls.length > 0) {
            console.log('Trying fallback URL:', backgroundImage.fallbackUrls[0]);
            // For now, just log the fallback. In a real app, you'd retry with fallback
          }
        }}
        onLoad={() => {
          console.log('Background image loaded successfully');
        }}
      >
        {settings.blur > 0 && Platform.OS !== 'web' && (
          <BlurView
            intensity={settings.blur}
            style={[styles.blurOverlay, { opacity: settings.opacity }]}
          />
        )}
        
        {settings.blur > 0 && Platform.OS === 'web' && (
          <View style={[styles.blurOverlay, { 
            backgroundColor: `rgba(0, 0, 0, ${settings.opacity * 0.5})`,
            backdropFilter: `blur(${settings.blur / 10}px)`
          }]} />
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
  fallbackBackground: {
    backgroundColor: '#f8fafc',
  },
});
