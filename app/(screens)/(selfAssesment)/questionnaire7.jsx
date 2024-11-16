import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import CustomButton from '../../../components/CustomButton';
import { images } from '../../../constants';
import { ChevronLeft } from 'lucide-react-native';
import { Link, router } from 'expo-router';

export default function Questionnaire7() {
    const [emotionalStatus, setEmotionalStatus] = useState('');
    const [error, setError] = useState('');

    const goBack = () => {
        router.replace('/(selfAssesment)/questionnaire6');
    };
    const validateInput = (itemValue) => {
        if (!itemValue || itemValue.trim() === '') {
            throw new Error('Please select an option');
        }
    };
    const submit = async () => {
        // if (!validateInput(emotionalStatus)) {
        //     return;
        // }
        router.replace('/(selfAssesment)/questionnaire8');
        if (emotionalStatus) {
            console.log('Selected option:', emotionalStatus);
            // Add your submission logic here
            setError(''); // Clear any previous error
            // Navigate to the next screen or show a success message
        } else {
            setError('Please select an option');
        }
    };

    return (
        <ScrollView className="bg-white">
            <View className="bg-white px-8 py-8 items-center justify-evenly">
                <View className="flex-row items-center mb-6 w-full">
                    <TouchableOpacity onPress={goBack} className="pr-2">
                        <Link href="/(home)/homeScreen">
                            <ChevronLeft size={24} color="#000" />
                        </Link>
                    </TouchableOpacity>
                    <Text className="text-black text-2xl font-semibold ml-4">
                        Self Assessment Questions
                    </Text>
                </View>

                <View className=''>
                    <Image
                        source={images.survey7}
                        style={{ width: '100%', height: undefined, aspectRatio: 1 }}
                        resizeMode="contain"
                    />
                </View>

                <Text className="text-black text-2xl py-5 font-semibold text-center">
                    How would you describe your mood within the last year (could be longer)
                </Text>

                <View className="w-full px-5">
                    <View className="w-full mb-5 border border-gray-100 rounded-xl">
                        <Picker
                            selectedValue={emotionalStatus}
                            onValueChange=
                            {(itemValue) => {
                                setEmotionalStatus(itemValue);
                                validateInput(itemValue);
                            }

                            }

                            accessibilityLabel="Select an option for mental health support"
                        >
                            <Picker.Item label="Joyful moods (e.g happiness, hope)" value="" />
                            <Picker.Item label="Sad Modds (e.g loneliness)" value="" />
                            <Picker.Item label="Anxiety moods (e.g worry, fear)" value="" />
                            <Picker.Item label="Irritable moods (e.g anger, aggression)" value="" />
                        </Picker>
                    </View>
                    {/* <View className="w-full mb-5 border border-gray-100 rounded-xl">
                        <Picker
                            selectedValue={emotionalStatus}
                            onValueChange=
                            {(itemValue) => {
                                setEmotionalStatus(itemValue);
                                validateInput(itemValue);
                            }

                            }

                            accessibilityLabel="Select an option for mental health support"
                        >
                            <Picker.Item label="Sad" value="" />
                            <Picker.Item label="Feeling blues" value="feeling blues" />

                        </Picker>
                    </View> */}
                    {error ? <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text> : null}
                    <CustomButton
                        title="Submit"
                        handlePress={submit}
                        containerStyles="bg-primary py-4 mb-4 mt-4"
                        textStyles="text-lg font-bold text-white"
                    />
                </View>
            </View>
        </ScrollView >
    );
}