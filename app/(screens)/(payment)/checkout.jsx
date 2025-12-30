import { View, Text, SafeAreaView, ScrollView, Image } from 'react-native'
import React from 'react'
import FormField from '../../../components/FormField'
import CustomButton from '../../../components/CustomButton'
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import CreditCard from '../../../components/CreditCard';
import { images } from '../../../constants';

const checkout = () => {
    const params = useLocalSearchParams();
    const { courseId, courseTitle, coursePrice, paymentType } = params;
    const price = parseFloat(coursePrice) || 0;
    const tax = price * 0.1; // 10% tax
    const total = price + tax;

    // Function to go back to the previous screen
    const goBack = () => {
        router.push({
            pathname: '/cardDetails',
            params: { courseId, courseTitle, coursePrice, paymentType }
        });
    };

    const submit = () => {
        const routeParams = {
            ...(courseId && { courseId }),
            ...(courseTitle && { courseTitle }),
            ...(coursePrice && { coursePrice }),
            ...(paymentType && { paymentType }),
        };
        router.push({
            pathname: '/(payment)/successfulPayment',
            params: routeParams
        });
    }
    return (
        <SafeAreaView className='flex-1 bg-white'>
            <View className="bg-white px-6 py-8 items-center justify-center">
                <View className="flex-row items-center justify-center mb-6 mt-6 w-full">
                    <TouchableOpacity onPress={goBack} className="">
                        <ChevronLeft size={24} color="#000" />
                    </TouchableOpacity>
                    <Text className="text-black text-2xl font-semibold ">
                        Checkout
                    </Text>
                </View>

                <View className="bg-white p-6 rounded-lg shadow-md border border-gray-200 w-80">
                    <Text className="text-lg font-semibold text-gray-700 mb-4">Payment Summary</Text>
                    
                    {paymentType === 'course' && courseTitle && (
                        <View className="mb-3 pb-3 border-b border-gray-200">
                            <Text className="text-gray-500 text-sm mb-1">Course</Text>
                            <Text className="text-gray-800 font-medium text-sm">{courseTitle}</Text>
                        </View>
                    )}

                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-500">Subtotal</Text>
                        <Text className="text-gray-800 font-medium">${price > 0 ? price.toFixed(2) : '199.00'}</Text>
                    </View>
                    <View className="border-t border-gray-300 my-2" />

                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-500">Tax</Text>
                        <Text className="text-gray-800 font-medium">${price > 0 ? tax.toFixed(2) : '10.00'}</Text>
                    </View>

                    <View className="border-t border-gray-300 my-2" />

                    <View className="flex-row justify-between">
                        <Text className="text-gray-700 font-semibold">Total</Text>
                        <Text className="text-gray-800 font-semibold">${price > 0 ? total.toFixed(2) : '209.00'}</Text>
                    </View>
                </View>

                <View className="py-4">
                    <Text className='text-lg font-semibold text-black-100 py-4 px-2'>
                        Please Confirm And Submit Your Payment
                    </Text>
                    <Text className='text-lg text-gray-700 py-4 px-2'>
                        By Clicking Pay Now, You Agree To Terms Of Use And Privacy Policy
                    </Text>
                </View>


                <View className="bg-white p-6 rounded-lg shadow-md border border-gray-200 w-80">
                    <Text className="text-lg font-semibold text-gray-700 mb-4">Payment</Text>

                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-500">card *** **** **** 2445</Text>
                        <Text className="text-gray-800 font-medium">7/22</Text>
                    </View>

                </View>
                <View className="w-full px-8" >
                    <CustomButton
                        title="Submit"
                        handlePress={submit}
                        containerStyles="bg-primary py-4 mb-4 mt-4 "
                        textStyles="text-lg font-bold text-white"
                    />
                </View>

            </View>
        </SafeAreaView >
    )
}

export default checkout