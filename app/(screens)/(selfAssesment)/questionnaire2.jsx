import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { images } from '../../../constants';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import QuestionOption from '../../../components/QuestionOption';

export default function Questionnaire2() {
    const [selectedGender, setSelectedGender] = useState(null);

    const handleSelect = (gender) => {
        setSelectedGender(gender);
        setTimeout(() => {
            router.replace('/(selfAssesment)/questionnaire3');
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
                            source={images.survey2}
                            style={{ width: 280, height: 280 }}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Question */}
                    <Text className="text-black text-2xl font-semibold text-center mb-8">
                        What Is Your Gender?
                    </Text>

                    {/* Options */}
                    <View className="w-full px-4">
                        <QuestionOption
                            title="Male"
                            isSelected={selectedGender === 'Male'}
                            onPress={() => handleSelect('Male')}
                        />
                        <QuestionOption
                            title="Female"
                            isSelected={selectedGender === 'Female'}
                            onPress={() => handleSelect('Female')}
                        />
                        <QuestionOption
                            title="Prefer Not To Say"
                            isSelected={selectedGender === 'Prefer Not To Say'}
                            onPress={() => handleSelect('Prefer Not To Say')}
                        />
                    </View>
                </View>

                {/* Footer Line */}
                <View className="h-px bg-black mx-6 mb-4" />
            </ScrollView>
        </SafeAreaView>
    );
}
