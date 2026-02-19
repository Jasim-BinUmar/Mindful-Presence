import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Calendar } from 'lucide-react-native';
import StandardHeader from '../../../components/StandardHeader';
import { images } from '../../../constants';
import { api } from '../../../services/api';
import { router } from 'expo-router';

export default function Bookings() {
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [historyAppointments, setHistoryAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'history'
    const [cancelling, setCancelling] = useState({});

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            console.log('📅 Fetching appointments...');

            // Fetch upcoming appointments
            const upcomingResponse = await api.appointments.getUpcomingAppointments();
            console.log('📅 Upcoming appointments:', JSON.stringify(upcomingResponse, null, 2));

            if (upcomingResponse.success && upcomingResponse.data) {
                const scheduled = upcomingResponse.data.filter(apt => apt.status === 'scheduled');
                const sorted = scheduled.sort((a, b) => {
                    const dateA = new Date(`${a.appointmentDate}T${a.startTime}`);
                    const dateB = new Date(`${b.appointmentDate}T${b.startTime}`);
                    return dateA - dateB;
                });
                setUpcomingAppointments(sorted);
            } else {
                setUpcomingAppointments([]);
            }

            // Fetch appointment history
            const historyResponse = await api.appointments.getAppointmentHistory();
            console.log('📅 Appointment history:', JSON.stringify(historyResponse, null, 2));

            if (historyResponse.success && historyResponse.data) {
                // Sort by date (most recent first)
                const sorted = historyResponse.data.sort((a, b) => {
                    const dateA = new Date(`${a.appointmentDate}T${a.startTime}`);
                    const dateB = new Date(`${b.appointmentDate}T${b.startTime}`);
                    return dateB - dateA; // Reverse order for history
                });
                setHistoryAppointments(sorted);
            } else {
                setHistoryAppointments([]);
            }
        } catch (error) {
            console.error('❌ Error fetching appointments:', error);
            Alert.alert('Error', error.message || 'Failed to load appointments');
            setUpcomingAppointments([]);
            setHistoryAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (appointmentId) => {
        Alert.alert(
            'Cancel Appointment',
            'Are you sure you want to cancel this appointment?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setCancelling(prev => ({ ...prev, [appointmentId]: true }));
                            const response = await api.appointments.cancelAppointment(appointmentId, 'User cancelled');

                            if (response.success) {
                                Alert.alert('Success', 'Appointment cancelled successfully');
                                fetchAppointments(); // Refresh list
                            } else {
                                Alert.alert('Error', response.message || 'Failed to cancel appointment');
                            }
                        } catch (error) {
                            console.error('Error cancelling appointment:', error);
                            Alert.alert('Error', error.message || 'Failed to cancel appointment');
                        } finally {
                            setCancelling(prev => ({ ...prev, [appointmentId]: false }));
                        }
                    }
                }
            ]
        );
    };

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

    const getStatusColor = (status) => {
        switch (status) {
            case 'scheduled':
                return 'text-blue-600';
            case 'completed':
                return 'text-green-600';
            case 'cancelled':
                return 'text-red-600';
            case 'no_show':
                return 'text-orange-600';
            default:
                return 'text-gray-600';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'scheduled':
                return 'Scheduled';
            case 'completed':
                return 'Completed';
            case 'cancelled':
                return 'Cancelled';
            case 'no_show':
                return 'No Show';
            default:
                return status;
        }
    };

    const renderAppointmentCard = (appointment) => {
        const doctor = appointment.doctorId || {};
        const isCancelling = cancelling[appointment._id];
        const isUpcoming = appointment.status === 'scheduled';

        return (
            <View
                key={appointment._id}
                className="bg-gray-50 rounded-2xl p-4 mt-4 mb-4"
            >
                <View className="flex-row items-center">
                    <View className="w-16 h-16 bg-primary rounded-2xl items-center justify-center">
                        <Calendar size={32} color="#fff" />
                    </View>
                    <View className="flex-1 ml-4">
                        <Text className="text-xl font-bold">
                            1 to 1 Session
                        </Text>
                        {doctor.name && (
                            <Text className="text-gray-600 mt-1">
                                With: {doctor.name}
                            </Text>
                        )}
                        <Text className="text-gray-600 mt-1">
                            Date: {formatDate(appointment.appointmentDate)}
                        </Text>
                        <Text className="text-gray-600">
                            Time: {formatTime(appointment.startTime)}
                            {appointment.endTime && ` - ${formatTime(appointment.endTime)}`}
                        </Text>
                        <View className="mt-2">
                            <Text className={`text-sm font-medium ${getStatusColor(appointment.status)}`}>
                                Status: {getStatusLabel(appointment.status)}
                            </Text>
                        </View>
                    </View>
                    {isUpcoming && (
                        <TouchableOpacity
                            className="bg-red-100 px-4 py-2 rounded-full"
                            onPress={() => handleCancel(appointment._id)}
                            disabled={isCancelling}
                        >
                            {isCancelling ? (
                                <ActivityIndicator size="small" color="#EF4444" />
                            ) : (
                                <Text className="text-red-500 font-medium">Cancel</Text>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    const currentAppointments = activeTab === 'upcoming' ? upcomingAppointments : historyAppointments;

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StandardHeader title="Bookings" centeredTitle={true} />

            {/* Illustration */}
            <View className="items-center justify-center my-3">
                <Image
                    source={images.bookings}
                    style={{ width: 300, height: 200 }}
                    resizeMode="contain"
                />
            </View>

            {/* Tabs */}
            <View className="px-4 pb-4">
                <View className="flex-row bg-gray-100 rounded-full p-1">
                    <TouchableOpacity
                        onPress={() => setActiveTab('upcoming')}
                        className={`flex-1 py-2 rounded-full ${activeTab === 'upcoming' ? 'bg-primary' : 'bg-transparent'
                            }`}
                    >
                        <Text
                            className={`text-center font-semibold ${activeTab === 'upcoming' ? 'text-white' : 'text-gray-700'
                                }`}
                        >
                            Upcoming ({upcomingAppointments.length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('history')}
                        className={`flex-1 py-2 rounded-full ${activeTab === 'history' ? 'bg-primary' : 'bg-transparent'
                            }`}
                    >
                        <Text
                            className={`text-center font-semibold ${activeTab === 'history' ? 'text-white' : 'text-gray-700'
                                }`}
                        >
                            History ({historyAppointments.length})
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#623AD9" />
                    <Text className="mt-4 text-gray-600">Loading appointments...</Text>
                </View>
            ) : currentAppointments.length === 0 ? (
                <View className="flex-1 justify-center items-center px-4">
                    <Text className="text-gray-500 text-center text-lg">
                        {activeTab === 'upcoming'
                            ? 'No upcoming appointments'
                            : 'No appointment history'}
                    </Text>
                    {activeTab === 'upcoming' && (
                        <TouchableOpacity
                            onPress={() => router.push('/(bookSession)/DoctorsList')}
                            className="mt-4 bg-primary px-6 py-3 rounded-full"
                        >
                            <Text className="text-white font-semibold">Book a Session</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                <ScrollView className="flex-1 px-4">
                    {currentAppointments.map(renderAppointmentCard)}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
