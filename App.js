// App.js - entry point. Sets up navigation between the two screens.
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import EventFormScreen from './src/screens/EventFormScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#4f46e5' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'My Events' }}
        />
        <Stack.Screen
          name="EventForm"
          component={EventFormScreen}
          options={({ route }) => ({
            title: route.params?.event ? 'Edit Event' : 'New Event',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
