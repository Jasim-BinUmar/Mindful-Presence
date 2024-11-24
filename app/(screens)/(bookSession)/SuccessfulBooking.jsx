import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Check } from 'lucide-react-native';
import { images } from '../../../constants';
import { router } from 'expo-router';

export default function SuccessfulBooking() {
    const handleSubmit = () => {
        // Handle navigation to self assessment
        router.push('../(home)/Home')
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

            {/* Congratulations Text
            <Text className="text-primary text-3xl font-semibold ">
                Congratulations
            </Text> */}

            {/* Registration Complete */}
            <View className="border border-primary rounded-full px-8 py-2 ">
                <Text className="text-primary text-lg">
                    Booking Completed
                </Text>
            </View>

            {/* Description */}

            <Text className="text-center text-gray-800 text-lg mb-3 leading-7">
                Your Booking has been made Our {'\n'}
                therapist will contact you through your{'\n'}
                registered mail in 24 - 48hrs{'\n'}
            </Text>

            {/* Self Assessment Button */}
            <TouchableOpacity
                onPress={handleSubmit}
                className="w-full bg-primary rounded-full py-4 px-6"
            >
                <Text className="text-white text-center text-xl font-semibold">
                    Home
                </Text>
            </TouchableOpacity>
        </View>
    );
}