import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';
import "../global.css";
import { GlobalProvider } from '../lib/globalContext';
import { StripeProvider } from '@stripe/stripe-react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  const stripePublishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

  useEffect(() => {
    if (!stripePublishableKey) {
      console.warn('⚠️ Stripe publishable key not found. Check EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env');
    }
  }, [stripePublishableKey]);

  if (!loaded) {
    return null;
  }

  if (!stripePublishableKey) {
    console.error('❌ Stripe publishable key is missing! Payment will not work.');
  }

  return (
    <StripeProvider
      publishableKey={stripePublishableKey}
      merchantIdentifier="merchant.com.innerReflections.mindfulPresence"
      urlScheme="mindfulpresence"
    >
      <GlobalProvider>
        <View className="flex-1 font-sans">
          <StatusBar style="dark" translucent />
          <Stack
            screenOptions={{
              headerShown: false,
            }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
          </Stack>
        </View>
      </GlobalProvider>
    </StripeProvider>
  );
}
