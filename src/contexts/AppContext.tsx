import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalendarEvent, Widget, ICalImport, CalendarView } from '../types';
import { fetchICalData, parseICalData } from '../utils/icalParser';

interface AppState {
  events: CalendarEvent[];
  widgets: Widget[];
  icalImports: ICalImport[];
  currentView: CalendarView;
  selectedDate: Date;
}

type AppAction =
  | { type: 'ADD_EVENT'; payload: CalendarEvent }
  | { type: 'UPDATE_EVENT'; payload: CalendarEvent }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'SET_EVENTS'; payload: CalendarEvent[] }
  | { type: 'ADD_WIDGET'; payload: Widget }
  | { type: 'UPDATE_WIDGET'; payload: Widget }
  | { type: 'REMOVE_WIDGET'; payload: string }
  | { type: 'SET_WIDGETS'; payload: Widget[] }
  | { type: 'ADD_ICAL_IMPORT'; payload: ICalImport }
  | { type: 'UPDATE_ICAL_IMPORT'; payload: ICalImport }
  | { type: 'REMOVE_ICAL_IMPORT'; payload: string }
  | { type: 'SET_ICAL_IMPORTS'; payload: ICalImport[] }
  | { type: 'SET_CURRENT_VIEW'; payload: CalendarView }
  | { type: 'SET_SELECTED_DATE'; payload: Date };

const initialState: AppState = {
  events: [],
  widgets: [
    { id: 'weather', type: 'weather', title: 'Weather', enabled: true, position: 0 },
    { id: 'quick-add', type: 'quick-add', title: 'Quick Add', enabled: true, position: 1 },
    { id: 'upcoming-events', type: 'upcoming-events', title: 'Upcoming Events', enabled: true, position: 2 },
  ],
  icalImports: [],
  currentView: { type: 'month', date: new Date() },
  selectedDate: new Date(),
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.payload] };
    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map(event =>
          event.id === action.payload.id ? action.payload : event
        ),
      };
    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter(event => event.id !== action.payload),
      };
    case 'SET_EVENTS':
      return { ...state, events: action.payload };
    case 'ADD_WIDGET':
      return { ...state, widgets: [...state.widgets, action.payload] };
    case 'UPDATE_WIDGET':
      return {
        ...state,
        widgets: state.widgets.map(widget =>
          widget.id === action.payload.id ? action.payload : widget
        ),
      };
    case 'REMOVE_WIDGET':
      return {
        ...state,
        widgets: state.widgets.filter(widget => widget.id !== action.payload),
      };
    case 'SET_WIDGETS':
      return { ...state, widgets: action.payload };
    case 'ADD_ICAL_IMPORT':
      return { ...state, icalImports: [...state.icalImports, action.payload] };
    case 'UPDATE_ICAL_IMPORT':
      return {
        ...state,
        icalImports: state.icalImports.map(import_ =>
          import_.url === action.payload.url ? action.payload : import_
        ),
      };
    case 'REMOVE_ICAL_IMPORT':
      return {
        ...state,
        icalImports: state.icalImports.filter(import_ => import_.url !== action.payload),
      };
    case 'SET_ICAL_IMPORTS':
      return { ...state, icalImports: action.payload };
    case 'SET_CURRENT_VIEW':
      return { ...state, currentView: action.payload };
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from AsyncStorage on app start
  useEffect(() => {
    const loadData = async () => {
      try {
        const [events, widgets, icalImports] = await Promise.all([
          AsyncStorage.getItem('events'),
          AsyncStorage.getItem('widgets'),
          AsyncStorage.getItem('icalImports'),
        ]);

        if (events) {
          const parsedEvents = JSON.parse(events).map((event: any) => ({
            ...event,
            startDate: new Date(event.startDate),
            endDate: new Date(event.endDate),
          }));
          dispatch({ type: 'SET_EVENTS', payload: parsedEvents });
        }

        if (widgets) {
          dispatch({ type: 'SET_WIDGETS', payload: JSON.parse(widgets) });
        }

        if (icalImports) {
          dispatch({ type: 'SET_ICAL_IMPORTS', payload: JSON.parse(icalImports) });
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Save data to AsyncStorage whenever state changes
  useEffect(() => {
    const saveData = async () => {
      try {
        await Promise.all([
          AsyncStorage.setItem('events', JSON.stringify(state.events)),
          AsyncStorage.setItem('widgets', JSON.stringify(state.widgets)),
          AsyncStorage.setItem('icalImports', JSON.stringify(state.icalImports)),
        ]);
      } catch (error) {
        console.error('Error saving data:', error);
      }
    };

    saveData();
  }, [state.events, state.widgets, state.icalImports]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
