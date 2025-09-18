import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';

interface CalendarStatsWidgetProps {
  onStatPress?: (stat: string) => void;
}

export default function CalendarStatsWidget({ onStatPress }: CalendarStatsWidgetProps) {
  const { state } = useApp();

  const getStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Filter events for current month
    const currentMonthEvents = state.events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
    });

    // Filter events for current week
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const currentWeekEvents = state.events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate >= startOfWeek && eventDate <= endOfWeek;
    });

    // Filter events for today
    const todayEvents = state.events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === now.toDateString();
    });

    // Count imported calendars
    const importedCalendars = state.icalImports.filter(imp => imp.enabled).length;

    // Count all-day events this month
    const allDayEvents = currentMonthEvents.filter(event => event.allDay).length;

    // Find busiest day this month
    const dayEventCounts: { [key: string]: number } = {};
    currentMonthEvents.forEach(event => {
      const dateKey = new Date(event.startDate).toDateString();
      dayEventCounts[dateKey] = (dayEventCounts[dateKey] || 0) + 1;
    });

    const busiestDay = Object.entries(dayEventCounts).reduce((max, [date, count]) => {
      return count > max.count ? { date, count } : max;
    }, { date: '', count: 0 });

    return {
      totalEvents: state.events.length,
      thisMonth: currentMonthEvents.length,
      thisWeek: currentWeekEvents.length,
      today: todayEvents.length,
      importedCalendars,
      allDayEvents,
      busiestDay: busiestDay.count > 0 ? busiestDay.count : 0,
    };
  };

  const stats = getStats();

  const StatItem = ({ icon, label, value, color }: {
    icon: string;
    label: string;
    value: string | number;
    color: string;
  }) => (
    <View style={styles.statItem}>
      <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#f59e0b', '#d97706']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="stats-chart" size={24} color="white" />
            <Text style={styles.title}>Calendar Stats</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.periodText}>
              {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatItem
            icon="calendar"
            label="Total Events"
            value={stats.totalEvents}
            color="#10b981"
          />
          <StatItem
            icon="calendar-outline"
            label="This Month"
            value={stats.thisMonth}
            color="#3b82f6"
          />
          <StatItem
            icon="today"
            label="This Week"
            value={stats.thisWeek}
            color="#8b5cf6"
          />
          <StatItem
            icon="time"
            label="Today"
            value={stats.today}
            color="#ef4444"
          />
          <StatItem
            icon="cloud"
            label="Imported"
            value={stats.importedCalendars}
            color="#06b6d4"
          />
          <StatItem
            icon="sunny"
            label="All Day"
            value={stats.allDayEvents}
            color="#f59e0b"
          />
        </View>

        {stats.busiestDay > 0 && (
          <View style={styles.busiestDayContainer}>
            <View style={styles.busiestDayIcon}>
              <Ionicons name="trophy" size={16} color="#f59e0b" />
            </View>
            <Text style={styles.busiestDayText}>
              Busiest day: {stats.busiestDay} events
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            📊 Your family calendar insights
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    flex: 1,
    minHeight: 300,
    height: '100%', // Take full height of parent
  },
  gradient: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  headerRight: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  periodText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  statsGrid: {
    flex: 1,
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  busiestDayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  busiestDayIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  busiestDayText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    marginTop: 12,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontStyle: 'italic',
  },
});
