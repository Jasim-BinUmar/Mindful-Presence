import React, { useState } from 'react';
import { View, Text, Image, Alert, TouchableOpacity } from 'react-native';
import CustomButton from '../../../components/CustomButton'
import { images } from '../../../constants'
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
export default function questionnaire1() {
    // State to keep track of the selected answer
    const [selectedAgeRange, setSelectedAgeRange] = useState(null);

    // Function to handle selection
    const handleSelect = (ageRange) => {
        setSelectedAgeRange(ageRange);
    };

    // Function to submit response using fetch
    const submitResponse = async () => {
        router.push('/(selfAssesment)/questionnaire2')
        try {
            const response = await fetch('https://your-backend-url/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ageRange: selectedAgeRange,
                }),
            });

            if (response.ok) {
                Alert.alert("Response submitted successfully!");
            } else {
                Alert.alert("Failed to submit response.");
            }
        } catch (error) {
            console.error("Error submitting response:", error);
            // Alert.alert("An error occurred while submitting.");
        }
    };

    // Function to go back to the previous screen
    const goBack = () => {
        router.replace('/(auth)/successfulReg')
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


            <View className="items-center justify-center ">
                <Image
                    source={images.survey1}
                    style={{ width: 250, height: 250 }}
                    resizeMode="contain"
                />
            </View>

            <Text className="text-black text-3xl font-semibold ">
                What is Your Age Range
            </Text>

            <View className="w-full mb-10 px-5">
                <CustomButton
                    title="13 to 18"
                    handlePress={() => {
                        handleSelect('13 to 18');
                        submitResponse();
                    }}
                    containerStyles="bg-secondary-100 py-4 mb-4 border-2 border-gray-500"
                    textStyles="text-lg font-bold bg-secondary-100 text-primary"
                />
                <CustomButton
                    title="18 +"
                    handlePress={() => {
                        handleSelect('18 +');
                        submitResponse();
                    }}
                    containerStyles="bg-secondary-100 py-4 mb-4 border-2 border-gray-500"
                    textStyles="text-lg font-bold bg-secondary-100 text-primary"
                />
            </View>
        </View>
    );
}


// import { View, Text, Image, Touchable, TouchableOpacity } from 'react-native'
// import React from 'react'
// import { SafeAreaView } from 'react-native-safe-area-context'
// import CustomButton from '../../../components/CustomButton'
// import { images } from '../../../constants'
// export default function questionnaire() {
//     return (
//         <View className="flex-1 bg-white px-8 py-8 items-center justify-evenly ">

//             <Text className="text-black text-2xl font-semibold ">
//                 Self Assessment Questions
//             </Text>

//             {/* Success Icon */}
//             <View className="items-center justify-center ">
//                 <Image
//                     source={images.survey1}
//                     style={{ width: 250, height: 250 }}
//                     resizeMode="contain"
//                 />
//             </View>

//             {/* Congratulations Text */}
//             <Text className="text-black text-3xl font-semibold ">
//                 What is Your Age Range
//             </Text>

//             {/* Self Assessment Button */}
//             <View className="w-full mb-10 px-5">

//                 <CustomButton title='13 to 18'
//                     // handlePress={() => { router.push('/(auth)/signUpSubscriber') }}
//                     containerStyles="bg-secondary-100 py-4 mb-4 border-2 border-gray-500"
//                     textStyles="text-lg font-bold bg-secondary-100 text-primary"
//                 />
//                 <CustomButton title='18 +'
//                     // handlePress={() => { router.push('/(auth)/signUpOrg') }}
//                     containerStyles="bg-secondary-100 py-4 mb-4 border-2 border-gray-500"
//                     textStyles="text-lg font-bold bg-secondary-100 text-primary"
//                 />
//             </View>
//         </View>

//     )
// }