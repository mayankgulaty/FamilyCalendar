import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';
import { ICalImport as ICalImportType } from '../types';
import { fetchICalData, parseICalData } from '../utils/icalParser';

interface ICalImportProps {
  visible: boolean;
  onClose: () => void;
}

export default function ICalImportModal({ visible, onClose }: ICalImportProps) {
  const { state, dispatch } = useApp();
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [loading, setLoading] = useState(false);

  const colors = [
    '#6366f1', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#06b6d4', '#84cc16', '#f97316',
  ];

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'webcal:' || urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleImport = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a calendar URL');
      return;
    }

    if (!validateUrl(url)) {
      Alert.alert('Error', 'Please enter a valid calendar URL (webcal://, http://, or https://)');
      return;
    }

    setLoading(true);

    try {
      // Fetch and parse the iCal data
      console.log('Starting iCal import for URL:', url.trim());
      const icalData = await fetchICalData(url.trim());
      console.log('iCal data fetched, parsing...');
      
      const events = parseICalData(icalData);
      console.log('Parsed events:', events.length);

      if (events.length === 0) {
        Alert.alert('Warning', 'No events found in this calendar. The calendar may be empty or the format may not be supported.');
      }

      // Add the calendar import
      const newImport: ICalImportType = {
        url: url.trim(),
        name: name.trim() || `Calendar ${state.icalImports.length + 1}`,
        color,
        enabled: true,
      };

      dispatch({ type: 'ADD_ICAL_IMPORT', payload: newImport });

      // Add the events to the calendar
      events.forEach(event => {
        dispatch({ type: 'ADD_EVENT', payload: event });
      });

      // Reset form
      setUrl('');
      setName('');
      setColor('#6366f1');

      Alert.alert(
        'Success', 
        `Calendar imported successfully! Found ${events.length} events.`
      );
      onClose();
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert(
        'Error', 
        `Failed to import calendar: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the URL and try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleImport = (importUrl: string) => {
    const import_ = state.icalImports.find(imp => imp.url === importUrl);
    if (import_) {
      dispatch({
        type: 'UPDATE_ICAL_IMPORT',
        payload: { ...import_, enabled: !import_.enabled },
      });
    }
  };

  const refreshImport = async (importUrl: string) => {
    const import_ = state.icalImports.find(imp => imp.url === importUrl);
    if (!import_) return;

    setLoading(true);
    try {
      console.log('Refreshing calendar:', import_.name);
      const icalData = await fetchICalData(import_.url);
      const events = parseICalData(icalData);

      // Remove all existing iCal events to prevent duplicates
      const existingICalEvents = state.events.filter(event => event.source === 'ical');
      console.log(`Removing ${existingICalEvents.length} existing iCal events`);
      existingICalEvents.forEach(event => {
        dispatch({ type: 'DELETE_EVENT', payload: event.id });
      });

      // Add refreshed events
      events.forEach(event => {
        dispatch({ type: 'ADD_EVENT', payload: event });
      });

      Alert.alert('Success', `Calendar refreshed! Found ${events.length} events.`);
    } catch (error) {
      console.error('Refresh error:', error);
      Alert.alert('Error', 'Failed to refresh calendar. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeImport = (importUrl: string) => {
    Alert.alert(
      'Remove Calendar',
      'Are you sure you want to remove this calendar?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            dispatch({ type: 'REMOVE_ICAL_IMPORT', payload: importUrl });
          },
        },
      ]
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Import Calendar</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Add New Calendar</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Calendar URL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="webcal://example.com/calendar.ics"
                  value={url}
                  onChangeText={setUrl}
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Calendar Name (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="My Calendar"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Color</Text>
                <View style={styles.colorPicker}>
                  {colors.map(colorOption => (
                    <TouchableOpacity
                      key={colorOption}
                      style={[
                        styles.colorOption,
                        { backgroundColor: colorOption },
                        color === colorOption && styles.selectedColor,
                      ]}
                      onPress={() => setColor(colorOption)}
                    />
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.importButton, loading && styles.importButtonDisabled]}
                onPress={handleImport}
                disabled={loading}
              >
                {loading ? (
                  <Text style={styles.importButtonText}>Importing...</Text>
                ) : (
                  <Text style={styles.importButtonText}>Import Calendar</Text>
                )}
              </TouchableOpacity>
            </View>

            {state.icalImports.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Imported Calendars</Text>
                {state.icalImports.map((import_, index) => (
                  <View key={import_.url} style={styles.importItem}>
                    <View style={styles.importInfo}>
                      <View style={styles.importHeader}>
                        <View
                          style={[
                            styles.importColor,
                            { backgroundColor: import_.color },
                          ]}
                        />
                        <Text style={styles.importName}>{import_.name}</Text>
                      </View>
                      <Text style={styles.importUrl} numberOfLines={1}>
                        {import_.url}
                      </Text>
                    </View>
                    <View style={styles.importActions}>
                      <TouchableOpacity
                        style={styles.refreshButton}
                        onPress={() => refreshImport(import_.url)}
                        disabled={loading}
                      >
                        <Ionicons name="refresh" size={16} color="#10b981" />
                      </TouchableOpacity>
                      <Switch
                        value={import_.enabled}
                        onValueChange={() => toggleImport(import_.url)}
                        trackColor={{ false: '#e5e7eb', true: '#6366f1' }}
                        thumbColor={import_.enabled ? '#ffffff' : '#f3f4f6'}
                      />
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeImport(import_.url)}
                      >
                        <Ionicons name="trash" size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#1f2937',
  },
  importButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  importButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  importButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  importItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  importInfo: {
    flex: 1,
    marginRight: 12,
  },
  importHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  importColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  importName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  importUrl: {
    fontSize: 12,
    color: '#6b7280',
  },
  importActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  removeButton: {
    padding: 4,
  },
  refreshButton: {
    padding: 4,
    marginRight: 4,
  },
});
