import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import CustomButton from '../../../components/CustomButton';
import DateSelector from '../../../components/DateSelector';
import { getCurrentUser } from '../../../lib/appWrite'; 
import { router } from 'expo-router';
import apiService from '../../../services/endpoints/apiService';
import endpoints from '../../../services/endpoints/endpoints';

export default function BookSession() {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('10:30');
  const [userId, setUserId] = useState('');

  const times = ['8:30', '9:30', '10:30', '11:30', '12:30', '01:30'];


  useEffect(() => {
    const checkUserSession = async () => {
        try {
            const currentUser = await getCurrentUser();
            if (currentUser) {
                console.log("Fetched modified accountId:", currentUser.accountId);
                setUserId(currentUser.accountId);  // Use the accountId appended with 4 zeros at end
            }
        } catch (error) {
            console.log('No active session found:', error);
        }
    };

    checkUserSession();
  }, []);

  const handleDateSelect = (date) => {
    console.log("selected date " + date)
    setSelectedDate(date);
  };

  const handleSubmit = async () => {
    console.log("Here at start of handle submit");
    if (!selectedDate || !selectedTime || !userId) {
      console.log('Please select a date, time, and ensure you are logged in.');
      return;
    }
    // Validate ObjectId format

    const isValidObjectId = (id) => /^[a-fA-F0-9]{24}$/.test(id);

    if (!isValidObjectId(userId)) {
      console.log(userId)
      console.error("Invalid userId");
      return;
    }

    const dateObj = new Date(selectedDate); // Convert to Date object if needed
    const day = dateObj.getDate();
    const month = dateObj.getMonth() + 1; // Months are 0-indexed
    const year = dateObj.getFullYear();

    const sessionDetails = {
      day,
      month,
      year,
      timeSlot: selectedTime,
      userId,
    };
    try {
      const response = await apiService.post(endpoints.bookSession, sessionDetails);
      console.log('Booking successful:', response);
      router.replace('SuccessfulBooking');
    } catch (error) {
        Alert.alert('Session Not booked', );
        console.error('Error booking session:', error);
    }
};

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="px-4 py-6">
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity className="p-2">
              <ChevronLeft size={24} color="#000" />
            </TouchableOpacity>
            <Text className="flex-1 text-center text-xl font-semibold mr-8">
              Book 1 To 1 Session With{'\n'}An Expert Therapist
            </Text>
          </View>

          {/* Date Section */}
          <View className="bg-gray-50 rounded-xl p-4 mb-6">
            <Text className="text-lg font-medium mb-4">Date</Text>
            <DateSelector onDateSelect={handleDateSelect} />
          </View>

          {/* Time Section */}
          <View className="bg-gray-50 rounded-xl p-4 mb-6">
            <Text className="text-lg font-medium mb-4">Time</Text>
            <View className="flex-row flex-wrap gap-4">
              {times.map((time) => (
                <TouchableOpacity
                  key={time}
                  onPress={() => setSelectedTime(time)}
                  className={`w-[30%] py-3 rounded-lg ${
                    selectedTime === time ? 'bg-primary' : 'bg-white border-2 border-gray-300'
                  }`}
                >
                  <Text
                    className={`text-center font-medium ${
                      selectedTime === time ? 'text-white' : 'text-black'
                    }`}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <CustomButton 
            title="Book Now"
            containerStyles="bg-primary py-4 mb-4 rounded-full"
            textStyles="text-lg font-bold text-secondary"
            handlePress={handleSubmit}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
