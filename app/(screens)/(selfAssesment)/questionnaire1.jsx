import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { images } from '../../../constants';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import QuestionOption from '../../../components/QuestionOption';

export default function Questionnaire1() {
    const [selectedAgeRange, setSelectedAgeRange] = useState(null);

    const handleSelect = (ageRange) => {
        setSelectedAgeRange(ageRange);
        // Auto-navigate after selection
        setTimeout(() => {
            router.replace('/(selfAssesment)/questionnaire2');
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
                    {/* Illustration */}
                    <View className="items-center justify-center my-8">
                        <Image
                            source={images.survey1}
                            style={{ width: 280, height: 280 }}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Question */}
                    <Text className="text-black text-2xl font-semibold text-center mb-8">
                        What Is Your Age Range?
                    </Text>

                    {/* Options */}
                    <View className="w-full px-4">
                        <QuestionOption
                            title="13-18"
                            isSelected={selectedAgeRange === '13-18'}
                            onPress={() => handleSelect('13-18')}
                        />
                        <QuestionOption
                            title="18+"
                            isSelected={selectedAgeRange === '18+'}
                            onPress={() => handleSelect('18+')}
                        />
                    </View>
                </View>

                {/* Footer Line */}
                <View className="h-px bg-black mx-6 mb-4" />
            </ScrollView>
        </SafeAreaView>
    );
}

