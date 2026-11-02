# Event Planner App

**Name:** <Your Full Name>
**Index No:** <Your Index Number>
**Module:** Mobile Application Development (K72T001M15)

## Description
Event Planner is a mobile app built with React Native (Expo) that helps a user create, organize and be reminded of events. All data is stored on the device, so it works offline.

## Features Implemented
- **Create event** – name, date, time and description with input validation (required name, length limits, future date only).
- **View upcoming events** – sorted by date/time; past events are shown in a separate, greyed-out section.
- **Edit / delete event** – tap an event to edit it; deleting asks for confirmation first.
- **Search** – find events by name or by date (e.g. `birthday`, `2026-11-05`, `5 Nov`).
- **Reminders / notifications** – choose when to be reminded (at event time, 10 min, 1 hour or 1 day before). Notification permission is requested properly for Android 13+.
- **Empty states and error handling** – friendly messages when there are no events or no search results.

## Tools & Technologies
- React Native with Expo (SDK 52)
- React Navigation (native stack)
- AsyncStorage (local storage)
- expo-notifications (reminders)
- @react-native-community/datetimepicker (date & time pickers)

## Project Structure
```
App.js                      # Navigation setup
src/screens/HomeScreen.js   # Event list, search, delete
src/screens/EventFormScreen.js  # Create / edit event + validation
src/components/EventCard.js # Single event row
src/storage/eventStorage.js # Save / load / delete events
src/services/notifications.js   # Permission + scheduling
src/utils/dateUtils.js      # Date and time helpers
```

## How to Run
1. Install [Node.js](https://nodejs.org) and the **Expo Go** app on your Android phone (or use an Android emulator).
2. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/<your-username>/EventPlannerApp-<YourIndexNo>.git
   cd EventPlannerApp-<YourIndexNo>
   npm install
   ```
3. Start the app:
   ```bash
   npx expo start
   ```
4. Scan the QR code with Expo Go, or press `a` to open it in an Android emulator.

> Note: scheduled notifications work best in a development build; Expo Go on Android may limit some notification features.

## Screenshots
| Event list | Add event | Search | Reminder |
|---|---|---|---|
| ![List](screenshots/list.png) | ![Add](screenshots/add.png) | ![Search](screenshots/search.png) | ![Reminder](screenshots/reminder.png) |

## Testing
| Test | Expected result | Result |
|---|---|---|
| Save with empty name | Error "Event name is required." | Pass |
| Create event in the past | Error "Please choose a future date and time." | Pass |
| Create valid event | Appears in Upcoming list | Pass |
| Edit event | Changes saved and shown in list | Pass |
| Delete event | Confirmation dialog, then removed | Pass |
| Search by name / date | List filtered correctly | Pass |
| Set reminder | Notification appears at chosen time | Pass |
| Empty list | Friendly empty message shown | Pass |
