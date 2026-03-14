import React from 'react';
import { View, Text, ImageBackground, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { images } from "../../constants";
import CustomButton from '../../components/CustomButton';
import { router } from "expo-router";

export default function userAuthScreen() {
  return (
    <View className="flex-1">
      <StatusBar style="light" translucent />
      <ImageBackground
        source={images.homeBg}
        className="flex-1"
      >
        <View className="flex-1 bg-black/30" />
        <SafeAreaView className="absolute inset-0 justify-between p-5">
          <View className="flex items-center justify-center mt-24 px-6 flex-1">
            <Text className="text-4xl font-bold text-white text-center mb-4">
              Calm, Relax, Meditate, Self Reflect & Sleep
            </Text>
            <Text className="text-sm text-gray-300 text-center leading-5">
              Unlock A Higher Quality Of Life With Our App's Transformative Resources:
              Guided Meditations, Uplifting Affirmations, And Dynamic Visualizations.
            </Text>
          </View>
          <View className="w-full mb-10 px-5">
            <CustomButton
              title="Log in"
              handlePress={() => router.push('/(auth)/Login')}
              containerStyles="bg-white py-4 mb-5 shadow-lg"
              textStyles="text-lg font-bold text-primary"
            />
            <CustomButton
              title="Sign up"
              handlePress={() => router.push('/(auth)/userRegistrationScreen')}
              containerStyles="bg-transparent py-4 border-2 border-white"
              textStyles="text-lg font-bold text-white"
            />
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}