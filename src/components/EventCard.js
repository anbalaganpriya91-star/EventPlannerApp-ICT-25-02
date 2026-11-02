import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { formatDate, formatTime } from '../utils/dateUtils';

export default function EventCard({ event, isPast, onPress, onDelete }) {
  return (
    <TouchableOpacity
      style={[styles.card, isPast && styles.cardPast]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.info}>
        <Text style={[styles.name, isPast && styles.textPast]} numberOfLines={1}>
          {event.name}
        </Text>
        <Text style={styles.when}>
          {formatDate(event.date)} • {formatTime(event.date)}
        </Text>
        {!!event.description && (
          <Text style={styles.description} numberOfLines={2}>
            {event.description}
          </Text>
        )}
        {event.notificationId && !isPast && (
          <Text style={styles.reminder}>🔔 Reminder set</Text>
        )}
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    borderLeftWidth: 5,
    borderLeftColor: '#4f46e5',
    elevation: 2,
  },
  cardPast: { borderLeftColor: '#9ca3af', backgroundColor: '#f3f4f6' },
  info: { flex: 1 },
  name: { fontSize: 17, fontWeight: '700', color: '#111827' },
  textPast: { color: '#6b7280' },
  when: { fontSize: 13, color: '#4f46e5', marginTop: 2, fontWeight: '600' },
  description: { fontSize: 13, color: '#4b5563', marginTop: 4 },
  reminder: { fontSize: 12, color: '#059669', marginTop: 4 },
  deleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
    marginLeft: 8,
  },
  deleteText: { color: '#dc2626', fontWeight: '700', fontSize: 13 },
});
