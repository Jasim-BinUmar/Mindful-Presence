import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Check } from 'lucide-react-native';
import { images } from '../../constants';
import { router } from 'expo-router';

export default function SuccessfulReg() {
    const handleSelfAssessment = () => {
        // Handle navigation to self assessment
        router.push('/(payment)/checkout')
        console.log('Navigating to self assessment...');
    };

    return (
        <View className="flex-1 bg-white px-8 py-16 items-center justify-evenly ">
            {/* Success Icon */}
            <View className="items-center justify-center ">
                <Image
                    source={images.successIcon}
                    style={{ width: 150, height: 150 }}
                    resizeMode="contain"
                />
            </View>

            {/* Congratulations Text */}
            <Text className="text-primary text-3xl font-semibold ">
                Congratulations
            </Text>

            {/* Registration Complete */}
            <View className="border border-primary rounded-full px-8 py-2 ">
                <Text className="text-primary text-lg">
                    Registration Completed
                </Text>
            </View>

            {/* Description */}
            <Text className="text-center text-gray-800 text-lg mb-12 leading-7">
                This App includes resources For all types{'\n'}
                of people. So to get personalized{'\n'}
                relevant resources do the self{'\n'}
                Assesment. You can always redo it by{'\n'}
                going into your Profile.
            </Text>

            {/* Self Assessment Button */}
            <TouchableOpacity
                onPress={handleSelfAssessment}
                className="w-full bg-primary rounded-full py-4 px-6"
            >
                <Text className="text-white text-center text-xl font-semibold">
                    Self Assesment
                </Text>
            </TouchableOpacity>
        </View>
    );
}