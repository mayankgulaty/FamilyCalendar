import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';
import { useTextColors } from '../contexts/TextColorContext';
import CalendarView from '../components/CalendarView';
import WeeklyView from '../components/WeeklyView';
import WidgetManager from '../components/WidgetManager';
import ICalImportModal from '../components/ICalImport';
import DynamicBackground from '../components/DynamicBackground';
import BackgroundSettingsModal from '../components/BackgroundSettingsModal';
import { CalendarEvent } from '../types';
import { BackgroundService, BackgroundSettings } from '../services/backgroundService';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { state, dispatch } = useApp();
  const { textColors } = useTextColors();
  const [currentView, setCurrentView] = useState<'calendar' | 'weekly' | 'dashboard'>('calendar');
  const [icalModalVisible, setIcalModalVisible] = useState(false);
  const [backgroundModalVisible, setBackgroundModalVisible] = useState(false);
  const [backgroundSettings, setBackgroundSettings] = useState<BackgroundSettings | null>(null);
  const [backgroundRefreshTrigger, setBackgroundRefreshTrigger] = useState(0);

  const handleEventPress = (event: CalendarEvent) => {
    Alert.alert(
      event.title,
      `${event.allDay ? 'All Day' : event.startDate.toLocaleString()}\n${event.description || ''}\n${event.location || ''}`,
      [
        { text: 'Close', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Delete Event',
              'Are you sure you want to delete this event?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    dispatch({ type: 'DELETE_EVENT', payload: event.id });
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleEventAdded = (event: CalendarEvent) => {
    // Event is already added to state by the widget
    console.log('Event added:', event);
  };

  const handleDatePress = (date: Date) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: date });
  };

  const handleBackgroundSettingsChange = (settings: BackgroundSettings) => {
    setBackgroundSettings(settings);
    setBackgroundRefreshTrigger(prev => prev + 1); // Trigger refresh
  };

  const handleBackgroundRefresh = async () => {
    // Force refresh the background
    try {
      const newBackground = await BackgroundService.forceRefreshBackground();
      console.log('Background refreshed from HomeScreen:', newBackground);
      // Trigger refresh to update the DynamicBackground
      setBackgroundRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to refresh background from HomeScreen:', error);
    }
  };

  return (
    <DynamicBackground 
      refreshTrigger={backgroundRefreshTrigger}
    >
        {/* Remove container wrapper to test */}
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: textColors.primary }]}>Family Calendar</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setBackgroundModalVisible(true)}
            >
              <Ionicons name="image" size={20} color={textColors.secondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setIcalModalVisible(true)}
            >
              <Ionicons name="cloud-download" size={20} color={textColors.secondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setCurrentView(currentView === 'calendar' ? 'dashboard' : 'calendar')}
            >
                <Ionicons 
                  name={currentView === 'calendar' ? 'grid' : 'calendar'} 
                  size={20} 
                  color={textColors.secondary} 
                />
            </TouchableOpacity>
          </View>
        </View>

      {/* Content - Remove wrapper to allow background to show */}
      {currentView === 'calendar' ? (
        <CalendarView
          onEventPress={handleEventPress}
          onDatePress={handleDatePress}
        />
      ) : currentView === 'weekly' ? (
        <WeeklyView
          onEventPress={handleEventPress}
        />
      ) : (
        <WidgetManager
          onEventPress={handleEventPress}
          onEventAdded={handleEventAdded}
        />
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, currentView === 'calendar' && styles.navItemActive]}
          onPress={() => setCurrentView('calendar')}
        >
          <Ionicons 
            name="calendar" 
            size={24} 
            color={currentView === 'calendar' ? '#6366f1' : textColors.secondary} 
          />
          <Text style={[
            styles.navLabel, 
            currentView === 'calendar' && styles.navLabelActive,
            { color: currentView === 'calendar' ? '#6366f1' : textColors.secondary }
          ]}>
            Calendar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, currentView === 'weekly' && styles.navItemActive]}
          onPress={() => setCurrentView('weekly')}
        >
          <Ionicons 
            name="calendar-outline" 
            size={24} 
            color={currentView === 'weekly' ? '#6366f1' : textColors.secondary} 
          />
          <Text style={[
            styles.navLabel, 
            currentView === 'weekly' && styles.navLabelActive,
            { color: currentView === 'weekly' ? '#6366f1' : textColors.secondary }
          ]}>
            Week
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.navItem, currentView === 'dashboard' && styles.navItemActive]}
          onPress={() => setCurrentView('dashboard')}
        >
          <Ionicons 
            name="grid" 
            size={24} 
            color={currentView === 'dashboard' ? '#6366f1' : textColors.secondary} 
          />
          <Text style={[
            styles.navLabel, 
            currentView === 'dashboard' && styles.navLabelActive,
            { color: currentView === 'dashboard' ? '#6366f1' : textColors.secondary }
          ]}>
            Dashboard
          </Text>
        </TouchableOpacity>
      </View>

      {/* iCal Import Modal */}
      <ICalImportModal
        visible={icalModalVisible}
        onClose={() => {
          console.log('Closing modal');
          setIcalModalVisible(false);
        }}
      />

      {/* Background Settings Modal */}
      <BackgroundSettingsModal
        visible={backgroundModalVisible}
        onClose={() => setBackgroundModalVisible(false)}
        onSettingsChange={handleBackgroundSettingsChange}
        onBackgroundRefresh={handleBackgroundRefresh}
      />
    </DynamicBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.5)',
    backdropFilter: 'blur(10px)',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: 'rgba(229, 231, 235, 0.5)',
    paddingBottom: 20,
    paddingTop: 8,
    backdropFilter: 'blur(10px)',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navItemActive: {
    // Active state styling handled by text/icon colors
  },
  navLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#6366f1',
  },
});
