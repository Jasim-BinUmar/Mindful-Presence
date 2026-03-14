import * as React from 'react';
import { Tabs } from 'expo-router';
import { Home, Wallet, CalendarCheck, Heart } from 'lucide-react-native';

const ScreensLayout = () => {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    height: 85,
                    borderTopWidth: 0,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -5 },
                    shadowOpacity: 0.25,
                    shadowRadius: 10,
                    paddingBottom: 15,
                    paddingTop: 8,
                    elevation: 5,
                    backgroundColor: '#FFFFFF',
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: 'bold',
                    marginTop: 3,
                },
                tabBarActiveTintColor: '#623AD9',
                tabBarInactiveTintColor: 'gray',
            }}
        >
            <Tabs.Screen
                name="(home)"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Home color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="(payment)"
                options={{
                    title: 'Payment',
                    tabBarIcon: ({ color, size }) => (
                        <Wallet color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="(bookSession)"
                options={{
                    title: 'Book Session',
                    tabBarIcon: ({ color, size }) => (
                        <CalendarCheck color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="Favourite"
                options={{
                    title: 'Favourites',
                    tabBarIcon: ({ color, size }) => (
                        <Heart color={color} size={size} />
                    ),
                }}
            />

            {/* Hide other folders from tab bar */}
            <Tabs.Screen name="(courseView)" options={{ href: null }} />
            <Tabs.Screen name="(guide)" options={{ href: null }} />
            <Tabs.Screen name="(profile)" options={{ href: null }} />
            <Tabs.Screen name="(selfAssesment)" options={{ href: null }} />
            <Tabs.Screen name="(support)" options={{ href: null }} />
            <Tabs.Screen name="Contact" options={{ href: null }} />
        </Tabs>
    );
};

export default ScreensLayout;
