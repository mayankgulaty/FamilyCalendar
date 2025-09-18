import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
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
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Get current month dates
  const getCurrentMonthDates = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday
    
    const dates = [];
    const current = new Date(startDate);
    
    // Generate 6 weeks (42 days)
    for (let i = 0; i < 42; i++) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
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

  const monthDates = getCurrentMonthDates();
  const today = new Date();
  const todayEvents = getEventsForDate(today);

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
        {/* Month Header */}
        <View style={styles.monthHeader}>
          <Text style={styles.monthText}>
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
        </View>

        {/* Days of Week Header */}
        <View style={styles.daysOfWeek}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Text key={day} style={styles.dayHeader}>{day}</Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {monthDates.map((date, index) => {
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isToday = date.toDateString() === today.toDateString();
            const dateEvents = getEventsForDate(date);
            
            return (
              <View key={index} style={styles.dateCell}>
                {/* Date Number */}
                <View style={[styles.dateNumber, isToday && styles.todayDateNumber]}>
                  <Text style={[
                    styles.dateText,
                    !isCurrentMonth && styles.otherMonthDate,
                    isToday && styles.todayDateText
                  ]}>
                    {date.getDate()}
                  </Text>
                  {dateEvents.length > 0 && (
                    <View style={styles.eventDots}>
                      {dateEvents.slice(0, 3).map((_, eventIndex) => (
                        <View 
                          key={eventIndex} 
                          style={[
                            styles.eventDot, 
                            { backgroundColor: dateEvents[eventIndex].color || '#6366f1' }
                          ]} 
                        />
                      ))}
                    </View>
                  )}
                </View>

                {/* Events for this date */}
                {dateEvents.length > 0 && (
                  <View style={styles.eventsContainer}>
                    {dateEvents.slice(0, 2).map((event) => (
                      <TouchableOpacity
                        key={event.id}
                        style={styles.eventSquare}
                        onPress={() => handleEventPress(event)}
                      >
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
                        <Text style={styles.eventTitle} numberOfLines={2}>
                          {event.title}
                        </Text>
                        {event.location && (
                          <Text style={styles.eventLocation} numberOfLines={1}>
                            {event.location}
                          </Text>
                        )}
                      </TouchableOpacity>
                    ))}
                    {dateEvents.length > 2 && (
                      <View style={styles.moreEvents}>
                        <Text style={styles.moreEventsText}>
                          +{dateEvents.length - 2} more
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
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
    top: 60,
    left: 20,
    zIndex: 10,
  },
  timeText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  dateText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginTop: 4,
  },
  weatherOverlay: {
    position: 'absolute',
    top: 60,
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
    fontSize: 28,
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
    height: height * 0.7,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  monthHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  monthText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  daysOfWeek: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  dateCell: {
    width: '14.28%', // 100% / 7 days
    minHeight: 80,
    padding: 2,
  },
  dateNumber: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  todayDateNumber: {
    backgroundColor: '#6366f1',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  otherMonthDate: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  todayDateText: {
    color: 'white',
    fontWeight: 'bold',
  },
  eventDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 2,
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 1,
  },
  eventsContainer: {
    flex: 1,
  },
  eventSquare: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 6,
    marginBottom: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#6366f1',
  },
  eventTime: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  eventTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  moreEvents: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
    padding: 4,
    alignItems: 'center',
  },
  moreEventsText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});