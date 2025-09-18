import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/contexts/AppContext';
import { TextColorProvider } from './src/contexts/TextColorContext';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <TextColorProvider>
          <HomeScreen />
          <StatusBar style="auto" />
        </TextColorProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
