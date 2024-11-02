// import React from 'react';
// import { View, Text, Image, TouchableOpacity } from 'react-native';
// import { styled } from "nativewind";
// import { images } from "../../constants";
// import CustomButton from "../../components/CustomButton";

// const UserAuthScreen = () => {
//     return (
        

//         // <View className="flex-1 bg-[#3C1B9B]">

//         //     <View className="flex-1 bg-[#150935] justify-center items-center">
//         //         <Image source={images.homeBg} className="flex-1 opacity-5" />
//         //         <View className="px-6 items-center">
//         //             <Text className="text-white text-2xl font-bold text-center mb-2">
//         //                 Calm, Relax, Meditate, Self Reflect & Sleep
//         //             </Text>
//         //             <Text className="text-white text-base text-center mb-6">
//         //                 Unlock A Higher Quality Of Life With Our App's Transformative Resources:
//         //                 Guided Meditations, Uplifting Affirmations, And Dynamic Visualizations.
//         //             </Text>

//         //             <TouchableOpacity className="w-4/5 py-4 rounded-full bg-white mb-4 items-center">
//         //                 <Text className="text-black text-base">Log in</Text>
//         //             </TouchableOpacity>
//         //             <TouchableOpacity className="w-4/5 py-4 rounded-full border border-white items-center">
//         //                 <Text className="text-white text-base">Sign Up</Text>
//         //             </TouchableOpacity>
//         //         </View>
//         //     </View>
//         // </View>

//     );
// };

// export default UserAuthScreen;

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