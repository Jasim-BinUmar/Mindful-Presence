import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Check } from 'lucide-react-native';
import { images } from '../../../constants';
import { router } from 'expo-router';

export default function successfulPayment() {
    const handleSelfAssessment = () => {
        // Handle navigation to self assessment
        router.push('/(payment)/paymentMethod')
        console.log('Navigating to self assessment...');
    };

    return (
        <View className="flex-1 bg-white px-8 py-16  items-center justify-center ">
            {/* Success Icon */}
            <View className="items-center justify-center ">
                <Image
                    source={images.successIcon}
                    style={{ width: 150, height: 150 }}
                    resizeMode="contain"
                />
            </View>

            {/* Congratulations Text */}
            <Text className="text-primary text-3xl font-semibold mb-12 mt-12">
                Congratulations
            </Text>

            {/* Description */}
            <Text className="text-center text-gray-800 text-lg mb-6 leading-7">
                Your Payment has been Completed Successfully
            </Text>

            {/* Self Assessment Button */}
            <TouchableOpacity
                onPress={handleSelfAssessment}
                className="w-full bg-primary rounded-full py-4 px-6 mb-6"
            >
                <Text className="text-white text-center text-xl font-semibold">
                    Continue
                </Text>
            </TouchableOpacity>
        </View>
    );
}