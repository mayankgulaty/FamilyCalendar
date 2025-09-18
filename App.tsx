import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/contexts/AppContext';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <HomeScreen />
        <StatusBar style="auto" />
      </AppProvider>
    </SafeAreaProvider>
  );
}
