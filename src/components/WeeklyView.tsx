import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';
import { CalendarEvent } from '../types';
import EventDetailsModal from './EventDetailsModal';
import { fetchICalData, parseICalData } from '../utils/icalParser';

interface WeeklyViewProps {
  onEventPress: (event: CalendarEvent) => void;
}

const { width } = Dimensions.get('window');

export default function WeeklyView({ onEventPress }: WeeklyViewProps) {
  const { state, dispatch } = useApp();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const lastRefreshRef = useRef<number>(0);

  // Get the start of the week (Monday)
  const getWeekStart = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    const weekStart = new Date(date.setDate(diff));
    return new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
  };

  // Get all days in the current week
  const getWeekDays = () => {
    const weekStart = getWeekStart(new Date(currentWeek));
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return state.events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Navigate to previous/next week
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  // Go to current week
  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
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

  // Auto-refresh functionality
  const refreshAllCalendars = async () => {
    // Throttle refreshes to prevent too frequent calls
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshRef.current;
    const minRefreshInterval = 30000; // 30 seconds minimum between refreshes
    
    if (timeSinceLastRefresh < minRefreshInterval) {
      console.log(`Skipping refresh - too soon (${Math.round(timeSinceLastRefresh / 1000)}s ago)`);
      return;
    }
    
    lastRefreshRef.current = now;
    setRefreshing(true);
    try {
      console.log('Auto-refreshing all imported calendars...');
      
      // First, remove all existing iCal events to prevent duplicates
      const existingICalEvents = state.events.filter(event => event.source === 'ical');
      console.log(`Removing ${existingICalEvents.length} existing iCal events`);
      existingICalEvents.forEach(event => {
        dispatch({ type: 'DELETE_EVENT', payload: event.id });
      });
      
      // Then refresh all enabled iCal imports and add their events
      let totalEvents = 0;
      for (const icalImport of state.icalImports) {
        if (icalImport.enabled) {
          try {
            console.log('Refreshing calendar:', icalImport.name);
            const icalData = await fetchICalData(icalImport.url);
            const events = parseICalData(icalData);

            // Add refreshed events
            events.forEach(event => {
              dispatch({ type: 'ADD_EVENT', payload: event });
            });

            totalEvents += events.length;
            console.log(`Refreshed ${icalImport.name}: ${events.length} events`);
          } catch (error) {
            console.error(`Failed to refresh ${icalImport.name}:`, error);
          }
        }
      }
      
      console.log(`Auto-refresh completed: ${totalEvents} total events added`);
    } catch (error) {
      console.error('Auto-refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Auto-refresh on component mount and when currentWeek changes
  useEffect(() => {
    // Only auto-refresh if there are imported calendars
    if (state.icalImports.some(imp => imp.enabled)) {
      refreshAllCalendars();
    }
  }, [currentWeek]);

  // Auto-refresh every 10 minutes when component is mounted
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.icalImports.some(imp => imp.enabled)) {
        refreshAllCalendars();
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [state.icalImports]);

  const weekDays = getWeekDays();
  const today = new Date();

  const formatDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const formatDayNumber = (date: Date) => {
    return date.getDate().toString();
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isCurrentWeek = () => {
    const currentWeekStart = getWeekStart(new Date());
    const viewWeekStart = getWeekStart(new Date(currentWeek));
    return currentWeekStart.toDateString() === viewWeekStart.toDateString();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigateWeek('prev')}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle}>
                Week of {weekDays[0].toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })} - {weekDays[6].toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>
              {refreshing && (
                <Ionicons 
                  name="refresh" 
                  size={16} 
                  color="rgba(255, 255, 255, 0.8)" 
                  style={styles.refreshIcon}
                />
              )}
            </View>
            {!isCurrentWeek() && (
              <TouchableOpacity
                style={styles.todayButton}
                onPress={goToCurrentWeek}
              >
                <Text style={styles.todayButtonText}>Today</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigateWeek('next')}
          >
            <Ionicons name="chevron-forward" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Week Grid */}
      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshAllCalendars}
            colors={['#6366f1']}
            tintColor="#6366f1"
          />
        }
      >
        <View style={styles.weekGrid}>
          {weekDays.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isTodayDate = isToday(day);
            
            return (
              <View key={index} style={styles.dayColumn}>
                {/* Day Header */}
                <View style={[
                  styles.dayHeader,
                  isTodayDate && styles.todayHeader
                ]}>
                  <Text style={[
                    styles.dayName,
                    isTodayDate && styles.todayText
                  ]}>
                    {formatDayName(day)}
                  </Text>
                  <Text style={[
                    styles.dayNumber,
                    isTodayDate && styles.todayText
                  ]}>
                    {formatDayNumber(day)}
                  </Text>
                </View>

                {/* Events */}
                <ScrollView 
                  style={styles.eventsColumn}
                  showsVerticalScrollIndicator={false}
                >
                  {dayEvents.length === 0 ? (
                    <View style={styles.emptyDay}>
                      <Text style={styles.emptyDayText}>No events</Text>
                    </View>
                  ) : (
                    dayEvents.map((event) => (
                      <TouchableOpacity
                        key={event.id}
                        style={[
                          styles.eventCard,
                          { borderLeftColor: event.color || '#6366f1' }
                        ]}
                        onPress={() => handleEventPress(event)}
                      >
                        <Text style={styles.eventTitle} numberOfLines={2}>
                          {event.title}
                        </Text>
                        {!event.allDay && (
                          <Text style={styles.eventTime}>
                            {event.startDate.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </Text>
                        )}
                        {event.allDay && (
                          <Text style={styles.eventTime}>All Day</Text>
                        )}
                        {event.location && (
                          <Text style={styles.eventLocation} numberOfLines={1}>
                            📍 {event.location}
                          </Text>
                        )}
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>
            );
          })}
        </View>
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
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refreshIcon: {
    opacity: 0.8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  todayButton: {
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  todayButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  navButton: {
    padding: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  weekGrid: {
    flexDirection: 'row',
    padding: 8,
    minHeight: '100%',
  },
  dayColumn: {
    flex: 1,
    marginHorizontal: 2,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dayHeader: {
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  todayHeader: {
    backgroundColor: '#6366f1',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 2,
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  todayText: {
    color: 'white',
  },
  eventsColumn: {
    flex: 1,
    padding: 8,
  },
  emptyDay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyDayText: {
    color: '#9ca3af',
    fontSize: 12,
    fontStyle: 'italic',
  },
  eventCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    borderLeftWidth: 3,
  },
  eventTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 10,
    color: '#9ca3af',
  },
});
