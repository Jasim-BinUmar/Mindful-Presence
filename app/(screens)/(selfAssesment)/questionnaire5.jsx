import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import CustomButton from '../../../components/CustomButton';
import { images } from '../../../constants';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';

export default function Questionnaire5() {
    const [selectedOption, setSelectedOption] = useState('');
    const [error, setError] = useState('');

    const goBack = () => {
        router.back();
    };

    const submit = async () => {
        if (!selectedOption) {
            setError('Please select an option');
            return;
        }
        setError('');
        router.replace('/(selfAssesment)/questionnaire6');
    };

    const options = [
        { label: 'I see/have seen a therapist', value: 'therapist' },
        { label: 'Exercise regularly', value: 'exercise' },
        { label: 'Practice mindfulness or meditation', value: 'mindfulness' },
        { label: 'Talk to friends or family', value: 'socialSupport' },
        { label: 'Seek professional help', value: 'professionalHelp' },
        { label: 'Engage in hobbies', value: 'hobbies' },
        { label: 'Other', value: 'other' },
    ];

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
                            source={images.survey5}
                            style={{ width: 280, height: 280 }}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Question */}
                    <Text className="text-black text-xl font-semibold text-center mb-6">
                        If Anything, What Do You Do To Help With Your Mental Health Or Emotional State?
                    </Text>

                    {/* Dropdown */}
                    <View className="w-full px-4 mb-6">
                        <View className="w-full border-2 border-gray-300 rounded-full overflow-hidden">
                            <Picker
                                selectedValue={selectedOption}
                                onValueChange={(itemValue) => {
                                    setSelectedOption(itemValue);
                                    setError('');
                                }}
                                style={{ height: 50 }}
                            >
                                <Picker.Item label="Select an option" value="" />
                                {options.map((option) => (
                                    <Picker.Item
                                        key={option.value}
                                        label={option.label}
                                        value={option.value}
                                    />
                                ))}
                            </Picker>
                        </View>
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