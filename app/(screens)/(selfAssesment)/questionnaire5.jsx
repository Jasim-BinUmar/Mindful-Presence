import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import CustomButton from '../../../components/CustomButton';
import { images } from '../../../constants';
import { ChevronLeft } from 'lucide-react-native';
import { Link, router } from 'expo-router';

export default function Questionnaire5() {
    const [emotionalStatus, setEmotionalStatus] = useState('');
    const [error, setError] = useState('');

    const goBack = () => {
        router.push('/(auth)/successfulReg');
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
        router.push('/(selfAssesment)/questionnaire6');
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
                        source={images.survey5}
                        style={{ width: '100%', height: undefined, aspectRatio: 1 }}
                        resizeMode="contain"
                    />
                </View>

                <Text className="text-black text-2xl py-5 font-semibold text-center">
                    If anything, what do you do to help with your mental health or emotional state?
                </Text>

                <View className="w-full px-5">
                    <Picker
                        selectedValue={emotionalStatus}
                        onValueChange=
                        {(itemValue) => {
                            setEmotionalStatus(itemValue);
                            validateInput(itemValue);
                        }

                        }

                        style={{ width: '100%', marginBottom: 20, borderBlockColor: 'grey' }}
                        accessibilityLabel="Select an option for mental health support"
                    >
                        <Picker.Item label="Select an option" value="" />
                        <Picker.Item label="Exercise regularly" value="exercise" />
                        <Picker.Item label="Practice mindfulness or meditation" value="mindfulness" />
                        <Picker.Item label="Talk to friends or family" value="socialSupport" />
                        <Picker.Item label="Seek professional help" value="professionalHelp" />
                        <Picker.Item label="Engage in hobbies" value="hobbies" />
                        <Picker.Item label="Other" value="other" />
                    </Picker>
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