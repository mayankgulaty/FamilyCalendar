import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';
import { useTextColors } from '../contexts/TextColorContext';
import { CalendarEvent } from '../types';
import EventDetailsModal from './EventDetailsModal';

interface WallCalendarViewProps {
  onEventPress: (event: CalendarEvent) => void;
  onDatePress: (date: Date) => void;
}

const { width, height } = Dimensions.get('window');

export default function WallCalendarView({ onEventPress, onDatePress }: WallCalendarViewProps) {
  const { state, dispatch } = useApp();
  const { textColors } = useTextColors();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const getMarkedDates = () => {
    const marked: any = {};
    
    state.events.forEach(event => {
      const dateKey = event.startDate.toISOString().split('T')[0];
      if (marked[dateKey]) {
        marked[dateKey].dots.push({
          color: event.color || '#6366f1',
          selectedDotColor: '#ffffff'
        });
        marked[dateKey].marked = true;
      } else {
        marked[dateKey] = {
          dots: [{
            color: event.color || '#6366f1',
            selectedDotColor: '#ffffff'
          }],
          marked: true
        };
      }
    });

    // Highlight today
    const today = new Date().toISOString().split('T')[0];
    if (marked[today]) {
      marked[today].selected = true;
      marked[today].selectedColor = '#6366f1';
    } else {
      marked[today] = {
        selected: true,
        selectedColor: '#6366f1',
        selectedTextColor: '#ffffff'
      };
    }

    return marked;
  };

  const onDayPress = (day: DateData) => {
    const selectedDate = new Date(day.year, day.month - 1, day.day);
    dispatch({ type: 'SET_SELECTED_DATE', payload: selectedDate });
    onDatePress(selectedDate);
  };

  const onMonthChange = (month: DateData) => {
    const newMonth = new Date(month.year, month.month - 1, 1);
    setCurrentMonth(newMonth);
  };

  const getEventsForDate = (date: Date) => {
    return state.events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const handleEventPress = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEventModalVisible(true);
  };

  const handleCloseModal = () => {
    setEventModalVisible(false);
    setSelectedEvent(null);
  };

  const handleEventSave = (updatedEvent: CalendarEvent) => {
    dispatch({ type: 'UPDATE_EVENT', payload: updatedEvent });
    setEventModalVisible(false);
    setSelectedEvent(null);
  };

  const handleEventDelete = (eventId: string) => {
    dispatch({ type: 'DELETE_EVENT', payload: eventId });
    setEventModalVisible(false);
    setSelectedEvent(null);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const todayEvents = getEventsForDate(state.selectedDate);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      {/* Time and Date Overlay */}
      <View style={styles.timeDateOverlay}>
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        <Text style={styles.dateText}>{formatDate(currentTime)}</Text>
      </View>

      {/* Weather Widget Overlay */}
      <View style={styles.weatherOverlay}>
        <View style={styles.currentWeather}>
          <Text style={styles.temperature}>49°</Text>
          <Ionicons name="cloudy" size={24} color="white" />
          <Text style={styles.feelsLike}>Feels like 40°</Text>
        </View>
        
        <View style={styles.forecast}>
          <View style={styles.forecastDay}>
            <Text style={styles.forecastLabel}>Today</Text>
            <Ionicons name="rainy" size={16} color="white" />
            <Text style={styles.forecastTemp}>49 40</Text>
          </View>
          <View style={styles.forecastDay}>
            <Text style={styles.forecastLabel}>Wed</Text>
            <Ionicons name="rainy" size={16} color="white" />
            <Text style={styles.forecastTemp}>49 39</Text>
          </View>
          <View style={styles.forecastDay}>
            <Text style={styles.forecastLabel}>Thu</Text>
            <Ionicons name="sunny" size={16} color="white" />
            <Text style={styles.forecastTemp}>56 36</Text>
          </View>
          <View style={styles.forecastDay}>
            <Text style={styles.forecastLabel}>Fri</Text>
            <Ionicons name="sunny" size={16} color="white" />
            <Text style={styles.forecastTemp}>63 38</Text>
          </View>
        </View>
      </View>

      {/* Calendar Section */}
      <View style={styles.calendarSection}>
        <Calendar
          current={currentMonth.toISOString().split('T')[0]}
          onDayPress={onDayPress}
          onMonthChange={onMonthChange}
          markedDates={getMarkedDates()}
          theme={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            calendarBackground: 'rgba(0, 0, 0, 0.8)',
            textSectionTitleColor: '#ffffff',
            selectedDayBackgroundColor: '#6366f1',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#6366f1',
            dayTextColor: '#ffffff',
            textDisabledColor: '#666666',
            dotColor: '#6366f1',
            selectedDotColor: '#ffffff',
            arrowColor: '#ffffff',
            disabledArrowColor: '#666666',
            monthTextColor: '#ffffff',
            indicatorColor: '#6366f1',
            textDayFontWeight: '600',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '600',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14,
          }}
          style={styles.calendar}
        />

        {/* Today's Events */}
        {todayEvents.length > 0 && (
          <View style={styles.todayEventsContainer}>
            <Text style={styles.todayEventsTitle}>Today's Events</Text>
            <ScrollView style={styles.eventsList} showsVerticalScrollIndicator={false}>
              {todayEvents.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventItem}
                  onPress={() => handleEventPress(event)}
                >
                  <View style={[styles.eventDot, { backgroundColor: event.color || '#6366f1' }]} />
                  <View style={styles.eventDetails}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventTime}>
                      {event.allDay 
                        ? 'All Day' 
                        : event.startDate.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })
                      }
                    </Text>
                    {event.location && (
                      <Text style={styles.eventLocation}>{event.location}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

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
  },
  timeDateOverlay: {
    position: 'absolute',
    top: 100,
    left: 20,
    zIndex: 10,
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  dateText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  weatherOverlay: {
    position: 'absolute',
    top: 100,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    padding: 16,
    minWidth: 120,
  },
  currentWeather: {
    alignItems: 'center',
    marginBottom: 12,
  },
  temperature: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  feelsLike: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  forecast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  forecastDay: {
    alignItems: 'center',
    marginHorizontal: 4,
  },
  forecastLabel: {
    fontSize: 10,
    color: 'white',
    marginBottom: 4,
  },
  forecastTemp: {
    fontSize: 10,
    color: 'white',
    marginTop: 2,
  },
  calendarSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.65,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
  },
  calendar: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  todayEventsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  todayEventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  eventsList: {
    flex: 1,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  eventDetails: {
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
  },
  eventLocation: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
});
