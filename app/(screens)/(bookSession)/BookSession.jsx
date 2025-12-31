import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import CustomButton from '../../../components/CustomButton';
import { router, useLocalSearchParams } from 'expo-router';
import { api } from '../../../services/api';

export default function BookSession() {
  const { doctorId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthDays, setMonthDays] = useState([]);

  // Format date to YYYY-MM-DD
  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get day name
  const getDayName = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  // Format time to 12-hour format (e.g., "09:00" -> "9:00 AM")
  const formatTime12Hour = (time24) => {
    if (!time24) return '';
    try {
      const timeStr = String(time24);
      const [hours, minutes] = timeStr.split(':');
      if (!hours || !minutes) return timeStr;
      const hour = parseInt(hours, 10);
      if (isNaN(hour)) return timeStr;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
      console.error('Error formatting time:', error, time24);
      return String(time24);
    }
  };

  // Check if date is in the past
  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  // Generate month days
  const generateMonthDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = formatDate(date);
      const isPast = isPastDate(date);
      
      days.push({
        day,
        date: dateStr,
        fullDate: date,
        isPast,
        dayName: getDayName(date),
      });
    }

    setMonthDays(days);
  };

  // Fetch doctors
  useEffect(() => {
    fetchDoctors();
  }, []);

  // Generate month days when month changes
  useEffect(() => {
    generateMonthDays();
  }, [currentMonth]);

  // Fetch time slots when date is selected
  useEffect(() => {
    if (selectedDate && selectedDoctor) {
      fetchTimeSlotsForDate(selectedDate);
    } else {
      setAvailableTimeSlots([]);
      setSelectedTime(null);
    }
  }, [selectedDate, selectedDoctor]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      console.log('👨‍⚕️ Fetching doctor with ID:', doctorId);
      
      // If doctorId provided, fetch that specific doctor
      if (doctorId) {
        const response = await api.appointments.getDoctorById(doctorId);
        if (response.success && response.data) {
          setSelectedDoctor(response.data);
          console.log('👨‍⚕️ Doctor loaded:', response.data.name);
        } else {
          Alert.alert('Error', 'Doctor not found');
        }
      } else {
        // If no doctorId, redirect to doctors list
        router.replace('/(bookSession)/DoctorsList');
      }
    } catch (error) {
      console.error('❌ Error fetching doctor:', error);
      Alert.alert('Error', error.message || 'Failed to load therapist');
      // Redirect to doctors list on error
      router.replace('/(bookSession)/DoctorsList');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeSlotsForDate = async (date) => {
    if (!selectedDoctor || !selectedDoctor._id) {
      console.log('⏰ No doctor selected, skipping time slots fetch');
      return;
    }

    try {
      setLoadingTimeSlots(true);
      const doctorId = String(selectedDoctor._id);
      console.log('⏰ Fetching time slots for date:', date, 'doctor:', doctorId);
      
      // Use new time-slots endpoint
      const response = await api.appointments.getTimeSlots(doctorId, date);
      
      console.log('⏰ Time slots response:', JSON.stringify(response, null, 2));
      
      if (response.success && response.data && response.data.timeSlots) {
        // Use time slots directly from response (already formatted with timeSlot field)
        const formattedSlots = response.data.timeSlots.map(slot => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
          timeSlot: slot.timeSlot || `${formatTime12Hour(slot.startTime)} - ${formatTime12Hour(slot.endTime)}`,
          isAvailable: slot.isAvailable !== false, // Default to true if not specified
          duration: slot.duration || '1 hour',
        }));
        
        console.log('⏰ Formatted time slots:', formattedSlots.length);
        setAvailableTimeSlots(formattedSlots);
      } else {
        // Fallback to week view
        console.log('⏰ No time slots from endpoint, trying week view...');
        await fetchTimeSlotsFromWeekView(date);
      }
    } catch (error) {
      console.error('❌ Error fetching time slots:', error);
      // Fallback to week view
      await fetchTimeSlotsFromWeekView(date);
    } finally {
      setLoadingTimeSlots(false);
    }
  };

  const fetchTimeSlotsFromWeekView = async (date) => {
    if (!selectedDoctor || !selectedDoctor._id) {
      console.log('⏰ No doctor selected, skipping week view fetch');
      return;
    }

    try {
      // Get week start date (Monday of the week containing the selected date)
      const selectedDateObj = new Date(date);
      const day = selectedDateObj.getDay();
      const diff = selectedDateObj.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(selectedDateObj.setDate(diff));
      const weekStartStr = formatDate(weekStart);
      const doctorId = String(selectedDoctor._id);

      const response = await api.appointments.getWeekView(doctorId, weekStartStr);
      
      if (response.success && response.data && response.data.weekView) {
        const dayData = response.data.weekView.find(day => day.date.split('T')[0] === date);
        
        if (dayData && dayData.isAvailable && dayData.timeSlots) {
          // Get booked appointment times
          const bookedTimes = dayData.appointments?.map(apt => apt.startTime) || [];
          
          // Format time slots with availability
          const formattedSlots = dayData.timeSlots.map(slot => {
            const start = new Date(`2000-01-01T${slot.startTime}`);
            const end = new Date(`2000-01-01T${slot.endTime}`);
            const durationMs = end - start;
            const durationHours = durationMs / (1000 * 60 * 60);
            const isAvailable = !bookedTimes.includes(slot.startTime);
            
            return {
              startTime: slot.startTime,
              endTime: slot.endTime,
              isAvailable,
              duration: durationHours >= 1 ? `${durationHours} hour${durationHours > 1 ? 's' : ''}` : `${durationMs / (1000 * 60)} minutes`,
            };
          });
          
          setAvailableTimeSlots(formattedSlots);
        } else {
          setAvailableTimeSlots([]);
        }
      } else {
        setAvailableTimeSlots([]);
      }
    } catch (error) {
      console.error('Error fetching time slots from week view:', error);
      setAvailableTimeSlots([]);
    }
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleDateSelect = (dateStr) => {
    if (isPastDate(dateStr)) {
      Alert.alert('Error', 'Cannot select past dates');
      return;
    }
    setSelectedDate(dateStr);
    setSelectedTime(null); // Reset time when date changes
  };

  const handleTimeSelect = (timeSlot) => {
    if (!timeSlot.isAvailable) {
      Alert.alert('Error', 'This time slot is already booked');
      return;
    }
    setSelectedTime(timeSlot.startTime);
  };

  const handleBookNow = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select date and time');
      return;
    }

    // Find the selected time slot to get end time
    const selectedSlot = availableTimeSlots.find(slot => slot.startTime === selectedTime && slot.isAvailable);
    if (!selectedSlot) {
      Alert.alert('Error', 'Selected time slot is not available');
      return;
    }

    try {
      setBooking(true);
      const appointmentData = {
        doctorId: String(selectedDoctor._id),
        appointmentDate: String(selectedDate),
        startTime: String(selectedTime),
        endTime: String(selectedSlot.endTime),
        notes: '1 to 1 Session with Expert Therapist'
      };

      const response = await api.appointments.bookAppointment(appointmentData);
      
      if (response.success) {
        // Navigate to success screen with booking details
        router.push({
          pathname: '/(bookSession)/SuccessfulBooking',
          params: {
            appointmentId: response.data._id,
            date: selectedDate,
            time: selectedTime,
            doctorName: selectedDoctor.name
          }
        });
      } else {
        Alert.alert('Error', response.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      Alert.alert('Error', error.message || 'Failed to book appointment');
    } finally {
      setBooking(false);
    }
  };

  const getMonthName = () => {
    return currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  if (loading && !selectedDoctor) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#6949FF" />
        <Text className="mt-4 text-gray-600">Loading therapists...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="px-4 py-6">
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity 
              className="p-2"
              onPress={() => router.back()}
            >
              <ChevronLeft size={24} color="#000" />
            </TouchableOpacity>
            <Text className="flex-1 text-center text-xl font-semibold mr-8">
              Book 1 To 1 Session With{'\n'}An Expert Therapist
            </Text>
          </View>

          {/* Doctor Info */}
          {selectedDoctor && selectedDoctor._id && (
            <View className="mb-4 p-3 bg-purple-50 rounded-lg">
              <Text className="text-sm text-gray-600">Therapist</Text>
              <Text className="text-lg font-semibold text-gray-800">
                {selectedDoctor.name || 'Unknown Therapist'}
              </Text>
              {selectedDoctor.specialization && (
                <Text className="text-sm text-gray-600 mt-1">
                  {String(selectedDoctor.specialization)}
                </Text>
              )}
            </View>
          )}

          {/* Date Section - Month Calendar */}
          <View className="bg-gray-50 rounded-xl p-4 mb-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-medium">Date</Text>
              <View className="flex-row items-center gap-4">
                <TouchableOpacity onPress={handlePreviousMonth}>
                  <ChevronLeft size={20} color="#000" />
                </TouchableOpacity>
                <Text className="text-base font-semibold min-w-[180px] text-center">
                  {getMonthName()}
                </Text>
                <TouchableOpacity onPress={handleNextMonth}>
                  <ChevronRight size={20} color="#000" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Day names header */}
            <View className="flex-row justify-between mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <View key={day} className="w-[14%] items-center">
                  <Text className="text-xs text-gray-600 font-medium">{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar grid */}
            <View className="flex-row flex-wrap">
              {monthDays.map((dayData, index) => {
                if (dayData === null) {
                  return <View key={index} className="w-[14%] p-2" />;
                }

                const { day, date, isPast, dayName } = dayData;
                const isSelected = selectedDate === date;

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => !isPast && handleDateSelect(date)}
                    disabled={isPast}
                    className={`w-[14%] items-center p-2 rounded-lg ${
                      isSelected
                        ? 'bg-primary'
                        : isPast
                        ? 'opacity-30'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-xs ${
                        isSelected
                          ? 'text-white'
                          : isPast
                          ? 'text-gray-400'
                          : 'text-gray-600'
                      }`}
                    >
                      {dayName}
                    </Text>
                    <Text
                      className={`text-base font-medium mt-1 ${
                        isSelected
                          ? 'text-white'
                          : isPast
                          ? 'text-gray-400'
                          : 'text-black'
                      }`}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Time Section */}
          {selectedDate && (
            <View className="bg-gray-50 rounded-xl p-4 mb-6">
              <Text className="text-lg font-medium mb-4">Time</Text>
              {loadingTimeSlots ? (
                <View className="py-8 items-center">
                  <ActivityIndicator size="small" color="#6949FF" />
                  <Text className="mt-2 text-gray-600">Loading time slots...</Text>
                </View>
              ) : availableTimeSlots.length > 0 ? (
                <View className="flex-row flex-wrap gap-3">
                  {availableTimeSlots.map((slot, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleTimeSelect(slot)}
                      disabled={!slot.isAvailable}
                      className={`w-[48%] py-3 rounded-lg mb-2 ${
                        selectedTime === slot.startTime
                          ? 'bg-primary'
                          : slot.isAvailable
                          ? 'bg-white border-2 border-gray-300'
                          : 'bg-gray-200 border-2 border-gray-300 opacity-50'
                      }`}
                    >
                      <Text
                        className={`text-center font-semibold text-base ${
                          selectedTime === slot.startTime
                            ? 'text-white'
                            : slot.isAvailable
                            ? 'text-black'
                            : 'text-gray-400'
                        }`}
                      >
                        {slot.timeSlot || (slot.startTime && slot.endTime 
                          ? `${formatTime12Hour(String(slot.startTime))} - ${formatTime12Hour(String(slot.endTime))}`
                          : 'Time slot')}
                      </Text>
                      {slot.duration && (
                        <Text
                          className={`text-center text-xs mt-1 ${
                            selectedTime === slot.startTime
                              ? 'text-white opacity-90'
                              : slot.isAvailable
                              ? 'text-gray-600'
                              : 'text-gray-400'
                          }`}
                        >
                          {String(slot.duration)} session
                        </Text>
                      )}
                      {!slot.isAvailable && (
                        <Text className="text-center text-xs mt-1 text-red-500 font-medium">
                          Booked
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text className="text-gray-500 text-center py-4">
                  No available time slots for this date
                </Text>
              )}
            </View>
          )}

          {/* Book Now Button */}
          <CustomButton
            title={booking ? 'Booking...' : 'Book Now'}
            containerStyles="bg-primary py-4 mb-4 rounded-full"
            textStyles="text-lg font-bold text-white"
            handlePress={handleBookNow}
            disabled={!selectedDate || !selectedTime || booking}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
