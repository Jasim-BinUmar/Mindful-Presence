import { View, Text, SafeAreaView, ScrollView } from 'react-native'
import React from 'react'
import FormField from '../../../components/FormField'
import CustomButton from '../../../components/CustomButton'
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import CreditCard from '../../../components/CreditCard';

const checkout = () => {

    // Function to go back to the previous screen
    const goBack = () => {
        router.push('/(selfAssesment)/questionnaire1');
    };

    return (
        <SafeAreaView style={{ flex: 1 }} className="mt-6">
            <ScrollView >
                <View className="flex-1 px-8 py-4 items-center justify-center ">

                    <View className='flex-row items-center mb-6 '>

                        <TouchableOpacity className="pr-2"
                            handlePress={goBack}
                        >
                            <ChevronLeft size={24} color="#000" />
                        </TouchableOpacity>

                        <Text className="text-black text-2xl font-semibold ml-4">
                            Card Information
                        </Text>
                    </View>

                </View>
                <View>
                    <CreditCard cardHolder="KELLY OLIVER" lastFour="8014" expiry="08/21" />
                </View>
                <View>
                    <CustomButton
                        title='Sign Up'
                        handlePress={() => { router.push('/successfulPayment') }}
                        containerStyles="bg-primary py-4 mb-4 rounded-full mx-3"
                        textStyles="text-lg font-bold text-secondary"
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default checkout