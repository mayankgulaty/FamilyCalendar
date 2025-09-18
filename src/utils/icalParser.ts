import { CalendarEvent } from '../types';

export interface ICalEvent {
  summary: string;
  start: string;
  end?: string;
  description?: string;
  location?: string;
  allDay?: boolean;
}

export function parseICalData(icalData: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const lines = icalData.split('\n');
  
  let currentEvent: Partial<ICalEvent> = {};
  let inEvent = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      currentEvent = {};
    } else if (line === 'END:VEVENT' && inEvent) {
      if (currentEvent.summary && currentEvent.start) {
        const event = createCalendarEvent(currentEvent as ICalEvent);
        if (event) {
          events.push(event);
        }
      }
      inEvent = false;
      currentEvent = {};
    } else if (inEvent) {
      parseEventProperty(line, currentEvent);
    }
  }
  
  return events;
}

function parseEventProperty(line: string, event: Partial<ICalEvent>) {
  if (line.startsWith('SUMMARY:')) {
    event.summary = line.substring(8).replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\');
  } else if (line.startsWith('DTSTART')) {
    const dateStr = extractDateFromLine(line);
    if (dateStr) {
      event.start = dateStr;
      // Check if it's an all-day event (no time component)
      event.allDay = !dateStr.includes('T');
    }
  } else if (line.startsWith('DTEND')) {
    const dateStr = extractDateFromLine(line);
    if (dateStr) {
      event.end = dateStr;
    }
  } else if (line.startsWith('DESCRIPTION:')) {
    event.description = line.substring(12).replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\');
  } else if (line.startsWith('LOCATION:')) {
    event.location = line.substring(9).replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\');
  }
}

function extractDateFromLine(line: string): string | null {
  // Handle different date formats
  const match = line.match(/(\d{8}T?\d{0,6}Z?)/);
  if (match) {
    let dateStr = match[1];
    
    // Convert YYYYMMDDTHHMMSSZ format to ISO string
    if (dateStr.length === 15 && dateStr.includes('T')) {
      // YYYYMMDDTHHMMSSZ
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      const hour = dateStr.substring(9, 11);
      const minute = dateStr.substring(11, 13);
      const second = dateStr.substring(13, 15);
      
      return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
    } else if (dateStr.length === 8) {
      // YYYYMMDD (all-day event)
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      
      return `${year}-${month}-${day}`;
    }
  }
  
  // Try to match other common iCal date formats
  const isoMatch = line.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/);
  if (isoMatch) {
    return isoMatch[1] + 'Z';
  }
  
  return null;
}

function createCalendarEvent(icalEvent: ICalEvent): CalendarEvent | null {
  try {
    const startDate = new Date(icalEvent.start);
    const endDate = icalEvent.end ? new Date(icalEvent.end) : new Date(startDate.getTime() + 60 * 60 * 1000); // Default 1 hour
    
    if (isNaN(startDate.getTime())) {
      return null;
    }
    
    return {
      id: `ical_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: icalEvent.summary,
      startDate,
      endDate,
      allDay: icalEvent.allDay || false,
      description: icalEvent.description,
      location: icalEvent.location,
      color: '#8b5cf6', // Default color for imported events
      source: 'ical',
    };
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return null;
  }
}

export async function fetchICalData(url: string): Promise<string> {
  try {
    // Convert webcal:// to https://
    const httpsUrl = url.replace('webcal://', 'https://');
    
    console.log('Fetching iCal data from:', httpsUrl);
    
    const response = await fetch(httpsUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/calendar, text/plain, */*',
        'User-Agent': 'FamilyCalendar/1.0',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.text();
    console.log('iCal data received, length:', data.length);
    
    return data;
  } catch (error) {
    console.error('Error fetching iCal data:', error);
    throw new Error(`Failed to fetch calendar: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
