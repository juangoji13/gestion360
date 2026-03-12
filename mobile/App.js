import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';

import * as Linking from 'expo-linking';

const prefix = Linking.createURL('/');

export default function App() {
  const linking = {
    prefixes: [prefix, 'gestion360://'],
    config: {
      screens: {
        Login: 'login',
        Register: 'register',
        MainTabs: 'main',
      },
    },
  };

  return (
    <AuthProvider>
      <NavigationContainer linking={linking}>
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
 camps
