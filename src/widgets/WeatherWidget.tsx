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
import * as Location from 'expo-location';
import { WeatherData } from '../types';

interface WeatherWidgetProps {
  onRefresh?: () => void;
}

export default function WeatherWidget({ onRefresh }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, []);

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

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#06b6d4', '#0891b2']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Weather</Text>
          <TouchableOpacity onPress={getWeatherData}>
            <Ionicons name="refresh" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.mainInfo}>
            <Ionicons
              name={getWeatherIcon(weather.condition) as any}
              size={48}
              color="white"
            />
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
    </View>
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
    padding: 16,
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
