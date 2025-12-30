import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView, TextInput } from 'react-native';
import { images } from '../../../constants';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import CustomButton from '../../../components/CustomButton';

export default function Questionnaire4() {
    const [emotionalStatus, setEmotionalStatus] = useState('');
    const [error, setError] = useState('');

    const goBack = () => {
        router.back();
    };

    const validateInput = (value) => {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue) || numValue < 1 || numValue > 10) {
            setError('Please enter a number between 1 and 10');
            return false;
        }
        setError('');
        return true;
    };

    const submit = async () => {
        if (!validateInput(emotionalStatus)) {
            return;
        }
        router.replace('/(selfAssesment)/questionnaire5');
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
                {/* Header */}
                <View className="flex-row items-center justify-between px-6 pt-4 pb-4">
                    <TouchableOpacity onPress={goBack} className="p-2">
                        <ChevronLeft size={24} color="#000" />
                    </TouchableOpacity>
                    <Text className="text-black text-lg font-semibold">
                        Self Assessment Questions
                    </Text>
                    <View className="w-10" />
                </View>

                {/* Content */}
                <View className="flex-1 px-6 pb-8">
                    {/* Illustration */}
                    <View className="items-center justify-center my-8">
                        <Image
                            source={images.survey4}
                            style={{ width: 280, height: 280 }}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Question */}
                    <Text className="text-black text-xl font-semibold text-center mb-6">
                        On A Scale Of 1 (Lowest) 10 (Highest) How Would You Rate Your Current Emotional State?
                    </Text>

                    {/* Input Field */}
                    <View className="w-full px-4 mb-6">
                        <TextInput
                            className="w-full h-14 px-4 border-2 border-gray-300 rounded-full text-lg"
                            placeholder="Enter number between 1-10"
                            placeholderTextColor="#9CA3AF"
                            value={emotionalStatus}
                            onChangeText={(value) => {
                                setEmotionalStatus(value);
                                if (value) validateInput(value);
                            }}
                            keyboardType="numeric"
                            maxLength={2}
                        />
                        {error ? (
                            <Text className="text-red-500 mt-2 text-sm">{error}</Text>
                        ) : null}
                    </View>

                    {/* Next Button */}
                    <View className="w-full px-4">
                        <CustomButton
                            title="Next"
                            handlePress={submit}
                            containerStyles="bg-primary py-4 rounded-full"
                            textStyles="text-lg font-bold text-white"
                        />
                    </View>
                </View>

                {/* Footer Line */}
                <View className="h-px bg-black mx-6 mb-4" />
            </ScrollView>
        </SafeAreaView>
    );
}
