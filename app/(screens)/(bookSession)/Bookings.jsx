import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Search, Building2 } from 'lucide-react-native';
import { images } from '../../../constants';
export default function Bookings() {
    return (
        <SafeAreaView className="flex-1 bg-white p-2">
            {/* Header */}
            <View className="px-4 py-6 flex-row items-center">
                <TouchableOpacity className="p-2">
                    <ChevronLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text className="flex-1 text-center text-2xl font-bold mr-8">
                    Bookings
                </Text>
            </View>
            <View className='items-center justify-center my-3'>
                <Image
                    source={images.bookings}

                />

            </View>


            <ScrollView className="flex-1">
                <View>
                    {/* Current Booking Card */}
                    <View className="bg-gray-50 rounded-2xl p-4 mt-4 mb-6">
                        <View className="flex-row items-center">
                            <View className="w-16 h-16 bg-[#6949FF] rounded-2xl items-center justify-center">
                                <Building2 size={32} color="#fff" />
                            </View>
                            <View className="flex-1 ml-4">
                                <Text className="text-xl font-bold">1 to 1 Session</Text>
                                <Text className="text-gray-600 mt-1">Date: 15/9/2024</Text>
                                <Text className="text-gray-600">Time: 10:30</Text>
                            </View>
                            <TouchableOpacity className="bg-red-100 px-4 py-2 rounded-full">
                                <Text className="text-red-500 font-medium">Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}