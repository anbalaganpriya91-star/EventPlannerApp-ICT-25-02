// eventStorage.js - saves and loads events on the device using AsyncStorage.
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'EVENT_PLANNER_EVENTS';

// Load all events (returns [] if nothing saved or data is corrupted)
export async function loadEvents() {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.warn('Failed to load events', error);
    return [];
  }
}

// Replace the saved list with the given list
async function saveEvents(events) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

// Add a new event or update an existing one (matched by id)
export async function saveEvent(event) {
  const events = await loadEvents();
  const index = events.findIndex((e) => e.id === event.id);
  if (index >= 0) {
    events[index] = event;
  } else {
    events.push(event);
  }
  await saveEvents(events);
}

// Remove an event by id
export async function deleteEvent(id) {
  const events = await loadEvents();
  await saveEvents(events.filter((e) => e.id !== id));
}
