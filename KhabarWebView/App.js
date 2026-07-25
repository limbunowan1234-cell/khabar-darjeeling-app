import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  StatusBar,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import messaging from '@react-native-firebase/messaging';

const WEBSITE_URL = 'https://khabardarjeeling.in';
const BRAND_RED = '#c41e3a';
const BG = '#0f0f0f';

const APPWRITE_ENDPOINT = 'https://api.khabardarjeeling.in/v1';
const APPWRITE_PROJECT = 'khabardarjeeling';
const APPWRITE_DB = 'Khabar_db';

async function registerFcmToken(userId) {
  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    }
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (!enabled) return;

    const token = await messaging().getToken();
    if (!token) return;

    await fetch(APPWRITE_ENDPOINT + '/databases/' + APPWRITE_DB + '/collections/fcm_tokens/documents', {
      method: 'POST',
      headers: {
        'X-Appwrite-Project': APPWRITE_PROJECT,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentId: 'unique()',
        data: {
          userId,
          token,
          platform: 'android',
          createdAt: new Date().toISOString(),
        },
      }),
    });
  } catch (err) {
    console.log('FCM registration failed:', err);
  }
}

function AppContent() {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(WEBSITE_URL);

  // Handle Android back button
  React.useEffect(() => {
    const onBackPress = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };
    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  }, [canGoBack]);

  const handleReload = () => {
    setError(false);
    setLoading(true);
    webViewRef.current?.reload();
  };

  // Receive messages from the website (login/logout bridge)
  const handleWebViewMessage = (event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'AUTH' && msg.userId) {
        registerFcmToken(msg.userId);
      }
    } catch (err) {
      // ignore non-JSON messages
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {/* Minimal top bar */}
      <View style={styles.topBar}>
        {canGoBack ? (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => webViewRef.current?.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.logoWrap}>
            <View style={styles.logoDot} />
            <Text style={styles.logoText}>खबर दार्जिलिंग</Text>
          </View>
        )}

        <TouchableOpacity style={styles.reloadBtn} onPress={handleReload}>
          <Text style={styles.reloadIcon}>↺</Text>
        </TouchableOpacity>
      </View>

      {/* Loading bar */}
      {loading && !error && (
        <View style={styles.loadingBar}>
          <View style={styles.loadingProgress} />
        </View>
      )}

      {/* Error screen */}
      {error ? (
        <View style={styles.errorScreen}>
          <Text style={styles.errorIcon}>📡</Text>
          <Text style={styles.errorTitle}>No Connection</Text>
          <Text style={styles.errorSub}>
            Check your internet and try again
          </Text>
          <TouchableOpacity style={styles.retryBtn} onPress={handleReload}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ uri: WEBSITE_URL }}
          style={styles.webview}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => { setError(true); setLoading(false); }}
          onHttpError={() => { setError(true); setLoading(false); }}
          onNavigationStateChange={(state) => {
            setCanGoBack(state.canGoBack);
            setCurrentUrl(state.url);
          }}
          onMessage={handleWebViewMessage}
          // Make it feel like a native app
          allowsBackForwardNavigationGestures={true}
          pullToRefreshEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          scalesPageToFit={false}
          useWideViewPort={true}
          loadWithOverviewMode={true}
          textZoom={100}
          // CRITICAL: Force mobile viewport BEFORE the page's own JS runs its mobile-detection check
          injectedJavaScriptBeforeContentLoaded={`
            (function() {
              var meta = document.querySelector('meta[name="viewport"]');
              if (!meta) {
                meta = document.createElement('meta');
                meta.name = 'viewport';
                (document.head || document.getElementsByTagName('head')[0]).appendChild(meta);
              }
              meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, viewport-fit=cover';
            })();
            true;
          `}
          // Inject mobile meta tag for better display
          injectedJavaScript={`
            (function() {
              // Set viewport for mobile
              var meta = document.querySelector('meta[name="viewport"]');
              if (!meta) {
                meta = document.createElement('meta');
                meta.name = 'viewport';
                document.head.appendChild(meta);
              }
              meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0';

              // Hide any install PWA banners
              var banners = document.querySelectorAll('[class*="install"], [id*="install"], [class*="banner"], [id*="banner"]');
              banners.forEach(function(b) { b.style.display = 'none'; });
            })();
            true;
          `}
          userAgent="Mozilla/5.0 (Linux; Android 11; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 KhabarDarjeelingApp/1.0"
        />
      )}

      {/* Bottom safe area */}
      <View style={{ height: insets.bottom, backgroundColor: BG }} />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  topBar: {
    height: 48,
    backgroundColor: BG,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e1e',
  },
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BRAND_RED,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  reloadBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reloadIcon: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingBar: {
    height: 2,
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
  },
  loadingProgress: {
    height: 2,
    width: '70%',
    backgroundColor: BRAND_RED,
  },
  webview: {
    flex: 1,
    backgroundColor: BG,
  },
  errorScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG,
    gap: 14,
    paddingHorizontal: 40,
  },
  errorIcon: {
    fontSize: 60,
  },
  errorTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  errorSub: {
    color: '#9a9a9a',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryBtn: {
    marginTop: 8,
    backgroundColor: BRAND_RED,
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 999,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
