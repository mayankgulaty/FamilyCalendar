export interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  color?: string;
  description?: string;
  location?: string;
  source?: 'local' | 'ical' | 'imported';
}

export interface Widget {
  id: string;
  type: 'weather' | 'notes' | 'quick-add' | 'upcoming-events';
  title: string;
  enabled: boolean;
  position: number;
  config?: Record<string, any>;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  location: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

export interface CalendarView {
  type: 'month' | 'week' | 'day';
  date: Date;
}

export interface ICalImport {
  url: string;
  name: string;
  color: string;
  enabled: boolean;
}
