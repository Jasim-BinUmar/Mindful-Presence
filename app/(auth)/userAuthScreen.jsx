import React from 'react';
import { View, Text, ImageBackground, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { images } from "../../constants";
import CustomButton from '../../components/CustomButton';
import { router, Redirect } from "expo-router";

export default function userAuthScreen() {
  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <ImageBackground
        source={images.homeBg}
        className="flex-1 "
      >

        <SafeAreaView className="flex-1 justify-between p-5">
          <View className="flex items-center justify-center mt-32 px-16 ">
            <Text className="text-4xl font-bold text-white text-center mb-5">
              Calm, Relax, Meditate, Self Reflect & Sleep
            </Text>
            <Text className="text-base text-gray-400 text-center">
              Unlock A Higher Quality Of Life With Our App's Transformative Resources:
              Guided Meditations, Uplifting Affirmations, And Dynamic Visualizations.
            </Text>
          </View>
          <View className="w-full mb-10 px-5">

            <CustomButton title='Log in'
              handlePress={() => { router.push('/(auth)/LoginOption') }}
              containerStyles="bg-white py-4 mb-4 "
              textStyles="text-lg font-bold text-primary"
            />
            {/* router.push('/(auth)/userRegistrationScreen'); */}

            <CustomButton title='Sign up'
              handlePress={() => { router.push('/(auth)/userRegistrationScreen') }}
              containerStyles="bg-transparent py-4 mb-4 border-2 border-secondary"
              textStyles="text-lg font-bold text-secondary"
            />
            {/* hello world */}
          </View>
        </SafeAreaView>

      </ImageBackground>
    </View>
  );
}