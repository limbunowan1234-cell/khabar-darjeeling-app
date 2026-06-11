// App.js
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import NotificationService from './src/services/notifications';

const App = () => {
  useEffect(() => {
    NotificationService.configure((notification) => {
      // Handle notification tap — navigate to article
      const articleId = notification?.userInfo?.articleId;
      if (articleId) {
        // Navigation ref can be used here to navigate
        console.log('Notification tapped, articleId:', articleId);
      }
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
