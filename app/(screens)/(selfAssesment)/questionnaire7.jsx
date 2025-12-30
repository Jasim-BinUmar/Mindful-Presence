import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import CustomButton from '../../../components/CustomButton';
import { images } from '../../../constants';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';

export default function Questionnaire7() {
    const [selectedMood, setSelectedMood] = useState('');
    const [error, setError] = useState('');

    const goBack = () => {
        router.back();
    };

    const submit = async () => {
        if (!selectedMood) {
            setError('Please select an option');
            return;
        }
        setError('');
        router.replace('/(selfAssesment)/questionnaire8');
    };

    const moodOptions = [
        { label: 'Joyful Moods', value: 'joyful' },
        { label: 'Sad Moods', value: 'sad' },
        { label: 'Anxious Moods', value: 'anxious' },
        { label: 'Irritable Moods', value: 'irritable' },
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
                            source={images.survey7}
                            style={{ width: 280, height: 280 }}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Question */}
                    <Text className="text-black text-xl font-semibold text-center mb-6">
                        How Would You Describe Your Mood Within The Last Year (Could Be Longer)
                    </Text>

                    {/* Dropdown */}
                    <View className="w-full px-4 mb-6">
                        <View className="w-full border-2 border-gray-300 rounded-full overflow-hidden">
                            <Picker
                                selectedValue={selectedMood}
                                onValueChange={(itemValue) => {
                                    setSelectedMood(itemValue);
                                    setError('');
                                }}
                                style={{ height: 50 }}
                            >
                                <Picker.Item label="Select an option" value="" />
                                {moodOptions.map((option) => (
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