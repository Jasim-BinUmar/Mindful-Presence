import React from 'react'
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native'
import { ChevronLeft, ChevronRight, CreditCard, Calendar, HeadphonesIcon } from 'lucide-react-native'
import { icons } from '../../../constants'
export default function Component() {
    const menuItems = [
        {
            title: 'Profile',
            // icon: '👨‍🎓'
            icon: icons.profileicon,
        },
        {
            title: 'Self Assesment',
            icon: icons.selfAssesmentIcon,
            // icon: '📋',
        },
        {
            title: 'Payments History',
            icon: icons.paymentIcon,
            // icon: '💳',
        },
        {
            title: 'Bookings',
            icon: icons.bookingIcon,
            // icon: '📅',
        },
        {
            title: 'Support',
            icon: icons.supportIcon,
            // icon: '🎧',
        },
    ]

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
                        <Text className="text-2xl font-semibold mt-4">Ferdous Parker</Text>
                        <Text className="text-gray-500 mt-1">FerdousParker@test.com</Text>
                    </View>

                    {/* Menu Items */}
                    <View className="mt-8 space-y-4 p-4">
                        {menuItems.map((item, index) => (

                            <TouchableOpacity
                                key={index}
                                activeOpacity={0.5}
                                className="flex-row items-center justify-between px-4 py-5 m-2 bg-gray-50 rounded-full border border-gray-100"
                                onPress={() => { }}
                            >
                                <View className="flex-row items-center space-x-3 ">
                                    <Image source={item.icon} className="mr-4" />
                                    {/* <Image className="text-xl pr-4"> source={item.icon} /> */}
                                    <Text className="text-base font-medium">{item.title}</Text>
                                </View>
                                <ChevronRight size={20} color="#666" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}