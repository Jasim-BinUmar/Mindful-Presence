import { View, Text, SafeAreaView, ScrollView } from 'react-native'
import React from 'react'
import FormField from '../../../components/FormField'
import CustomButton from '../../../components/CustomButton'
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

const cardDetails = () => {
    const params = useLocalSearchParams();
    const { courseId, courseTitle, coursePrice, paymentType } = params;

    // Function to go back to the previous screen
    const goBack = () => {
        if (paymentType === 'course') {
            router.push({
                pathname: '/(payment)/paymentMethod',
                params: { courseId, courseTitle, coursePrice, paymentType }
            });
        } else {
            router.push('../(home)/Home');
        }
    };

    const handleCheckout = () => {
        const routeParams = {
            ...(courseId && { courseId }),
            ...(courseTitle && { courseTitle }),
            ...(coursePrice && { coursePrice }),
            ...(paymentType && { paymentType }),
        };
        router.push({
            pathname: '/checkout',
            params: routeParams
        });
    };

    return (
        <SafeAreaView style={{ flex: 1 }} className="mt-6">
            <ScrollView >
                <View className="flex-1 px-8 py-4 items-center justify-center ">

                    <View className='flex-row items-center mb-6 '>

                        <TouchableOpacity className="pr-2"
                            onPress={goBack}
                        >
                            <ChevronLeft size={24} color="#000" />
                        </TouchableOpacity>

                        <Text className="text-black text-2xl font-semibold ml-4">
                            Card Information
                        </Text>
                    </View>

                </View>

                <View className=" w-full justify-center min-h-[75vh] px-4 mb-6 ">
                    <FormField
                        title="Name On Card"
                        handleChangeText={() => { }}
                        otherStyles=""
                        labelStyles="text-gray-500 font-semibold mb-3"
                        outerInput="border-gray-300 focus:border-primary focus:bg-primary"
                        placeholder="Enter First Name"
                    />
                    <FormField
                        title="Credit Card Number"
                        handleChangeText={() => { }}
                        otherStyles="mt-7"
                        labelStyles="text-gray-500 font-semibold mb-3"
                        outerInput="border-gray-300 focus:border-primary focus:bg-primary"
                        placeholder="Enter Last Name"

                    />
                    <FormField
                        title="Expiration Date"
                        handleChangeText={() => { }}
                        otherStyles="mt-7"
                        labelStyles="text-gray-500 font-semibold mb-3"
                        outerInput="border-gray-300 focus:border-primary focus:bg-primary"
                        placeholder="Enter Email"
                        keyboardType="email-address"
                    />
                    <FormField
                        title="CVC"
                        handleChangeText={() => { }}
                        otherStyles="mt-7"
                        labelStyles="text-gray-500 font-semibold mb-3"
                        outerInput="border-gray-300 focus:border-primary focus:bg-primary"
                        placeholder="Enter Password"
                    />
                    <FormField
                        title="Country"
                        handleChangeText={() => { }}
                        otherStyles="mt-7"
                        labelStyles="text-gray-500 font-semibold mb-4"
                        outerInput="border-gray-300 focus:border-primary focus:bg-primary"
                        placeholder="Confirm Password"

                    />
                    <FormField
                        title="ZIP"
                        handleChangeText={() => { }}
                        otherStyles="mt-7"
                        labelStyles="text-gray-500 font-semibold mb-4"
                        outerInput="border-gray-300 focus:border-primary focus:bg-primary"
                        placeholder="Enter Organization Code"

                    />

                </View>
                <View>
                    <CustomButton
                        title='Continue'
                        handlePress={handleCheckout}
                        containerStyles="bg-primary py-4 mb-4 rounded-full mx-3"
                        textStyles="text-lg font-bold text-secondary"
                    />
                </View>

            </ScrollView>
        </SafeAreaView>
    )
}

export default cardDetails