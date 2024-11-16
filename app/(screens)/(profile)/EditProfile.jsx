import React from 'react'
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView, TextInput } from 'react-native'
import { ChevronLeft, ChevronRight, CreditCard, Calendar, HeadphonesIcon } from 'lucide-react-native'
import { icons } from '../../../constants'
import { router } from 'expo-router'

export default function EditProfile() {

    return (
        <SafeAreaView className="flex-1 ">
            <ScrollView className="flex-1 bg-white">
                <View className="p-4">
                    {/* Header with back button */}
                    <TouchableOpacity className="w-10 h-10 justify-center">
                        <ChevronLeft size={24} color="#000" />
                    </TouchableOpacity>

                    {/* Profile Section */}
                    <View className="items-center mt-4">
                        <Image
                            source={{ uri: 'https://bootdey.com/img/Content/avatar/avatar6.png' }}
                            className="w-28 h-28 rounded-full bg-purple-600"
                        />
                    </View>

                    <View className="bg-white p-2 mt-8 space-y-4">
                        {/* <Text className="text-lg font-semibold text-gray-700 mb-4">Payment Summary</Text> */}

                        <View className="py-2">
                            <Text className="text-black">First Name</Text>
                            <TextInput
                                className="py-2 border-b border-gray-300 "
                                placeholder="Ferdous"
                            />

                        </View>

                        <View className="py-2">
                            <Text className="text-black">Last Name</Text>
                            <TextInput
                                className="py-2 border-b border-gray-300 "
                                placeholder="Parker"
                            />

                        </View>
                        
                        <View className="py-2">
                            <Text className="text-black">Email</Text>
                            <TextInput
                                className="py-2 border-b border-gray-300 "
                                placeholder="Ferdous@gmail.com"
                            />

                        </View>

                        <View className="py-2">
                            <Text className="text-black">OTP</Text>
                            <TextInput
                                className="py-2 border-b border-gray-300 "
                                placeholder="**"
                            />

                        </View>

                    </View>

                    {/* Menu Items */}
                    <View className="mt-8 space-y-4 py-4">
                        <TouchableOpacity
                            activeOpacity={0.7}
                            className="flex-row items-center justify-between px-4 py-5 m-2 bg-primary rounded-full border border-gray-100"
                            onPress={() => { router.push('/EditProfile') }}
                        >
                            <View className="flex-1 items-center">

                                <Text className="text-base font-medium text-white">Save</Text>
                            </View>
                        </TouchableOpacity>

                       
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}