import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { RootStackParamList } from './src/types';
import HomeScreen from './src/screens/HomeScreen';
import ProcessingScreen from './src/screens/ProcessingScreen';
import ReviewItemsScreen from './src/screens/ReviewItemsScreen';
import AssignItemsScreen from './src/screens/AssignItemsScreen';
import BillSummaryScreen from './src/screens/BillSummaryScreen';
import TipScreen from './src/screens/TipScreen';
import ShareScreen from './src/screens/ShareScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: { backgroundColor: '#FFFFFF' },
              headerTintColor: '#009688',
              headerTitleStyle: { fontWeight: 'bold' },
              contentStyle: { backgroundColor: '#F5F5F5' },
            }}
          >
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: 'Receipt Splitter' }}
            />
            <Stack.Screen
              name="Processing"
              component={ProcessingScreen}
              options={{ title: 'Reading Receipt', gestureEnabled: false, headerBackVisible: false }}
            />
            <Stack.Screen
              name="ReviewItems"
              component={ReviewItemsScreen}
              options={{ title: 'Review Items' }}
            />
            <Stack.Screen
              name="AssignItems"
              component={AssignItemsScreen}
              options={{ title: 'Assign Items' }}
            />
            <Stack.Screen
              name="Tip"
              component={TipScreen}
              options={{ title: 'Add a Tip' }}
            />
            <Stack.Screen
              name="BillSummary"
              component={BillSummaryScreen}
              options={{ title: 'Bill Summary' }}
            />
            <Stack.Screen
              name="Share"
              component={ShareScreen}
              options={{ title: 'Share Breakdown' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
