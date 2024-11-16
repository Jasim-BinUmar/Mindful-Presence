import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import CustomButton from '../../../components/CustomButton'

export default function BookSession() {
  const [selectedDate, setSelectedDate] = useState(15);
  const [selectedTime, setSelectedTime] = useState('10:30');

  const days = [
    { day: 'Mon', date: 11 },
    { day: 'Tue', date: 12 },
    { day: 'Wed', date: 13 },
    { day: 'Thu', date: 14 },
    { day: 'Fri', date: 15 },
    { day: 'Sat', date: 16 },
    { day: 'Sun', date: 17 },
  ];

  const times = ['8:30', '9:30', '10:30', '11:30', '12:30', '01:30'];

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
          <View className="bg-gray-50 rounded-xl p-4 mb-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-medium">Date</Text>
              <View className="flex-row gap-4">
                <TouchableOpacity>
                  <ChevronLeft size={20} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity>
                  <ChevronRight size={20} color="#000" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row justify-between">
              {days.map(({ day, date }) => (
                <TouchableOpacity
                  key={date}
                  onPress={() => setSelectedDate(date)}
                  className={`items-center p-2 rounded-lg ${
                    selectedDate === date ? 'bg-primary' : 'bg-white border-2 border-gray-300'
                  }`}
                >
                  <Text className={`text-sm ${selectedDate === date ? 'text-white' : 'text-gray-600 '}`}>
                    {day}
                  </Text>
                  <Text 
                    className={`text-base font-medium mt-1 ${
                      selectedDate === date ? 'text-white' : 'text-black'
                    }`}
                  >
                    {date}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
                    selectedTime === time ? 'bg-primary' : 'bg-white  border-2 border-gray-300'
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

          {/* Book Now Button */}
          {/* <TouchableOpacity className="bg-[#6949FF] py-4 rounded-full">
            <Text className="text-white text-center font-semibold text-lg">
              Book Now
            </Text>
          </TouchableOpacity> */}
          <CustomButton 
            title="Book Now"
            containerStyles="bg-primary py-4 mb-4 rounded-full "
            textStyles="text-lg font-bold text-secondary"
            handlePress={()=>{}}

          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}