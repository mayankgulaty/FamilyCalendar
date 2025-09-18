# 📅 Family Calendar

A beautiful, feature-rich family calendar app built with React Native and Expo. Perfect for managing family schedules, importing calendars, and staying organized across all your devices.

## ✨ Features

### 📊 Multiple View Modes
- **📅 Calendar View**: Traditional month view with detailed daily events
- **📋 Weekly View**: Week-at-a-glance layout for quick planning
- **🎛️ Dashboard**: Customizable widgets and quick actions

### 🔄 Calendar Management
- **📥 iCal/Webcal Import**: Import from Google Calendar, iCloud, Outlook, and more
- **🔄 Auto-Sync**: Automatic refresh every 10 minutes to keep calendars up-to-date
- **⚡ Manual Refresh**: Pull-to-refresh and manual sync buttons
- **🛡️ Duplicate Prevention**: Smart refresh logic prevents duplicate events

### 📝 Event Management
- **✏️ Edit Events**: Full event details with editing capabilities
- **🗑️ Delete Events**: Remove events with confirmation
- **📍 Location Support**: Add locations to events
- **⏰ All-Day Events**: Support for all-day and timed events
- **🎨 Color Coding**: Events maintain their original calendar colors

### 🎛️ Dashboard Widgets
- **🌤️ Weather Widget**: Current weather conditions
- **➕ Quick Add**: Fast event creation
- **📋 Upcoming Events**: Next 5 upcoming events
- **⚙️ Customizable**: Add/remove widgets as needed

### 📱 Mobile Experience
- **📱 Responsive Design**: Optimized for phones and tablets
- **👆 Touch-Friendly**: Large touch targets and smooth gestures
- **🔄 Pull-to-Refresh**: Swipe down to refresh data
- **🎨 Modern UI**: Beautiful gradients and smooth animations

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app on your mobile device

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd family-calendar-app
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm start
```

4. **Run on your device:**
   - **Mobile**: Install Expo Go app and scan the QR code
   - **Web**: Press 'w' in the terminal
   - **iOS Simulator**: Press 'i' (requires Xcode)
   - **Android Emulator**: Press 'a' (requires Android Studio)

## 📱 How to Use

### Importing Calendars
1. Tap the cloud download icon in the header
2. Enter your iCal/webcal URL (from Google Calendar, iCloud, etc.)
3. Give it a name and choose a color
4. Tap "Import Calendar"

### Adding Events
1. Go to the Dashboard tab
2. Use the Quick Add widget
3. Fill in event details
4. Save to add to your calendar

### Viewing Events
- **Calendar**: Tap any day to see events for that date
- **Weekly**: See your entire week at a glance
- **Details**: Tap any event to see full details and edit options

### Managing Widgets
1. Go to Dashboard tab
2. Tap the settings icon
3. Toggle widgets on/off
4. Reorder by dragging

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── CalendarView.tsx  # Main calendar component
│   ├── WeeklyView.tsx    # Weekly view component
│   ├── EventDetailsModal.tsx # Event details and editing
│   ├── ICalImport.tsx    # Calendar import functionality
│   └── WidgetManager.tsx # Widget management
├── screens/              # Main app screens
│   └── HomeScreen.tsx    # Main screen with navigation
├── widgets/              # Dashboard widgets
│   ├── WeatherWidget.tsx
│   ├── QuickAddWidget.tsx
│   └── UpcomingEventsWidget.tsx
├── contexts/             # State management
│   └── AppContext.tsx    # Global app state
├── types/                # TypeScript definitions
│   └── index.ts          # Type definitions
└── utils/                # Utility functions
    └── icalParser.ts     # iCal parsing logic
```

## 🛠️ Technical Details

### Built With
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **TypeScript**: Type-safe JavaScript
- **React Context API**: State management
- **AsyncStorage**: Local data persistence
- **Linear Gradients**: Beautiful UI effects

### Key Technologies
- **Custom iCal Parser**: Handles various calendar formats
- **Auto-Refresh System**: Keeps calendars in sync
- **Responsive Design**: Works on all screen sizes
- **Touch Gestures**: Pull-to-refresh and smooth interactions

### Performance Features
- **Smart Caching**: Efficient data storage
- **Throttled Refreshes**: Prevents excessive API calls
- **Optimized Rendering**: Smooth animations and transitions
- **Memory Management**: Proper cleanup and resource management

## 🔧 Configuration

### App Configuration (`app.json`)
- **App Name**: "Family Calendar"
- **Bundle ID**: `com.familycalendar.app`
- **Orientation**: Portrait (tablet-optimized)
- **Permissions**: Calendar access, location for weather

### Supported Calendar Formats
- **iCal**: Standard calendar format
- **Webcal**: Web-based calendar feeds
- **Google Calendar**: Export as iCal
- **iCloud Calendar**: Share as public calendar
- **Outlook**: Export calendar

## 🚀 Deployment

### Building for Production

1. **Configure app.json** with your app details
2. **Build for iOS**:
   ```bash
   expo build:ios
   ```
3. **Build for Android**:
   ```bash
   expo build:android
   ```

### App Store Submission
- Update version numbers in `app.json`
- Add app icons and splash screens
- Configure app store metadata
- Submit through Expo or EAS Build

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with ❤️ using React Native and Expo
- Inspired by the need for better family calendar management
- Thanks to the open-source community for amazing tools and libraries

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Include device type, OS version, and steps to reproduce

---

**Made with ❤️ for families everywhere** 🏠