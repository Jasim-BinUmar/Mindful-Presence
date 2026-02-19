import * as React from 'react';
import { Image } from 'react-native';
import { Tabs } from 'expo-router';
import { icons } from '../../constants';

const ScreensLayout = () => {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    height: 70,
                    borderTopWidth: 0,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -5 },
                    shadowOpacity: 0.25,
                    shadowRadius: 10,
                    paddingBottom: 10,
                    elevation: 5,
                    backgroundColor: '#FFFFFF',
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: 'bold',
                    marginTop: 5,
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
                        <Image
                            source={icons.home}
                            style={{ width: size, height: size, tintColor: color }}
                            resizeMode="contain"
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="(payment)"
                options={{
                    title: 'Payment',
                    tabBarIcon: ({ color, size }) => (
                        <Image
                            source={icons.pricing}
                            style={{ width: size, height: size, tintColor: color }}
                            resizeMode="contain"
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="(payment)/paymentHistory"
                options={{
                    title: 'History',
                    tabBarIcon: ({ color, size }) => (
                        <Image
                            source={icons.paymentIcon}
                            style={{ width: size, height: size, tintColor: color }}
                            resizeMode="contain"
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="(bookSession)"
                options={{
                    title: 'Book Session',
                    tabBarIcon: ({ color, size }) => (
                        <Image
                            source={icons.bookSession}
                            style={{ width: size, height: size, tintColor: color }}
                            resizeMode="contain"
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="Favourite"
                options={{
                    title: 'Favourites',
                    tabBarIcon: ({ color, size }) => (
                        <Image
                            source={icons.favourite}
                            style={{ width: size, height: size, tintColor: color }}
                            resizeMode="contain"
                        />
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
