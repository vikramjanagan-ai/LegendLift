import React from 'react';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import store from './src/store';
import RootNavigator from './src/navigation/RootNavigator';

// Global fetch interceptor to add bypass headers for localtunnel
const originalFetch = global.fetch;
global.fetch = function (url, options = {}) {
  const headers = {
    'Bypass-Tunnel-Reminder': 'true',
    'User-Agent': 'LegendLift-Mobile-App',
    ...options.headers,
  };

  return originalFetch(url, {
    ...options,
    headers,
  });
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <RootNavigator />
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
