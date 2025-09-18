# Family Calendar App

A beautiful, modern family calendar app built with React Native and Expo, designed for tablets and mobile devices.

## Features

### 📅 Calendar View
- **Month View**: Full month calendar with event indicators
- **Event Management**: Add, edit, and delete events
- **Date Selection**: Tap any date to view events for that day
- **Event Details**: View event information including time, location, and description

### 🌤️ Weather Widget
- **Current Weather**: Real-time weather conditions
- **Location-based**: Automatically detects your location
- **Weather Details**: Temperature, humidity, wind speed
- **Auto-refresh**: Updates weather data automatically

### ⚡ Quick Add Widget
- **Fast Event Creation**: Quickly add events with minimal input
- **All-day Events**: Toggle between timed and all-day events
- **Smart Defaults**: Uses selected date as default

### 📋 Upcoming Events Widget
- **Next 7 Days**: Shows upcoming events for the next week
- **Smart Grouping**: Groups events by today, tomorrow, and future dates
- **Quick Access**: Tap events to view details

### 🔗 iCal Import
- **Webcal Support**: Import calendars from webcal:// URLs
- **Multiple Calendars**: Support for multiple imported calendars
- **Color Coding**: Each imported calendar gets its own color
- **Enable/Disable**: Toggle imported calendars on/off

### 🎛️ Widget Management
- **Customizable Dashboard**: Add or remove widgets as needed
- **Drag & Drop**: Reorder widgets (coming soon)
- **Settings Panel**: Easy widget configuration

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd "Family Calendar/FamilyCalendar"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Run on device:**
   - **Android**: `npm run android`
   - **iOS**: `npm run ios`
   - **Web**: `npm run web`

### Building for Production

1. **Build for Android:**
   ```bash
   expo build:android
   ```

2. **Build for iOS:**
   ```bash
   expo build:ios
   ```

## Usage

### Adding Events
1. Switch to the **Dashboard** view
2. Use the **Quick Add** widget to create new events
3. Fill in the event details and tap "Add Event"

### Importing Calendars
1. Tap the **cloud download** icon in the header
2. Enter the calendar URL (webcal:// or https://)
3. Optionally customize the name and color
4. Tap "Import Calendar"

### Managing Widgets
1. In the **Dashboard** view, tap the **settings** icon
2. Toggle widgets on/off as needed
3. Widgets will be reordered automatically

### Viewing Events
1. Switch to the **Calendar** view
2. Tap any date to see events for that day
3. Tap on an event to view details or delete it

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── CalendarView.tsx # Main calendar component
│   ├── WidgetManager.tsx # Widget management
│   └── ICalImport.tsx   # Calendar import functionality
├── contexts/            # React contexts for state management
│   └── AppContext.tsx   # Main app state
├── screens/             # Screen components
│   └── HomeScreen.tsx   # Main screen
├── types/               # TypeScript type definitions
│   └── index.ts         # App types
├── widgets/             # Individual widget components
│   ├── WeatherWidget.tsx
│   ├── QuickAddWidget.tsx
│   └── UpcomingEventsWidget.tsx
└── utils/               # Utility functions
```

## Customization

### Adding New Widgets
1. Create a new widget component in `src/widgets/`
2. Add the widget type to `src/types/index.ts`
3. Register the widget in `src/components/WidgetManager.tsx`

### Styling
- The app uses a consistent color scheme defined in individual components
- Primary color: `#6366f1` (Indigo)
- All components use modern, clean styling with proper shadows and gradients

### Data Persistence
- Events and settings are stored locally using AsyncStorage
- Data persists between app sessions
- No external database required

## Permissions

The app requires the following permissions:
- **Calendar Access**: Read and write calendar events
- **Location Access**: For weather widget functionality

## Troubleshooting

### Common Issues

1. **Weather widget not working:**
   - Ensure location permissions are granted
   - Check internet connection

2. **Calendar import failing:**
   - Verify the URL is accessible
   - Ensure the URL uses webcal:// or https:// protocol

3. **App not building:**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.
