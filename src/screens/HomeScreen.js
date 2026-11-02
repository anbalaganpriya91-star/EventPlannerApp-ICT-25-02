import React, { useCallback, useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  SectionList,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import EventCard from '../components/EventCard';
import { loadEvents, deleteEvent } from '../storage/eventStorage';
import { setupNotifications, cancelReminder } from '../services/notifications';
import { formatDate, toDateKey, isPast } from '../utils/dateUtils';

export default function HomeScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [query, setQuery] = useState('');

  // Ask for notification permission when the app first opens
  React.useEffect(() => {
    setupNotifications();
  }, []);

  // Reload the list every time this screen comes into focus (after add/edit)
  useFocusEffect(
    useCallback(() => {
      loadEvents().then(setEvents);
    }, [])
  );

  // "+ Add" button in the header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('EventForm')}>
          <Text style={styles.headerButton}>+ Add</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Search by name or by date (e.g. "birthday", "2026-11-05", "5 Nov", "nov")
  const matchesQuery = (event) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      event.name.toLowerCase().includes(q) ||
      toDateKey(event.date).includes(q) ||
      formatDate(event.date).toLowerCase().includes(q)
    );
  };

  const filtered = events.filter(matchesQuery);
  const upcoming = filtered
    .filter((e) => !isPast(e.date))
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // soonest first
  const past = filtered
    .filter((e) => isPast(e.date))
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // most recent first

  const sections = [];
  if (upcoming.length) sections.push({ title: 'Upcoming', data: upcoming, past: false });
  if (past.length) sections.push({ title: 'Past events', data: past, past: true });

  // Ask for confirmation, then delete the event and cancel its reminder
  const confirmDelete = (event) => {
    Alert.alert('Delete event', `Are you sure you want to delete "${event.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await cancelReminder(event.notificationId);
          await deleteEvent(event.id);
          setEvents((prev) => prev.filter((e) => e.id !== event.id));
        },
      },
    ]);
  };

  // Message shown when there is nothing to display
  const emptyMessage = events.length === 0
    ? 'No events yet.\nTap "+ Add" to create your first event.'
    : 'No events match your search.';

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search by name or date (e.g. 2026-11-05)"
        placeholderTextColor="#9ca3af"
        value={query}
        onChangeText={setQuery}
        clearButtonMode="while-editing"
      />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item, section }) => (
          <EventCard
            event={item}
            isPast={section.past}
            onPress={() => navigation.navigate('EventForm', { event: item })}
            onDelete={() => confirmDelete(item)}
          />
        )}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        ListEmptyComponent={<Text style={styles.empty}>{emptyMessage}</Text>}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  headerButton: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  search: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginBottom: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginTop: 12,
    marginHorizontal: 16,
  },
  listContent: { paddingBottom: 30, flexGrow: 1 },
  empty: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 16,
    marginTop: 80,
    lineHeight: 24,
  },
});
