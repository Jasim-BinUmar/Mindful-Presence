import React, { useState } from 'react';
import { View, Text, Image, Alert, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import CustomButton from '../../../components/CustomButton';
import FormField from '../../../components/FormField';
import { images } from '../../../constants';
import { ChevronLeft } from 'lucide-react-native';
import { Link, router } from 'expo-router';

export default function Questionnaire4() {
    const [emotionalStatus, setEmotionalStatus] = useState('');
    const [error, setError] = useState('');

    const goBack = () => {
        // <Link href={('/(home)/homeScreen')}/>
        router.push('/(auth)/successfulReg');
        // <Link href="/(home)/homeScreen">
        //     <ChevronLeft size={24} color="#000" />
        // </Link>
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
        router.replace('/(selfAssesment)/questionnaire5')

        // try {
        //     const response = await fetch('https://your-backend-url/api/submit', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify({
        //             emotionalStatus: parseInt(emotionalStatus, 10),
        //         }),
        //     });

        //     if (response.ok) {
        //         Alert.alert("Response submitted successfully!");
        //         router.push('/(selfAssesment)/questionnaire5');
        //     } else {
        //         Alert.alert("Failed to submit response.");
        //     }
        // } catch (error) {
        //     console.error("Error submitting response:", error);
        //     Alert.alert("An error occurred while submitting.");
        // }
    };

    return (
        <ScrollView className="bg-white">
            <View className="bg-white px-8 py-8 items-center justify-evenly">
                <View className="flex-row items-center mb-6 w-full">
                    <TouchableOpacity onPress={goBack} className="pr-2">
                        <Link href="/(selfAssessment)/questionnaire3">
                            <ChevronLeft size={24} color="#000" />
                        </Link>
                    </TouchableOpacity>
                    <Text className="text-black text-2xl font-semibold ml-4">
                        Self Assessment Questions
                    </Text>
                </View>

                <View className=''>
                    <Image
                        source={images.survey4}
                        style={{ width: '100%', height: undefined, aspectRatio: 1 }}
                        resizeMode="contain"
                    />
                </View>

                <Text className="text-black text-2xl py-5 font-semibold text-center">
                    On a scale of 1 (lowest) to 10 (highest), how would you rate your current emotional state?
                </Text>

                <View className="w-full px-5">
                    <FormField
                        placeholder="Enter a number from 1 to 10"
                        value={emotionalStatus}
                        handleChangeText=
                        {(value) => {
                            setEmotionalStatus(value);
                            validateInput(value);
                        }}
                        otherStyles="mt-3 border-gray-100"
                        keyboardType="numeric"
                    />
                    {error ? <Text className="text-red-500 mt-2">{error}</Text> : null}
                    <CustomButton
                        title="Submit"
                        handlePress={submit}
                        containerStyles="bg-primary py-4 mb-4 mt-4"
                        textStyles="text-lg font-bold text-white"
                    />
                </View>
            </View>
        </ScrollView>
    );
}
