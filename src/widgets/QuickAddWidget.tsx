import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';
import { CalendarEvent } from '../types';

interface QuickAddWidgetProps {
  onEventAdded?: (event: CalendarEvent) => void;
}

export default function QuickAddWidget({ onEventAdded }: QuickAddWidgetProps) {
  const { state, dispatch } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState('');
  const [allDay, setAllDay] = useState(false);

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const handleAddEvent = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for the event');
      return;
    }

    const startDate = new Date(date);
    let endDate = new Date(date);

    if (!allDay && time) {
      const [hours, minutes] = time.split(':').map(Number);
      startDate.setHours(hours, minutes, 0, 0);
      endDate.setHours(hours + 1, minutes, 0, 0);
    } else if (allDay) {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    const newEvent: CalendarEvent = {
      id: generateId(),
      title: title.trim(),
      startDate,
      endDate,
      allDay,
      color: '#6366f1',
      source: 'local',
    };

    dispatch({ type: 'ADD_EVENT', payload: newEvent });
    onEventAdded?.(newEvent);

    // Reset form
    setTitle('');
    setDate(new Date());
    setTime('');
    setAllDay(false);
    setModalVisible(false);

    Alert.alert('Success', 'Event added successfully!');
  };

  const openModal = () => {
    setDate(state.selectedDate);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#10b981', '#059669']}
        style={styles.gradient}
      >
        <TouchableOpacity style={styles.addButton} onPress={openModal}>
          <Ionicons name="add-circle" size={32} color="white" />
          <Text style={styles.addText}>Quick Add Event</Text>
        </TouchableOpacity>
      </LinearGradient>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Event</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Event title"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor="#9ca3af"
              />

              <View style={styles.dateTimeContainer}>
                <Text style={styles.label}>Date: {date.toLocaleDateString()}</Text>
                <Text style={styles.label}>Selected: {state.selectedDate.toLocaleDateString()}</Text>
              </View>

              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[styles.toggle, allDay && styles.toggleActive]}
                  onPress={() => setAllDay(!allDay)}
                >
                  <Text style={[styles.toggleText, allDay && styles.toggleTextActive]}>
                    All Day
                  </Text>
                </TouchableOpacity>
              </View>

              {!allDay && (
                <TextInput
                  style={styles.input}
                  placeholder="Time (HH:MM)"
                  value={time}
                  onChangeText={setTime}
                  placeholderTextColor="#9ca3af"
                />
              )}

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addButtonModal}
                  onPress={handleAddEvent}
                >
                  <Text style={styles.addButtonText}>Add Event</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
  form: {
    gap: 16,
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
  dateTimeContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
  },
  toggleContainer: {
    alignItems: 'center',
  },
  toggle: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
  },
  toggleActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  toggleText: {
    color: '#6b7280',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontWeight: '600',
  },
  addButtonModal: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#10b981',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
