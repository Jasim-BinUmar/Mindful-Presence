import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../../../constants';
import { router, useLocalSearchParams } from 'expo-router';

export default function SuccessfulBooking() {
    const { date, time, appointmentId, doctorName } = useLocalSearchParams();

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = date.getMonth() + 1; // No leading zero for month
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatTime = (timeString) => {
        if (!timeString) return 'N/A';
        // Convert 24-hour to 12-hour format
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    const handleHome = () => {
        router.replace('/(screens)/(home)/Home');
    };

    const handleViewBookings = () => {
        router.replace('/(bookSession)/Bookings');
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-4 self-start"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft size={24} color="#1E1E2D" strokeWidth={2.5} />
          </TouchableOpacity>
          <View className="flex-1 px-8 items-center justify-evenly">
            {/* Success Icon */}
            <View className="items-center justify-center">
                <Image
                    source={images.successIcon}
                    style={{ width: 150, height: 150 }}
                    resizeMode="contain"
                />
            </View>

            {/* Booking Completed Text */}
            <View className="border border-primary rounded-full px-8 py-2">
                <Text className="text-primary text-lg font-semibold">
                    Booking Completed
                </Text>
            </View>

            {/* Booking Details Card */}
            <View className="border border-primary rounded-full px-8 py-4 bg-white">
                <Text className="text-gray-800 text-base mb-2">
                    Date: {formatDate(date)}
                </Text>
                <Text className="text-gray-800 text-base">
                    Time: {formatTime(time)}
                </Text>
            </View>

            {/* Description */}
            <Text className="text-center text-gray-800 text-lg mb-3 leading-7 px-4">
                Your Booking has been made Our {'\n'}
                therapist will contact you through your{'\n'}
                registered mail in 24 - 48hrs{'\n'}
            </Text>

            {/* View Bookings Button */}
            <TouchableOpacity
                onPress={handleViewBookings}
                className="w-full bg-primary rounded-full py-4 px-6 mb-4"
            >
                <Text className="text-white text-center text-xl font-semibold">
                    View Bookings
                </Text>
            </TouchableOpacity>

            {/* Home Button */}
            <TouchableOpacity
                onPress={handleHome}
                className="w-full bg-gray-200 rounded-full py-4 px-6"
            >
                <Text className="text-gray-800 text-center text-xl font-semibold">
                    Home
                </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
    );
}
