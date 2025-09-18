// Test file to verify background service functionality
import { BackgroundService } from '../services/backgroundService';

export const testBackgroundService = async () => {
  console.log('=== Testing Background Service ===');
  
  try {
    // Test 1: Get default settings
    console.log('Test 1: Getting default settings...');
    const settings = await BackgroundService.getBackgroundSettings();
    console.log('Default settings:', settings);
    
    // Test 2: Enable background
    console.log('Test 2: Enabling background...');
    const newSettings = { ...settings, enabled: true, category: 'nature' };
    await BackgroundService.saveBackgroundSettings(newSettings);
    console.log('Background enabled');
    
    // Test 3: Fetch new background
    console.log('Test 3: Fetching new background...');
    const background = await BackgroundService.fetchNewBackground('nature');
    console.log('New background:', background);
    
    // Test 4: Get current background
    console.log('Test 4: Getting current background...');
    const currentBackground = await BackgroundService.getCurrentBackground();
    console.log('Current background:', currentBackground);
    
    // Test 5: Check refresh status
    console.log('Test 5: Checking refresh status...');
    const shouldRefresh = await BackgroundService.shouldRefreshBackground();
    console.log('Should refresh:', shouldRefresh);
    
    console.log('=== Background Service Test Complete ===');
    return true;
  } catch (error) {
    console.error('Background service test failed:', error);
    return false;
  }
};
