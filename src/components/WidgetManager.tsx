import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';
import { Widget } from '../types';
import WeatherWidget from '../widgets/WeatherWidget';
import QuickAddWidget from '../widgets/QuickAddWidget';
import UpcomingEventsWidget from '../widgets/UpcomingEventsWidget';
import NotesWidget from '../widgets/NotesWidget';
import QuickTasksWidget from '../widgets/QuickTasksWidget';
import CalendarStatsWidget from '../widgets/CalendarStatsWidget';

interface WidgetManagerProps {
  onEventPress?: (event: any) => void;
  onEventAdded?: (event: any) => void;
}

const { width: screenWidth } = Dimensions.get('window');

export default function WidgetManager({ onEventPress, onEventAdded }: WidgetManagerProps) {
  const { state, dispatch } = useApp();
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Calculate optimal widget layout with intelligent space management
  const getWidgetLayout = () => {
    const padding = 16;
    const gap = 16;
    const availableWidth = screenWidth - (padding * 2);
    
    // Define widget sizes and properties
    const widgetSizes: { [key: string]: { width: number; height: number; priority: number; flexible: boolean } } = {
      'weather': { width: 1, height: 1, priority: 1, flexible: true },
      'quick-add': { width: 1, height: 1, priority: 2, flexible: true },
      'upcoming-events': { width: 2, height: 1, priority: 3, flexible: true },
      'notes': { width: 1, height: 1, priority: 4, flexible: true },
      'quick-tasks': { width: 1, height: 1, priority: 5, flexible: true },
      'calendar-stats': { width: 1, height: 1, priority: 6, flexible: true },
    };

    const enabledWidgets = state.widgets
      .filter(widget => widget.enabled)
      .sort((a, b) => a.position - b.position);

    if (enabledWidgets.length === 0) return [];

    // Smart layout algorithm that maximizes space usage
    const rows: Widget[][] = [];
    
    // Calculate optimal distribution
    const totalWidgets = enabledWidgets.length;
    const maxWidgetsPerRow = Math.floor(availableWidth / (280 + gap)); // Base widget width + gap
    
    // If we have few widgets, try to fit them optimally
    if (totalWidgets <= 4) {
      // Special handling for common cases
      if (totalWidgets === 1) {
        rows.push([enabledWidgets[0]]);
      } else if (totalWidgets === 2) {
        rows.push(enabledWidgets); // Both in one row
      } else if (totalWidgets === 3) {
        // For 3 widgets, try to fit all in one row if screen is wide enough
        if (maxWidgetsPerRow >= 3) {
          rows.push(enabledWidgets);
        } else {
          rows.push([enabledWidgets[0], enabledWidgets[1]]);
          rows.push([enabledWidgets[2]]);
        }
      } else if (totalWidgets === 4) {
        // For 4 widgets, try 2x2 or 4x1 depending on screen width
        if (maxWidgetsPerRow >= 4) {
          rows.push(enabledWidgets); // All in one row
        } else if (maxWidgetsPerRow >= 2) {
          rows.push([enabledWidgets[0], enabledWidgets[1]]);
          rows.push([enabledWidgets[2], enabledWidgets[3]]);
        } else {
          // Fallback to single column
          enabledWidgets.forEach(widget => rows.push([widget]));
        }
      }
    } else {
      // For more widgets, use standard row-based layout
      let currentRow: Widget[] = [];
      let currentRowWidth = 0;
      
      enabledWidgets.forEach(widget => {
        const size = widgetSizes[widget.type] || { width: 1, height: 1, priority: 1, flexible: true };
        const widgetWidth = size.width;
        
        // Check if widget fits in current row
        const wouldExceedRow = currentRowWidth + widgetWidth > maxWidgetsPerRow;
        
        if (wouldExceedRow && currentRow.length > 0) {
          rows.push([...currentRow]);
          currentRow = [widget];
          currentRowWidth = widgetWidth;
        } else {
          currentRow.push(widget);
          currentRowWidth += widgetWidth;
        }
      });
      
      if (currentRow.length > 0) {
        rows.push(currentRow);
      }
    }

    return rows;
  };

  const availableWidgets: Omit<Widget, 'enabled' | 'position'>[] = [
    { id: 'weather', type: 'weather', title: 'Weather' },
    { id: 'quick-add', type: 'quick-add', title: 'Quick Add Event' },
    { id: 'upcoming-events', type: 'upcoming-events', title: 'Upcoming Events' },
    { id: 'notes', type: 'notes', title: 'Family Notes' },
    { id: 'quick-tasks', type: 'quick-tasks', title: 'Quick Tasks' },
    { id: 'calendar-stats', type: 'calendar-stats', title: 'Calendar Stats' },
  ];

  const toggleWidget = (widgetId: string) => {
    const widget = state.widgets.find(w => w.id === widgetId);
    if (widget) {
      dispatch({
        type: 'UPDATE_WIDGET',
        payload: { ...widget, enabled: !widget.enabled },
      });
    } else {
      // Add new widget
      const newWidget = availableWidgets.find(w => w.id === widgetId);
      if (newWidget) {
        dispatch({
          type: 'ADD_WIDGET',
          payload: {
            ...newWidget,
            enabled: true,
            position: state.widgets.length,
          },
        });
      }
    }
  };

  const renderWidget = (widget: Widget) => {
    switch (widget.type) {
      case 'weather':
        return <WeatherWidget key={widget.id} />;
      case 'quick-add':
        return <QuickAddWidget key={widget.id} onEventAdded={onEventAdded} />;
      case 'upcoming-events':
        return <UpcomingEventsWidget key={widget.id} onEventPress={onEventPress} />;
      case 'notes':
        return <NotesWidget key={widget.id} />;
      case 'quick-tasks':
        return <QuickTasksWidget key={widget.id} />;
      case 'calendar-stats':
        return <CalendarStatsWidget key={widget.id} />;
      default:
        return null;
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh - in a real app, this would sync widgets
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const widgetRows = getWidgetLayout();

  const renderWidgetRow = (rowWidgets: Widget[], rowIndex: number) => {
    // Calculate total units for this row
    const totalRowWidth = rowWidgets.reduce((sum, widget) => {
      const widgetSizes: { [key: string]: { width: number } } = {
        'weather': { width: 1 },
        'quick-add': { width: 1 },
        'upcoming-events': { width: 2 },
        'notes': { width: 1 },
        'quick-tasks': { width: 1 },
        'calendar-stats': { width: 1 },
      };
      return sum + (widgetSizes[widget.type]?.width || 1);
    }, 0);

    return (
      <View key={rowIndex} style={styles.widgetRow}>
        {rowWidgets.map((widget, index) => {
          const widgetSizes: { [key: string]: { width: number } } = {
            'weather': { width: 1 },
            'quick-add': { width: 1 },
            'upcoming-events': { width: 2 },
            'notes': { width: 1 },
            'quick-tasks': { width: 1 },
            'calendar-stats': { width: 1 },
          };
          
          const widgetWidth = widgetSizes[widget.type]?.width || 1;
          
          return (
            <View 
              key={widget.id} 
              style={[
                styles.widgetContainer,
                { 
                  flex: widgetWidth, // Use flex instead of flexBasis for better space filling
                  minWidth: widget.type === 'upcoming-events' ? 400 : 280,
                  maxWidth: widget.type === 'upcoming-events' ? undefined : 400,
                }
              ]}
            >
              {renderWidget(widget)}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setSettingsModalVisible(true)}
        >
          <Ionicons name="settings" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

        <ScrollView
          style={styles.widgetsContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.widgetsContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#6366f1']}
              tintColor="#6366f1"
            />
          }
        >
          {widgetRows.map((row, index) => renderWidgetRow(row, index))}
        </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={settingsModalVisible}
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Widget Settings</Text>
              <TouchableOpacity onPress={() => setSettingsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.widgetsList}>
              {availableWidgets.map(widget => {
                const isEnabled = state.widgets.find(w => w.id === widget.id)?.enabled || false;
                return (
                  <View key={widget.id} style={styles.widgetItem}>
                    <View style={styles.widgetInfo}>
                      <Text style={styles.widgetName}>{widget.title}</Text>
                      <Text style={styles.widgetDescription}>
                        {getWidgetDescription(widget.type)}
                      </Text>
                    </View>
                    <Switch
                      value={isEnabled}
                      onValueChange={() => toggleWidget(widget.id)}
                      trackColor={{ false: '#e5e7eb', true: '#6366f1' }}
                      thumbColor={isEnabled ? '#ffffff' : '#f3f4f6'}
                    />
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function getWidgetDescription(type: string): string {
  switch (type) {
    case 'weather':
      return 'Current weather conditions and forecast';
    case 'quick-add':
      return 'Quickly add new events to your calendar';
    case 'upcoming-events':
      return 'View your upcoming events for the next week';
    case 'notes':
      return 'Family notes and reminders';
    case 'quick-tasks':
      return 'Quick tasks and to-dos for the family';
    case 'calendar-stats':
      return 'Calendar usage statistics and insights';
    default:
      return '';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  settingsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  widgetsContainer: {
    flex: 1,
  },
  widgetsContent: {
    padding: 16,
    gap: 16,
  },
  widgetRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
    flexWrap: 'nowrap', // Don't wrap - let flex handle the sizing
    alignItems: 'stretch', // Make all widgets same height
  },
  widgetContainer: {
    // Remove fixed constraints - let flex handle everything
  },
  widgetWrapper: {
    marginBottom: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  widgetsList: {
    maxHeight: 400,
  },
  widgetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  widgetInfo: {
    flex: 1,
    marginRight: 16,
  },
  widgetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  widgetDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
});
