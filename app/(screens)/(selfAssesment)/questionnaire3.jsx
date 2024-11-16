import React, { useState } from 'react';
import { View, Text, Image, Alert, TouchableOpacity } from 'react-native';
import CustomButton from '../../../components/CustomButton'
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';


export default function questionnaire3() {
    // State to keep track of the selected answer
    const [selectedReligion, setSelectedReligion] = useState(null);
    const religions = ['Muslim', 'Christian','Hindu', 'Jewish', 'Buddhist', 'No Religion', 'Other' ]

    // Function to handle selection
    const handleSelect = (religion) => {
        setSelectedReligion(religion);
    };

    // Function to submit response using fetch
    const submitResponse = async () => {
        router.replace('/(selfAssesment)/questionnaire4')

        // try {
        //     const response = await fetch('https://your-backend-url/api/submit', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify({
        //             religion: selectedReligion,
        //         }),
        //     });

        //     if (response.ok) {
        //         // Alert.alert("Response submitted successfully!");
        //     } else {
        //         // Alert.alert("Failed to submit response.");
        //     }
        // } catch (error) {
        //     console.error("Error submitting response:", error);
        //     // Alert.alert("An error occurred while submitting.");
        // }
    };

    // Function to go back to the previous screen
    const goBack = () => {
        router.push('/(selfAssesment)/questionnaire2')
    };
    

    return (
        <View className="flex-1 bg-white px-8 py-8 items-center justify-evenly ">
            <View className="flex-row items-center mb-6">

                <TouchableOpacity className="pr-2"
                    handlePress={goBack}
                >
                    <ChevronLeft size={24} color="#000" />
                </TouchableOpacity>

                <Text className="text-black text-2xl font-semibold ml-4">
                    Self Assessment Questions
                </Text>
            </View>

            <Text className="text-black text-3xl font-semibold ">
                    Choose Your Religion
            </Text>

            <View className="w-full mb-10 px-5">
                
                {/* <CustomButton
                    title={religion}
                    handlePress={() => {
                        handleSelect({religion});
                        submitResponse();
                    }}
                    containerStyles="bg-secondary-100 py-4 mb-4 border-2 border-gray-500"
                    textStyles="text-lg font-bold bg-secondary-100 text-primary"
                /> */}

                  {religions.map((religion, index) => (
                    <CustomButton
                        key={index}
                        title={religion}
                        handlePress={() => {
                            handleSelect(religion);
                            submitResponse();
                        }}
                        containerStyles="bg-secondary-100 py-4 mb-4 border-2 border-gray-500"
                        textStyles="text-lg font-bold bg-secondary-100 text-primary"
                    />
                ))}
            </View>
        </View>
    );
}

