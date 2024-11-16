import * as React from 'react';
import { Text, View, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './Home'
import BookSession from '../(bookSession)/BookSession';
import Favourite from '../Favourite'
import { icons } from '../../../constants';
import Payment from '../(payment)/Payment'
const Tab = createBottomTabNavigator();

const homeLayout = () => {
  return (

    <Tab.Navigator screenOptions={{
      tabBarStyle: {
        height: 70,
        borderTopWidth: 0, // remove top border
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        paddingBottom: 10,
        elevation: 5, // for Android shadow
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: -10,
      },
      tabBarActiveTintColor: '#623AD9', // Icon color when focused
      tabBarInactiveTintColor: 'gray', // Icon color when not focused
    }}
    >
      {/* use icons icons.home, icons.pricing, icons.bookSession,icons.favourite  from the icons import*/}
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          headerShown: false,
          tabBarIcon: ({ color = '#623AD9', size }) => (
            <Image source={icons.home} style={{ width: size, height: size, tintColor: color }} />
          ),
        }}

      />
      <Tab.Screen
        name="Payment"
        component={Payment}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Image source={icons.pricing} style={{ width: size, height: size, tintColor: color }} />
          ),
        }}
      />
      <Tab.Screen
        name="Book Session"
        component={BookSession}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Image source={icons.bookSession} style={{ width: size, height: size, tintColor: color }} />
          ),
        }} />
      <Tab.Screen
        name="Favourites"
        component={Favourite}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Image source={icons.favourite} style={{ width: size, height: size, tintColor: color }} />
          ),
        }} />

    </Tab.Navigator>

  );
}

export default homeLayout