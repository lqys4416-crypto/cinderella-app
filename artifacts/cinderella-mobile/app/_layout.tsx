import React, { useEffect } from 'react';
import { I18nManager } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider } from '@/context/AuthContext';
import {
  Cairo_400Regular,
  Cairo_600SemiBold,
  Cairo_700Bold,
  Cairo_900Black,
  useFonts,
} from '@expo-google-fonts/cairo';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { setBaseUrl } from '@workspace/api-client-react';

// ─── RTL for Arabic ───────────────────────────────────────────────────────────
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

// ─── API base URL ─────────────────────────────────────────────────────────────
if (process.env.EXPO_PUBLIC_DOMAIN) {
  setBaseUrl(`https://${process.env.EXPO_PUBLIC_DOMAIN}`);
}

// ─── Splash screen ────────────────────────────────────────────────────────────
SplashScreen.preventAutoHideAsync();
SystemUI.setBackgroundColorAsync('#0D0D0D').catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="order/[id]"
        options={{
          headerShown: true,
          title: 'تفاصيل الطلب',
          headerStyle: { backgroundColor: '#141414' },
          headerTintColor: '#E8A830',
          headerTitleStyle: { fontFamily: 'Cairo_700Bold', fontSize: 18 },
          headerBackTitle: 'رجوع',
        }}
      />
      <Stack.Screen
        name="order/new"
        options={{
          headerShown: true,
          title: 'طلب جديد',
          headerStyle: { backgroundColor: '#141414' },
          headerTintColor: '#E8A830',
          headerTitleStyle: { fontFamily: 'Cairo_700Bold', fontSize: 18 },
          headerBackTitle: 'رجوع',
        }}
      />
      <Stack.Screen
        name="product/[id]"
        options={{
          headerShown: true,
          title: 'تفاصيل المنتج',
          headerStyle: { backgroundColor: '#141414' },
          headerTintColor: '#E8A830',
          headerTitleStyle: { fontFamily: 'Cairo_700Bold', fontSize: 18 },
          headerBackTitle: 'رجوع',
        }}
      />
      <Stack.Screen
        name="product/new"
        options={{
          headerShown: true,
          title: 'منتج جديد',
          headerStyle: { backgroundColor: '#141414' },
          headerTintColor: '#E8A830',
          headerTitleStyle: { fontFamily: 'Cairo_700Bold', fontSize: 18 },
          headerBackTitle: 'رجوع',
        }}
      />
      <Stack.Screen
        name="marketer/index"
        options={{
          headerShown: true,
          title: 'المسوقات',
          headerStyle: { backgroundColor: '#141414' },
          headerTintColor: '#E8A830',
          headerTitleStyle: { fontFamily: 'Cairo_700Bold', fontSize: 18 },
          headerBackTitle: 'رجوع',
        }}
      />
      <Stack.Screen
        name="marketer/[id]"
        options={{
          headerShown: true,
          title: 'تفاصيل المسوقة',
          headerStyle: { backgroundColor: '#141414' },
          headerTintColor: '#E8A830',
          headerTitleStyle: { fontFamily: 'Cairo_700Bold', fontSize: 18 },
          headerBackTitle: 'رجوع',
        }}
      />
      <Stack.Screen
        name="marketer/new"
        options={{
          headerShown: true,
          title: 'مسوقة جديدة',
          headerStyle: { backgroundColor: '#141414' },
          headerTintColor: '#E8A830',
          headerTitleStyle: { fontFamily: 'Cairo_700Bold', fontSize: 18 },
          headerBackTitle: 'رجوع',
        }}
      />
      <Stack.Screen
        name="reports"
        options={{
          headerShown: true,
          title: 'التقارير',
          headerStyle: { backgroundColor: '#141414' },
          headerTintColor: '#E8A830',
          headerTitleStyle: { fontFamily: 'Cairo_700Bold', fontSize: 18 },
          headerBackTitle: 'رجوع',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Cairo_400Regular,
    Cairo_600SemiBold,
    Cairo_700Bold,
    Cairo_900Black,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <KeyboardProvider>
                <RootLayoutNav />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
