import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';
import { useTextColors } from '../contexts/TextColorContext';
import { CalendarEvent } from '../types';
import EventDetailsModal from './EventDetailsModal';

interface CalendarViewProps {
  onEventPress: (event: CalendarEvent) => void;
  onDatePress: (date: Date) => void;
}

const { width } = Dimensions.get('window');

export default function CalendarView({ onEventPress, onDatePress }: CalendarViewProps) {
  const { state, dispatch } = useApp();
  const { textColors } = useTextColors();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const getMarkedDates = () => {
    const marked: any = {};
    
    state.events.forEach(event => {
      const dateKey = event.startDate.toISOString().split('T')[0];
      if (!marked[dateKey]) {
        marked[dateKey] = {
          marked: true,
          dots: [],
        };
      }
      marked[dateKey].dots.push({
        color: event.color || '#6366f1',
        selectedDotColor: event.color || '#6366f1',
      });
    });

    // Mark selected date
    const selectedDateKey = state.selectedDate.toISOString().split('T')[0];
    if (marked[selectedDateKey]) {
      marked[selectedDateKey].selected = true;
      marked[selectedDateKey].selectedColor = '#6366f1';
    } else {
      marked[selectedDateKey] = {
        selected: true,
        selectedColor: '#6366f1',
      };
    }

    return marked;
  };

  const getEventsForDate = (date: Date) => {
    return state.events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const onDayPress = (day: DateData) => {
    const selectedDate = new Date(day.dateString);
    dispatch({ type: 'SET_SELECTED_DATE', payload: selectedDate });
    onDatePress(selectedDate);
  };

  const handleEventPress = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEventModalVisible(true);
    onEventPress(event);
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

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh - in a real app, this would sync with external calendars
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const onMonthChange = (month: DateData) => {
    setCurrentMonth(new Date(month.dateString));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const todayEvents = getEventsForDate(state.selectedDate);

  return (
    <View style={styles.container}>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6366f1']}
            tintColor="#6366f1"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.calendarContainer}>
          <Calendar
            current={currentMonth.toISOString().split('T')[0]}
            onDayPress={onDayPress}
            onMonthChange={onMonthChange}
            markedDates={getMarkedDates()}
            theme={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              calendarBackground: 'rgba(255, 255, 255, 0.1)',
              textSectionTitleColor: '#000000',
              selectedDayBackgroundColor: '#6366f1',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#6366f1',
              dayTextColor: '#000000',
              textDisabledColor: '#666666',
              dotColor: '#6366f1',
              selectedDotColor: '#ffffff',
              arrowColor: '#000000',
              disabledArrowColor: '#999999',
              monthTextColor: '#000000',
              indicatorColor: '#6366f1',
              textDayFontWeight: '700',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '700',
              textDayFontSize: 18,
              textMonthFontSize: 20,
              textDayHeaderFontSize: 16,
            }}
            style={styles.calendar}
          />
        </View>

        {todayEvents.length > 0 && (
          <View style={styles.eventsContainer}>
            <Text style={styles.eventsTitle}>
              Events for {state.selectedDate.toLocaleDateString()}
            </Text>
            <View style={styles.eventsList}>
              {todayEvents.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={[styles.eventItem, { borderLeftColor: event.color || '#6366f1' }]}
                  onPress={() => handleEventPress(event)}
                >
                  <View style={styles.eventContent}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    {event.startDate && (
                      <Text style={styles.eventTime}>
                        {event.allDay 
                          ? 'All Day' 
                          : event.startDate.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })
                        }
                      </Text>
                    )}
                    {event.location && (
                      <Text style={styles.eventLocation}>{event.location}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollContainer: {
    flex: 1,
  },
  calendarContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    margin: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  calendar: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    // Add text shadow for better readability
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 0,
  },
  eventsContainer: {
    margin: 16,
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  eventsList: {
    maxHeight: 200,
  },
  eventItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
