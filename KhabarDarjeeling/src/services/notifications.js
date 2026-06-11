// src/services/notifications.js
import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';

export const NotificationService = {
  configure(onNotification) {
    PushNotification.configure({
      onRegister(token) {
        console.log('Push token:', token);
      },
      onNotification(notification) {
        if (onNotification) onNotification(notification);
        notification.finish?.('backgroundFetchResultNoData');
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    // Create channel for Android
    PushNotification.createChannel(
      {
        channelId: 'khabar-breaking',
        channelName: 'Breaking News',
        channelDescription: 'Breaking news alerts from Khabar Darjeeling',
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      () => {}
    );

    PushNotification.createChannel(
      {
        channelId: 'khabar-general',
        channelName: 'General News',
        channelDescription: 'Latest news from Khabar Darjeeling',
        soundName: 'default',
        importance: 3,
        vibrate: true,
      },
      () => {}
    );
  },

  showLocalNotification({ title, message, articleId, isBreaking = false }) {
    PushNotification.localNotification({
      channelId: isBreaking ? 'khabar-breaking' : 'khabar-general',
      title,
      message,
      playSound: true,
      soundName: 'default',
      vibrate: isBreaking,
      userInfo: { articleId },
      smallIcon: 'ic_notification',
      largeIconUrl: undefined,
      color: '#c41e3a',
    });
  },

  cancelAll() {
    PushNotification.cancelAllLocalNotifications();
  },
};

export default NotificationService;
