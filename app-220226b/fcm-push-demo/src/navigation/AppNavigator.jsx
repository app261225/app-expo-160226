import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { navigationRef } from './navigationRef';
import HomeScreen from '../screens/HomeScreen';
import DemoScreen from '../screens/DemoScreen';

const Stack = createNativeStackNavigator();

/**
 * AppNavigator — definisi semua screen dan stack.
 *
 * navigationRef di-pass ke NavigationContainer agar navigate()
 * bisa dipanggil dari luar React tree (NotificationService, dll).
 */
export default function AppNavigator() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#1A1A2E' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#1A1A2E' },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Notification Demo' }}
        />
        <Stack.Screen
          name="Demo"
          component={DemoScreen}
          options={{ title: 'Demo Screen' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}