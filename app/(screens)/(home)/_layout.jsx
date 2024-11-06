import * as React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import payment from '../(payment)/payment'
import homeScreen from './homeScreen';
import questionnaire1 from '../(selfAssesment)/questionnaire1'

const Tab = createBottomTabNavigator();

const homeLayout = () => {
    return (
        
          <Tab.Navigator>
            <Tab.Screen name="Payment" component={payment} />
            <Tab.Screen name="Home" component={homeScreen} />
            <Tab.Screen name="Q1" component={questionnaire1} />
          </Tab.Navigator>
        
      );
}

export default homeLayout