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

  // Get current month dates only
  const getCurrentMonthDates = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday
    
    const dates = [];
    const current = new Date(startDate);
    
    // Generate 6 weeks (42 days) but filter to show only current month
    for (let i = 0; i < 42; i++) {
      const date = new Date(current);
      if (date.getMonth() === month) {
        dates.push(date);
      } else {
        dates.push(null); // Placeholder for empty cells
      }
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
      {/* Top Section - Time/Date and Weather */}
      <View style={styles.topSection}>
        {/* Time and Date Section */}
        <View style={styles.timeDateSection}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.dateText}>{formatDate(currentTime)}</Text>
        </View>

        {/* Weather Section */}
        <View style={styles.weatherSection}>
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
            // Skip empty cells (null dates)
            if (!date) {
              return <View key={index} style={styles.emptyCell} />;
            }
            
            const isToday = date.toDateString() === today.toDateString();
            const dateEvents = getEventsForDate(date);
            const isLastRow = index >= 35; // Last 7 cells (6th row)
            const isLastColumn = (index + 1) % 7 === 0; // Rightmost column
            
            return (
              <View key={index} style={[
                styles.dateCell,
                isLastRow && styles.lastRowCell,
                isLastColumn && styles.lastColumnCell
              ]}>
                {/* Date Header */}
                <View style={styles.dateHeader}>
                  <View style={[styles.dateNumber, isToday && styles.todayDateNumber]}>
                    <Text style={[
                      styles.dateText,
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
                </View>

                {/* Events for this date */}
                <View style={styles.eventsContainer}>
                  {dateEvents.slice(0, 3).map((event, eventIndex) => {
                    // Calculate available space and adjust event height
                    const availableHeight = 160 - 28 - 2 - 6 - 6; // Total - header - margin - padding
                    const eventSpacing = 3;
                    const maxEventHeight = Math.floor((availableHeight - (eventSpacing * 2)) / 3); // Divide by 3 events max
                    
                    return (
                      <TouchableOpacity
                        key={event.id}
                        style={[
                          styles.eventSquare, 
                          { 
                            borderLeftColor: event.color || '#6366f1',
                            marginBottom: eventIndex < 2 ? eventSpacing : 0,
                            height: Math.max(24, maxEventHeight)
                          }
                        ]}
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
                        <Text style={styles.eventTitle} numberOfLines={1}>
                          {event.title}
                        </Text>
                        {event.location && maxEventHeight > 30 && (
                          <Text style={styles.eventLocation} numberOfLines={1}>
                            {event.location}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                  {dateEvents.length > 3 && (
                    <View style={[styles.moreEvents, { height: 20 }]}>
                      <Text style={styles.moreEventsText}>
                        +{dateEvents.length - 3} more
                      </Text>
                    </View>
                  )}
                </View>
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
  topSection: {
    position: 'absolute',
    top: 120,
    left: 12,
    right: 12,
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  timeDateSection: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 14,
    padding: 10,
    marginRight: 4,
    height: 60,
    justifyContent: 'center',
  },
  weatherSection: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 14,
    padding: 8,
    marginLeft: 4,
    height: 60,
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    lineHeight: 28,
  },
  dateText: {
    fontSize: 11,
    color: 'white',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginTop: 1,
    lineHeight: 13,
  },
  currentWeather: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },
  temperature: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 3,
  },
  feelsLike: {
    fontSize: 7,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 1,
  },
  forecast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  forecastDay: {
    alignItems: 'center',
    marginHorizontal: 2,
  },
  forecastLabel: {
    fontSize: 8,
    color: 'white',
    marginBottom: 2,
  },
  forecastTemp: {
    fontSize: 8,
    color: 'white',
    marginTop: 2,
  },
  calendarSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.82,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  monthHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  monthText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  daysOfWeek: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  dateCell: {
    width: '14.28%', // 100% / 7 days
    minHeight: 160,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    justifyContent: 'flex-start',
  },
  emptyCell: {
    width: '14.28%', // 100% / 7 days
    minHeight: 160,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  lastRowCell: {
    borderBottomWidth: 0,
  },
  lastColumnCell: {
    borderRightWidth: 0,
  },
  dateHeader: {
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  dateNumber: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 32,
  },
  todayDateNumber: {
    backgroundColor: '#6366f1',
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  otherMonthDate: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  todayDateText: {
    color: 'white',
    fontWeight: 'bold',
  },
  eventDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginLeft: 4,
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginHorizontal: 1,
  },
  eventsContainer: {
    flex: 1,
    paddingTop: 0,
    justifyContent: 'flex-start',
  },
  eventSquare: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 4,
    padding: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#6366f1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 1,
    minHeight: 24,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  eventTime: {
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 0,
    fontWeight: '500',
  },
  eventTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    marginBottom: 0,
    lineHeight: 12,
  },
  eventLocation: {
    fontSize: 7,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 9,
  },
  moreEvents: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    padding: 6,
    alignItems: 'center',
    marginTop: 2,
  },
  moreEventsText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
});