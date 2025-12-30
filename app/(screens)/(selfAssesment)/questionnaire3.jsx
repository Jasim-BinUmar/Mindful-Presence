import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import QuestionOption from '../../../components/QuestionOption';

export default function Questionnaire3() {
    const [selectedReligion, setSelectedReligion] = useState(null);
    const religions = ['Muslim', 'Christian', 'Hindu', 'Jewish', 'Buddhist', 'No Religion', 'Other'];

    const handleSelect = (religion) => {
        setSelectedReligion(religion);
        setTimeout(() => {
            router.replace('/(selfAssesment)/questionnaire4');
        }, 300);
    };

    const goBack = () => {
        router.back();
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
                    {/* Question */}
                    <Text className="text-black text-2xl font-semibold text-center mb-8 mt-8">
                        Choose The Religion You Belong To
                    </Text>

                    {/* Options */}
                    <View className="w-full px-4">
                        {religions.map((religion, index) => (
                            <QuestionOption
                                key={index}
                                title={religion}
                                isSelected={selectedReligion === religion}
                                onPress={() => handleSelect(religion)}
                            />
                        ))}
                    </View>
                </View>

                {/* Footer Line */}
                <View className="h-px bg-black mx-6 mb-4" />
            </ScrollView>
        </SafeAreaView>
    );
}

