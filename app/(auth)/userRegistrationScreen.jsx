import React from 'react';
import { View, Text, ImageBackground, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { images } from "../../constants";
import CustomButton from '../../components/CustomButton';
import { router } from 'expo-router';

export default function userRegistrationScreen() {
  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <ImageBackground
        source={images.userRegisterScreen}
        className="flex-1 "
      >
        
          <SafeAreaView className="flex-1 justify-between p-5">
            <View className="flex items-center justify-center mt-20 px-16">
              <Text className="text-6xl font-bold text-white text-center mb-5">
              Your Journey Starts Here
              </Text>
              
            </View>
            <View className="w-full mb-10 px-5">
              
              <CustomButton title='Register As a Subscriber'
              handlePress={() => { router.push('/(auth)/signUpSubscriber') }}
              containerStyles="bg-primary py-4 mb-4"
              textStyles="text-lg font-bold text-primary text-white"
              />
              <CustomButton title='Register with Organization Key'
              handlePress={() => { router.push('/(auth)/signUpOrg') }}
              containerStyles="bg-secondary-100 py-4 mb-4 border-2 border-gray-500"
              textStyles="text-lg font-bold bg-secondary-100 text-gray-500 "
              />
            </View>
          </SafeAreaView>
        
      </ImageBackground>
    </View>
  );
}