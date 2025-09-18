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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';
import { Widget } from '../types';
import WeatherWidget from '../widgets/WeatherWidget';
import QuickAddWidget from '../widgets/QuickAddWidget';
import UpcomingEventsWidget from '../widgets/UpcomingEventsWidget';

interface WidgetManagerProps {
  onEventPress?: (event: any) => void;
  onEventAdded?: (event: any) => void;
}

export default function WidgetManager({ onEventPress, onEventAdded }: WidgetManagerProps) {
  const { state, dispatch } = useApp();
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const availableWidgets: Omit<Widget, 'enabled' | 'position'>[] = [
    { id: 'weather', type: 'weather', title: 'Weather' },
    { id: 'quick-add', type: 'quick-add', title: 'Quick Add Event' },
    { id: 'upcoming-events', type: 'upcoming-events', title: 'Upcoming Events' },
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

  const enabledWidgets = state.widgets
    .filter(widget => widget.enabled)
    .sort((a, b) => a.position - b.position);

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
        {enabledWidgets.map(widget => (
          <View key={widget.id} style={styles.widgetWrapper}>
            {renderWidget(widget)}
          </View>
        ))}
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
    backgroundColor: 'white',
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
