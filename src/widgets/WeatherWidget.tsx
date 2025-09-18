import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  interpolate,
  withSequence,
} from 'react-native-reanimated';
import * as Location from 'expo-location';
import { WeatherData } from '../types';
// import RainAnimation from '../components/animations/RainAnimation';
// import SnowAnimation from '../components/animations/SnowAnimation';
// import CloudAnimation from '../components/animations/CloudAnimation';
// import SunAnimation from '../components/animations/SunAnimation';

interface WeatherWidgetProps {
  onRefresh?: () => void;
}

export default function WeatherWidget({ onRefresh }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Animation values
  const scale = useSharedValue(1);
  const cloudFloat = useSharedValue(0);
  const sunRotate = useSharedValue(0);

  const getWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission denied');
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // For demo purposes, we'll use mock data
      // In a real app, you would call a weather API here
      const mockWeather: WeatherData = {
        temperature: Math.floor(Math.random() * 20) + 15, // 15-35°C
        condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)],
        location: 'Current Location',
        icon: 'sunny',
        humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
        windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
      };

      setWeather(mockWeather);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getWeatherData();
    
    // Start animations
    startAnimations();
  }, []);

  const startAnimations = () => {
    // Scale pulsing animation (gentle breathing effect)
    scale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 3000 }),
        withTiming(1, { duration: 3000 })
      ),
      -1,
      true
    );

    // Cloud floating animation
    cloudFloat.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 3000 }),
        withTiming(-5, { duration: 3000 })
      ),
      -1,
      true
    );

    // Sun rotation
    sunRotate.value = withRepeat(
      withTiming(360, { duration: 15000 }),
      -1,
      false
    );
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return 'sunny';
      case 'cloudy':
        return 'cloudy';
      case 'rainy':
        return 'rainy';
      case 'partly cloudy':
        return 'partly-sunny';
      default:
        return 'partly-sunny';
    }
  };

  const getWeatherAnimation = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    
    if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) {
      const intensity = lowerCondition.includes('heavy') || lowerCondition.includes('storm') ? 'heavy' : 
                       lowerCondition.includes('light') || lowerCondition.includes('drizzle') ? 'light' : 'moderate';
      return { type: 'rain', intensity };
    }
    
    if (lowerCondition.includes('snow') || lowerCondition.includes('blizzard')) {
      const intensity = lowerCondition.includes('heavy') || lowerCondition.includes('blizzard') ? 'heavy' : 
                       lowerCondition.includes('light') ? 'light' : 'moderate';
      return { type: 'snow', intensity };
    }
    
    if (lowerCondition.includes('cloud') && !lowerCondition.includes('sunny')) {
      const intensity = lowerCondition.includes('overcast') || lowerCondition.includes('heavy') ? 'heavy' : 
                       lowerCondition.includes('light') || lowerCondition.includes('partly') ? 'light' : 'moderate';
      return { type: 'cloud', intensity };
    }
    
    if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) {
      const intensity = lowerCondition.includes('bright') || lowerCondition.includes('hot') ? 'bright' : 
                       lowerCondition.includes('light') ? 'light' : 'moderate';
      return { type: 'sun', intensity };
    }
    
    // Default to light cloud animation
    return { type: 'cloud', intensity: 'light' };
  };

  const renderWeatherAnimation = (condition: string) => {
    const animation = getWeatherAnimation(condition);
    
    switch (animation.type) {
      case 'rain':
        return <RainAnimation intensity={animation.intensity as any} />;
      case 'snow':
        return <SnowAnimation intensity={animation.intensity as any} />;
      case 'cloud':
        return <CloudAnimation intensity={animation.intensity as any} />;
      case 'sun':
        return <SunAnimation intensity={animation.intensity as any} />;
      default:
        return null;
    }
  };

  // Animated styles
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        // Removed rotation animation
      ],
    };
  });

  const animatedCloudStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: cloudFloat.value },
      ],
    };
  });

  const animatedSunStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${sunRotate.value}deg` },
      ],
    };
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#06b6d4', '#0891b2']}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="white" size="small" />
            <Text style={styles.loadingText}>Loading weather...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#ef4444', '#dc2626']}
          style={styles.gradient}
        >
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={24} color="white" />
            <Text style={styles.errorText}>Weather unavailable</Text>
            <TouchableOpacity onPress={getWeatherData} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (!weather) return null;

  const getWeatherGradient = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    
    if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) {
      return ['#4a5568', '#2d3748']; // Gray for rain
    }
    if (lowerCondition.includes('snow') || lowerCondition.includes('blizzard')) {
      return ['#e2e8f0', '#cbd5e0']; // Light gray/white for snow
    }
    if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) {
      return ['#fbbf24', '#f59e0b']; // Yellow/orange for sun
    }
    if (lowerCondition.includes('cloud')) {
      return ['#64748b', '#475569']; // Blue-gray for clouds
    }
    
    return ['#06b6d4', '#0891b2']; // Default blue
  };

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <LinearGradient
        colors={getWeatherGradient(weather.condition)}
        style={styles.gradient}
      >
        {/* Weather Animation Overlay */}
        {/* {renderWeatherAnimation(weather.condition)} */}
        
        <View style={styles.header}>
          <Text style={styles.title}>Weather</Text>
          <TouchableOpacity onPress={getWeatherData}>
            <Ionicons name="refresh" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.mainInfo}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={getWeatherIcon(weather.condition) as any}
                size={48}
                color="white"
              />
            </View>
            <View style={styles.temperatureContainer}>
              <Text style={styles.temperature}>{weather.temperature}°</Text>
              <Text style={styles.condition}>{weather.condition}</Text>
            </View>
          </View>

          <View style={styles.details}>
            <View style={styles.detailItem}>
              <Ionicons name="water" size={16} color="white" />
              <Text style={styles.detailText}>{weather.humidity}%</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="leaf" size={16} color="white" />
              <Text style={styles.detailText}>{weather.windSpeed} km/h</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  gradient: {
    flex: 1,
    padding: 16,
    position: 'relative',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    color: 'white',
    marginTop: 8,
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    color: 'white',
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    alignItems: 'center',
  },
  mainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    marginRight: 16,
  },
  temperatureContainer: {
    marginLeft: 16,
    alignItems: 'flex-start',
  },
  temperature: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  condition: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    color: 'white',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
});
