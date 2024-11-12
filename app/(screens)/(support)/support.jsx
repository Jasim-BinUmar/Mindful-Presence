import React from 'react'
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native'
import { ChevronLeft, ChevronRight, CreditCard, Calendar, HeadphonesIcon } from 'lucide-react-native'
import { icons, images } from '../../../constants'
import { router } from 'expo-router'

export default function support() {


    return (
        <SafeAreaView className="flex-1 ">
            <ScrollView className="flex-1 bg-white">
                <View className="px-4 mt-4">
                    {/* Header with back button */}
                    <TouchableOpacity className="w-10 h-10 justify-center">
                        <ChevronLeft size={24} color="#000" />
                    </TouchableOpacity>

                    {/* Profile Section */}
                    <View className="items-center mt-4">
                        <Text className="text-black text-2xl font-semibold pb-3">
                            Support Screen
                        </Text>
                        <Image
                            source={images.support}
                            style={{ width: 250, height: 250 }}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Menu Items */}
                    <View className="mt-8 space-y-4 p-4">

                        <Text className="text-black text-xl font-semibold">Call Us</Text>
                        <TouchableOpacity
                            activeOpacity={0.5}
                            className="flex-row items-center justify-between px-4 py-5 m-2 bg-gray-50 rounded-full border border-gray-100"
                            onPress={() => { }}
                        >
                            <View className="flex-row items-center space-x-3 ">
                                <Image source={icons.phone} className="mr-4" />
                                <Text className="text-base font-medium text-gray-500">+922 333 444 555</Text>
                            </View>
                        </TouchableOpacity>
                        <Text className="text-black text-xl font-semibold">Email us </Text>
                        <TouchableOpacity
                            activeOpacity={0.5}
                            className="flex-row items-center justify-between px-4 py-5 m-2 bg-gray-50 rounded-full border border-gray-100"
                            onPress={() => { }}
                        >
                            <View className="flex-row items-center space-x-3 ">
                                <Image source={icons.email} className="mr-4" />
                                <Text className="text-base font-medium text-gray-500" >Ferdusparler@gmail.com</Text>
                            </View>
                        </TouchableOpacity>
                        <Text className="text-black text-xl font-semibold">Whatsapp</Text>
                        <TouchableOpacity
                            activeOpacity={0.5}
                            className="flex-row items-center justify-between px-4 py-5 m-2 bg-gray-50 rounded-full border border-gray-100"
                            onPress={() => { }}
                        >
                            <View className="flex-row items-center space-x-3 ">
                                <Image source={icons.whatsapp} className="mr-4" />
                                <Text className="text-base font-medium text-gray-500">+41 34567 77877</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}