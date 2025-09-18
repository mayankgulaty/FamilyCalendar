import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';
import { CalendarEvent } from '../types';
import EventDetailsModal from '../components/EventDetailsModal';

interface UpcomingEventsWidgetProps {
  onEventPress?: (event: CalendarEvent) => void;
}

export default function UpcomingEventsWidget({ onEventPress }: UpcomingEventsWidgetProps) {
  const { state, dispatch } = useApp();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventModalVisible, setEventModalVisible] = useState(false);

  const getUpcomingEvents = () => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return state.events
      .filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate >= now && eventDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 5); // Show only next 5 events
  };

  const handleEventPress = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEventModalVisible(true);
    onEventPress?.(event);
  };

  const handleEventSave = (updatedEvent: CalendarEvent) => {
    dispatch({ type: 'UPDATE_EVENT', payload: updatedEvent });
  };

  const handleEventDelete = (eventId: string) => {
    dispatch({ type: 'DELETE_EVENT', payload: eventId });
  };

  const handleCloseModal = () => {
    setEventModalVisible(false);
    setSelectedEvent(null);
  };

  const upcomingEvents = getUpcomingEvents();

  const formatEventTime = (event: CalendarEvent) => {
    if (event.allDay) {
      return 'All Day';
    }
    
    const eventDate = new Date(event.startDate);
    const now = new Date();
    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today at ${eventDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else if (diffDays === 1) {
      return `Tomorrow at ${eventDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else {
      return `${eventDate.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric' 
      })} at ${eventDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#8b5cf6', '#7c3aed']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Upcoming Events</Text>
          <Ionicons name="calendar" size={20} color="white" />
        </View>

        <ScrollView style={styles.eventsList} showsVerticalScrollIndicator={false}>
          {upcomingEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={32} color="rgba(255, 255, 255, 0.7)" />
              <Text style={styles.emptyText}>No upcoming events</Text>
            </View>
          ) : (
            upcomingEvents.map((event, index) => (
              <TouchableOpacity
                key={event.id}
                style={[
                  styles.eventItem,
                  index === upcomingEvents.length - 1 && styles.lastEventItem
                ]}
                onPress={() => handleEventPress(event)}
              >
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle} numberOfLines={1}>
                    {event.title}
                  </Text>
                  <Text style={styles.eventTime}>
                    {formatEventTime(event)}
                  </Text>
                  {event.location && (
                    <Text style={styles.eventLocation} numberOfLines={1}>
                      📍 {event.location}
                    </Text>
                  )}
                </View>
                <View style={styles.eventIndicator}>
                  <View 
                    style={[
                      styles.eventDot, 
                      { backgroundColor: event.color || '#6366f1' }
                    ]} 
                  />
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* Event Details Modal */}
        <EventDetailsModal
          visible={eventModalVisible}
          event={selectedEvent}
          onClose={handleCloseModal}
          onSave={handleEventSave}
          onDelete={handleEventDelete}
        />
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
  eventsList: {
    maxHeight: 200,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    fontSize: 14,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginBottom: 8,
  },
  lastEventItem: {
    marginBottom: 0,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  eventIndicator: {
    marginLeft: 8,
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
