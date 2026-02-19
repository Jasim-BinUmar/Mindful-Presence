import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import "../global.css";
import { useColorScheme } from '@/hooks/useColorScheme';
import { GlobalProvider } from '../lib/globalContext';
import { StripeProvider } from '@stripe/stripe-react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // Get Stripe publishable key from environment
  const stripePublishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
  
  // Log for debugging (remove in production)
  useEffect(() => {
    if (stripePublishableKey) {
      console.log('✅ Stripe publishable key loaded');
    } else {
      console.warn('⚠️ Stripe publishable key not found. Check EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env');
    }
  }, [stripePublishableKey]);

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
        <Stack
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
        </Stack>
      </GlobalProvider>
    </StripeProvider>
  );
}
