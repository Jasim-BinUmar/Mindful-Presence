import { View, Text, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'
import FormField from '../../components/FormField'
import CustomButton from '../../components/CustomButton'
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
const Login = () => {
    return (
        // <SafeAreaView style={{ flex: 1, backgroundColor: '#6A3DE8' }}>
        //   <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}></View>
        <SafeAreaView className="flex-1 bg-secondary-100 h-full">
            <StatusBar style="dark" />
            <ScrollView >

                <View className='flex-1 mt-12 items-center  '>
                    <Text className='font-bold text-2xl'>Log In</Text>
                </View>
                <View className=" w-full justify-start min-h-[75vh] px-4 mb-6 ">

                    <FormField
                        title="Email"
                        handleChangeText={() => { }}
                        otherStyles="mt-7"
                        labelStyles="text-gray-500 font-semibold mb-3"
                        outerInput="border-gray-300 focus:border-primary focus:bg-primary"
                        placeholder="Enter Email"
                        keyboardType="email-address"
                    />
                    <FormField
                        title="Password"
                        handleChangeText={() => { }}
                        otherStyles="mt-7"
                        labelStyles="text-gray-500 font-semibold mb-3"
                        outerInput="border-gray-300 focus:border-primary focus:bg-primary"
                        placeholder="Enter Password"
                    />
                    <View className='mt-10'>
                        <CustomButton
                            title='Log In'
                            handlePress={() => { router.replace('/(home)/Home') }}
                            containerStyles="bg-primary rounded-full  w-full "
                            textStyles="text-lg font-bold text-secondary"
                        />
                    </View>

                </View>



            </ScrollView>
        </SafeAreaView>
    )
}

export default Login