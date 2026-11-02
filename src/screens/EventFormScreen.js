import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

import { saveEvent } from '../storage/eventStorage';
import {
  requestNotificationPermission,
  scheduleReminder,
  cancelReminder,
} from '../services/notifications';
import { formatDate, formatTime } from '../utils/dateUtils';

// Reminder choices: how many minutes before the event (null = no reminder)
const REMINDER_OPTIONS = [
  { label: 'No reminder', minutes: null },
  { label: 'At event time', minutes: 0 },
  { label: '10 min before', minutes: 10 },
  { label: '1 hour before', minutes: 60 },
  { label: '1 day before', minutes: 1440 },
];

export default function EventFormScreen({ navigation, route }) {
  const editingEvent = route.params?.event; // undefined when creating

  const [name, setName] = useState(editingEvent?.name ?? '');
  const [description, setDescription] = useState(editingEvent?.description ?? '');
  const [date, setDate] = useState(
    editingEvent ? new Date(editingEvent.date) : new Date(Date.now() + 60 * 60 * 1000)
  );
  const [reminderMinutes, setReminderMinutes] = useState(
    editingEvent?.reminderMinutes ?? null
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Open the native Android date picker
  const pickDate = () => {
    DateTimePickerAndroid.open({
      value: date,
      mode: 'date',
      onChange: (event, selected) => {
        if (event.type !== 'set' || !selected) return;
        const updated = new Date(date);
        updated.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
        setDate(updated);
      },
    });
  };

  // Open the native Android time picker
  const pickTime = () => {
    DateTimePickerAndroid.open({
      value: date,
      mode: 'time',
      is24Hour: false,
      onChange: (event, selected) => {
        if (event.type !== 'set' || !selected) return;
        const updated = new Date(date);
        updated.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
        setDate(updated);
      },
    });
  };

  // Returns an object of error messages (empty object = valid)
  const validate = () => {
    const newErrors = {};
    const trimmedName = name.trim();

    if (!trimmedName) newErrors.name = 'Event name is required.';
    else if (trimmedName.length < 3) newErrors.name = 'Name must be at least 3 characters.';
    else if (trimmedName.length > 50) newErrors.name = 'Name must be 50 characters or less.';

    if (description.length > 200) {
      newErrors.description = 'Description must be 200 characters or less.';
    }

    // New events must be in the future (old events may be edited freely)
    if (!editingEvent && date.getTime() <= Date.now()) {
      newErrors.date = 'Please choose a future date and time.';
    }

    // A reminder must still be in the future
    if (reminderMinutes !== null) {
      const triggerTime = date.getTime() - reminderMinutes * 60 * 1000;
      if (triggerTime <= Date.now()) {
        newErrors.reminder = 'That reminder time has already passed. Choose another option.';
      }
    }

    return newErrors;
  };

  const handleSave = async () => {
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSaving(true);
    try {
      // Remove the old reminder first (when editing)
      if (editingEvent) await cancelReminder(editingEvent.notificationId);

      let notificationId = null;
      if (reminderMinutes !== null) {
        const allowed = await requestNotificationPermission();
        if (allowed) {
          const triggerDate = new Date(date.getTime() - reminderMinutes * 60 * 1000);
          notificationId = await scheduleReminder(
            name.trim(),
            `${formatDate(date)} at ${formatTime(date)}`,
            triggerDate
          );
        } else {
          Alert.alert(
            'Notifications disabled',
            'The event will be saved without a reminder. Enable notifications in Settings to get reminders.'
          );
        }
      }

      await saveEvent({
        id: editingEvent?.id ?? Date.now().toString(),
        name: name.trim(),
        description: description.trim(),
        date: date.toISOString(),
        reminderMinutes,
        notificationId,
      });

      navigation.goBack();
    } catch (error) {
      console.warn('Failed to save event', error);
      Alert.alert('Error', 'Something went wrong while saving. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Event name *</Text>
      <TextInput
        style={[styles.input, errors.name && styles.inputError]}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Team meeting"
        maxLength={50}
      />
      {!!errors.name && <Text style={styles.error}>{errors.name}</Text>}

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.multiline, errors.description && styles.inputError]}
        value={description}
        onChangeText={setDescription}
        placeholder="Optional details"
        multiline
        maxLength={200}
      />
      {!!errors.description && <Text style={styles.error}>{errors.description}</Text>}

      <Text style={styles.label}>Date & time *</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.pickerButton} onPress={pickDate}>
          <Text style={styles.pickerText}>📅 {formatDate(date)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pickerButton} onPress={pickTime}>
          <Text style={styles.pickerText}>⏰ {formatTime(date)}</Text>
        </TouchableOpacity>
      </View>
      {!!errors.date && <Text style={styles.error}>{errors.date}</Text>}

      <Text style={styles.label}>Reminder</Text>
      <View style={styles.chips}>
        {REMINDER_OPTIONS.map((option) => {
          const selected = reminderMinutes === option.minutes;
          return (
            <TouchableOpacity
              key={option.label}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => setReminderMinutes(option.minutes)}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {!!errors.reminder && <Text style={styles.error}>{errors.reminder}</Text>}

      <TouchableOpacity
        style={[styles.saveButton, saving && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveText}>
          {editingEvent ? 'Update Event' : 'Save Event'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  content: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '700', color: '#374151', marginTop: 16, marginBottom: 6 },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  inputError: { borderColor: '#dc2626' },
  error: { color: '#dc2626', fontSize: 13, marginTop: 4 },
  row: { flexDirection: 'row', gap: 10 },
  pickerButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  pickerText: { fontSize: 15, color: '#111827', fontWeight: '600' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
  },
  chipSelected: { backgroundColor: '#4f46e5' },
  chipText: { color: '#374151', fontWeight: '600' },
  chipTextSelected: { color: '#ffffff' },
  saveButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 28,
  },
  saveText: { color: '#ffffff', fontSize: 17, fontWeight: '700' },
});
