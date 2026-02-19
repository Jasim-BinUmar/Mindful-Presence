import { View, Text } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import CreditCard from '../../../components/CreditCard';
import { TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import CustomButton from '../../../components/CustomButton';

export default function paymentMethod() {
    const params = useLocalSearchParams();
    const { courseId, courseTitle, coursePrice, paymentType } = params;

    // State to keep track of the selected credit method
    const [paymentMethod, setPaymentMethod] = useState(null);

    // Function to handle selection
    const handleSelect = (payment) => {
        setPaymentMethod(payment);
    };

    const submitResponse = () => {
        const routeParams = {
            ...(courseId && { courseId }),
            ...(courseTitle && { courseTitle }),
            ...(coursePrice && { coursePrice }),
            ...(paymentType && { paymentType }),
        };
        router.push({
            pathname: '/(payment)/cardDetails',
            params: routeParams
        });
    }

    // Function to go back to the previous screen
    const goBack = () => {
        if (paymentType === 'course') {
            router.push({
                pathname: '/(payment)/coursePayment',
                params: { courseId, courseTitle, coursePrice }
            });
        } else {
            router.push('/(payment)/Payment');
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View className="flex-1 bg-white px-8 py-4 items-center  ">
                <View className="flex-row items-center mb-6">
                    <TouchableOpacity className="pr-2" onPress={goBack}>
                        <ChevronLeft size={24} color="#000" />
                    </TouchableOpacity>

                    <Text className="text-black text-2xl font-semibold ml-4">
                        Pricing Plan
                    </Text>
                </View>

                <View>
                    <CreditCard cardHolder="KELLY OLIVER" lastFour="8014" expiry="08/21" />
                </View>

                <View className="w-full py-4">
                    <CustomButton title="Paypal"
                        handlePress={() => {
                            handleSelect('Paypal');
                            submitResponse();
                        }}
                        containerStyles="bg-white py-4 mb-4 border border-gray"
                        textStyles="text-lg font-bold text-black"
                    />
                    <CustomButton title="Credit Card"
                        handlePress={() => {
                            handleSelect('Credit Card');
                            submitResponse();
                        }}
                        containerStyles="bg-white py-4 mb-4 border border-gray"
                        textStyles="text-lg font-bold  text-black"
                    />
                    <CustomButton title="Apple Pay"
                        handlePress={() => {
                            handleSelect('Apple Pay');
                            submitResponse();
                        }}
                        containerStyles="bg-white py-4 mb-4 border border-gray"
                        textStyles="text-lg font-bold text-black"
                    />
                </View>

            </View>

        </SafeAreaView>

    )
}