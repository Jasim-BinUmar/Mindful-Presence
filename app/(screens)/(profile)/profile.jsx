import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { icons } from '../../../constants';
import { router } from 'expo-router';
import { logout } from '../../../lib/appWrite'; // Update the import path as needed

export default function Component() {
    const handleLogout = async () => {
        try {
            await logout();
            Alert.alert('Logged out', 'You have been successfully logged out.');
            router.replace('/(auth)/userAuthScreen'); // Navigates to the login screen or any other desired route
        } catch (error) {
            Alert.alert('Error', 'Failed to logout. Please try again.');
        }
    };

    const menuItems = [
        {
            title: 'Profile',
            link: '/EditProfile',
            icon: icons.profileicon,
        },
        {
            title: 'Self Assesment',
            link: '/(selfAssesment)/questionnaire1',
            icon: icons.selfAssesmentIcon,
        },
        {
            title: 'Payments History',
            link: '/(payment)/paymentHistory',
            icon: icons.paymentIcon,
        },
        {
            title: 'Bookings',
            link: '/(bookSession)/BookSession',
            icon: icons.bookingIcon,
        },
        {
            title: 'Support',
            link: '/(support)/support',
            icon: icons.supportIcon,
        },
    ];

    return (
        <SafeAreaView className="flex-1 ">
            <ScrollView className="flex-1 bg-white">
                <View className="p-4">
                    <TouchableOpacity className="w-10 h-10 justify-center">
                        <ChevronLeft size={24} color="#000" />
                    </TouchableOpacity>

                    <View className="items-center mt-4">
                        <Image
                            source={{ uri: 'https://bootdey.com/img/Content/avatar/avatar6.png' }}
                            className="w-28 h-28 rounded-full bg-purple-600"
                        />
                        <Text className="text-2xl font-semibold mt-4">Ferdous Parker</Text>
                        <Text className="text-gray-500 mt-1">FerdousParker@test.com</Text>
                    </View>

                    <View className="mt-8 space-y-4 p-4">
                        {menuItems.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                activeOpacity={0.5}
                                className="flex-row items-center justify-between px-4 py-5 m-2 bg-gray-50 rounded-full border border-gray-100"
                                onPress={() => { router.push(`${item.link}`); }}
                            >
                                <View className="flex-row items-center space-x-3 ">
                                    <Image source={item.icon} className="mr-4" />
                                    <Text className="text-base font-medium">{item.title}</Text>
                                </View>
                                <ChevronRight size={20} color="#666" />
                            </TouchableOpacity>
                        ))}

                        {/* Logout Button */}
                        <TouchableOpacity
                            activeOpacity={0.5}
                            className="flex-row items-center justify-center px-4 py-5 m-2 bg-red-500 rounded-full border border-gray-100"
                            onPress={handleLogout}
                        >
                            <View className="flex-row items-center justify-center space-x-3">
                                <Text className="text-base font-medium text-white justify-center items-center">Logout</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
