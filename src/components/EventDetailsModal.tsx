import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CalendarEvent } from '../types';

interface EventDetailsModalProps {
  visible: boolean;
  event: CalendarEvent | null;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
}

export default function EventDetailsModal({
  visible,
  event,
  onClose,
  onSave,
  onDelete,
}: EventDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState<CalendarEvent | null>(null);

  React.useEffect(() => {
    if (event) {
      setEditedEvent({ ...event });
      setIsEditing(false);
    }
  }, [event]);

  const handleSave = () => {
    if (editedEvent) {
      onSave(editedEvent);
      setIsEditing(false);
      onClose();
    }
  };

  const handleDelete = () => {
    if (event) {
      Alert.alert(
        'Delete Event',
        `Are you sure you want to delete "${event.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              onDelete(event.id);
              onClose();
            },
          },
        ]
      );
    }
  };

  const handleCancel = () => {
    setEditedEvent(event ? { ...event } : null);
    setIsEditing(false);
  };

  const updateEvent = (field: keyof CalendarEvent, value: any) => {
    if (editedEvent) {
      setEditedEvent({ ...editedEvent, [field]: value });
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!event || !editedEvent) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <LinearGradient
            colors={[editedEvent.color || '#6366f1', editedEvent.color || '#8b5cf6']}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <Ionicons name="calendar" size={24} color="white" />
                <Text style={styles.headerTitle}>Event Details</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Event Title */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Title</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedEvent.title}
                  onChangeText={(text) => updateEvent('title', text)}
                  placeholder="Event title"
                />
              ) : (
                <Text style={styles.eventTitle}>{event.title}</Text>
              )}
            </View>

            {/* Date & Time */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Date & Time</Text>
              <View style={styles.dateTimeContainer}>
                <View style={styles.dateTimeItem}>
                  <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                  <Text style={styles.dateTimeText}>
                    {formatDate(event.startDate)}
                  </Text>
                </View>
                {!event.allDay && (
                  <View style={styles.dateTimeItem}>
                    <Ionicons name="time-outline" size={20} color="#6b7280" />
                    <Text style={styles.dateTimeText}>
                      {formatTime(event.startDate)} - {formatTime(event.endDate)}
                    </Text>
                  </View>
                )}
                {event.allDay && (
                  <View style={styles.dateTimeItem}>
                    <Ionicons name="sunny-outline" size={20} color="#6b7280" />
                    <Text style={styles.dateTimeText}>All Day</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Location */}
            {(event.location || isEditing) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Location</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={editedEvent.location || ''}
                    onChangeText={(text) => updateEvent('location', text)}
                    placeholder="Event location"
                  />
                ) : (
                  event.location && (
                    <View style={styles.locationContainer}>
                      <Ionicons name="location-outline" size={20} color="#6b7280" />
                      <Text style={styles.locationText}>{event.location}</Text>
                    </View>
                  )
                )}
              </View>
            )}

            {/* Description */}
            {(event.description || isEditing) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={editedEvent.description || ''}
                    onChangeText={(text) => updateEvent('description', text)}
                    placeholder="Event description"
                    multiline
                    numberOfLines={4}
                  />
                ) : (
                  event.description && (
                    <Text style={styles.description}>{event.description}</Text>
                  )
                )}
              </View>
            )}

            {/* All Day Toggle */}
            {isEditing && (
              <View style={styles.section}>
                <View style={styles.toggleContainer}>
                  <Text style={styles.sectionTitle}>All Day Event</Text>
                  <Switch
                    value={editedEvent.allDay || false}
                    onValueChange={(value) => updateEvent('allDay', value)}
                    trackColor={{ false: '#e5e7eb', true: '#6366f1' }}
                    thumbColor={editedEvent.allDay ? '#ffffff' : '#f3f4f6'}
                  />
                </View>
              </View>
            )}

            {/* Source */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Source</Text>
              <View style={styles.sourceContainer}>
                <Ionicons
                  name={event.source === 'ical' ? 'cloud-outline' : 'create-outline'}
                  size={20}
                  color="#6b7280"
                />
                <Text style={styles.sourceText}>
                  {event.source === 'ical' ? 'Imported Calendar' : 'Local Event'}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {isEditing ? (
              <>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {event.source !== 'ical' && (
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setIsEditing(true)}
                  >
                    <Ionicons name="create-outline" size={20} color="#6366f1" />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                )}
                {event.source !== 'ical' && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDelete}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
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
    borderRadius: 20,
    width: '95%',
    maxWidth: 500,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    paddingTop: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    lineHeight: 32,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateTimeContainer: {
    gap: 8,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#6b7280',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 16,
    color: '#6b7280',
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sourceText: {
    fontSize: 16,
    color: '#6b7280',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
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
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#6366f1',
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6366f1',
    gap: 8,
  },
  editButtonText: {
    color: '#6366f1',
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
    gap: 8,
  },
  deleteButtonText: {
    color: '#ef4444',
    fontWeight: '600',
  },
});
