import React from 'react';
import { View, Text, ImageBackground, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft } from 'lucide-react-native';
import { images } from "../../constants";
import CustomButton from '../../components/CustomButton';
import { router } from 'expo-router';

export default function userRegistrationScreen() {
  return (
    <View className="flex-1">
      <StatusBar style="light" translucent />
      <ImageBackground
        source={images.userRegisterScreen}
        className="flex-1 "
      >
        
          <SafeAreaView className="flex-1 justify-between p-5">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2 self-start"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ChevronLeft size={28} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
            <View className="flex items-center justify-center mt-10 px-16">
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
              {/* Temporarily commented out - Register with Organization Key */}
              {/* <CustomButton title='Register with Organization Key'
              handlePress={() => { router.push('/(auth)/signUpOrg') }}
              containerStyles="bg-secondary-100 py-4 mb-4 border-2 border-gray-500"
              textStyles="text-lg font-bold bg-secondary-100 text-gray-500 "
              /> */}
            </View>
          </SafeAreaView>
        
      </ImageBackground>
    </View>
  );
}