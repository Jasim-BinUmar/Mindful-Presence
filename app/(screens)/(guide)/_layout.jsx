import * as React from 'react';
import { Text, View, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../(home)/Home'
import BookSession from '../(bookSession)/BookSession';
import Favourite from '../Favourite'
import FullGuide from './FullGuide';
import { icons } from '../../../constants';
import Support from '../(support)/support';
import Questionnaire1 from '../(selfAssesment)/questionnaire1'
const Tab = createBottomTabNavigator();


const guideLayout = () => {
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
        width: 100,
        marginTop: 5,
      },
      tabBarActiveTintColor: '#623AD9', // Icon color when focused
      tabBarInactiveTintColor: 'gray', // Icon color when not focused
    }}
    >
     
      <Tab.Screen
        name="FullGuideScreen"
        component={FullGuide} // or an empty component that does nothing
        options={{
          headerShown: false,
          tabBarItemStyle: { display: 'none' },
        }}
      />
      <Tab.Screen
        name="Contact"
        component={Support}
        options={{
          headerShown: false,
          tabBarIcon: ({ color = '#623AD9', size }) => (
            <Image source={icons.contact} style={{ width: size, height: size, tintColor: color }} />
          ),
        }}

      />
      <Tab.Screen
        name="Assessment"
        component={Questionnaire1}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Image source={icons.selfAssessment} style={{ width: size, height: size, tintColor: color }} />
          ),
        }}
      />
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

export default guideLayout
