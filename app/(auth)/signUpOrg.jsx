import { View, Text, SafeAreaView, ScrollView } from 'react-native'
import React from 'react'
import FormField from '../../components/FormField'
import CustomButton from '../../components/CustomButton'
import { StatusBar } from 'expo-status-bar';
const signUpOrg = () => {
    return (
        // <SafeAreaView style={{ flex: 1, backgroundColor: '#6A3DE8' }}>
        //   <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}></View>
        <SafeAreaView className="flex-1 bg-secondary-100 h-full">
            <StatusBar style="dark" />
            <ScrollView >
            
                <View className='flex-1 mt-12 items-center  '>
                    <Text className='font-extrabold text-lg'>Create An Account</Text>
                </View>
                <View className=" w-full justify-center min-h-[75vh] px-4 mb-6 ">
                    <FormField
                        title="First Name"
                        handleChangeText={() => { }}
                        otherStyles=""
                        labelStyles="text-gray-500 font-semibold mb-3"
                        outerInput="border-gray-300 focus:border-primary focus:bg-primary"
                        placeholder= "Enter First Name"
                    />
                    <FormField
                        title="Last Name"
                        handleChangeText={() => { }}
                        otherStyles="mt-7"
                        labelStyles="text-gray-500 font-semibold mb-3"
                        outerInput="border-gray-300 focus:border-primary focus:bg-primary"
                        placeholder= "Enter Last Name"

                    />
                    <FormField
                        title="Email"
                        handleChangeText={() => { }}
                        otherStyles="mt-7"
                        labelStyles="text-gray-500 font-semibold mb-3"
                        outerInput="border-gray-300 focus:border-primary focus:bg-primary"
                        placeholder= "Enter Email"
                        keyboardType="email-address"
                    />
                    <FormField
                        title="Password"
                        handleChangeText={() => { }}
                        otherStyles="mt-7"
                        labelStyles="text-gray-500 font-semibold mb-3"
                        outerInput="border-gray-300 focus:border-primary focus:bg-primary"
                        placeholder= "Enter Password"
                    />
                    <FormField
                        title="Confirm Password"
                        handleChangeText={() => { }}
                        otherStyles="mt-7"
                        labelStyles="text-gray-500 font-semibold mb-4"
                        outerInput="border-gray-300 focus:border-primary focus:bg-primary"
                        placeholder= "Confirm Password"

                    />
                    <FormField
                        title="Organization Code"
                        handleChangeText={() => { }}
                        otherStyles="mt-7"
                        labelStyles="text-gray-500 font-semibold mb-4"
                        outerInput="border-gray-300 focus:border-primary focus:bg-primary"
                        placeholder= "Enter Organization Code"

                    />
                    
                </View>
                <View>
                    <CustomButton
                        title='Sign Up'
                        handlePress={()=>{}}
                        containerStyles="bg-primary py-4 mb-4 rounded-full mx-3"
                        textStyles="text-lg font-bold text-secondary"
                    />
                </View>


            </ScrollView>
        </SafeAreaView>
    )
}

export default signUpOrg