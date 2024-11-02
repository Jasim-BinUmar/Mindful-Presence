import React from 'react';
import { View, Text, ImageBackground, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { images } from "../../constants";
export default function MeditationBackground() {
  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <ImageBackground
        source={images.homeBg}
        className="flex-1 "
      >
        
          <SafeAreaView className="flex-1 justify-between p-5">
            <View className="flex items-center justify-center mt-32 px-16">
              <Text className="text-4xl font-bold text-white text-center mb-5">
                Calm, Relax, Meditate, Self Reflect & Sleep
              </Text>
              <Text className="text-base text-gray-400 text-center">
                Unlock A Higher Quality Of Life With Our App's Transformative Resources:
                Guided Meditations, Uplifting Affirmations, And Dynamic Visualizations.
              </Text>
            </View>
            <View className="w-full mb-10 px-5">
              <TouchableOpacity className="bg-white py-4 rounded-full items-center mb-4">
                <Text className="text-lg font-bold text-[#3C1B9B]">Log in</Text>
              </TouchableOpacity>
              <TouchableOpacity className="border-2 border-white py-4 rounded-full items-center">
                <Text className="text-lg font-bold text-white">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        
      </ImageBackground>
    </View>
  );
}