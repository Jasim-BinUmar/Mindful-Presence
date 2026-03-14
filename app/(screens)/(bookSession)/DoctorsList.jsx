import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import StandardHeader from '../../../components/StandardHeader';
import { api } from '../../../services/api';
import { router } from 'expo-router';
import { normalizeMediaUrl, getImageSource } from '../../../utils/imageUtils';
import images from '../../../constants/images';

export default function DoctorsList() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all'); // all, expert_therapist, doctor, therapist, counselor

    useEffect(() => {
        fetchDoctors();
    }, [filter]);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            console.log('👨‍⚕️ Fetching doctors with filter:', filter);

            const queryParams = { isActive: true };
            if (filter !== 'all') {
                // Ensure filter value matches backend expectations
                queryParams.designation = filter;
            }

            const response = await api.appointments.getAllDoctors(queryParams);

            console.log('👨‍⚕️ Doctors response:', JSON.stringify(response, null, 2));

            if (response && response.success && response.data) {
                setDoctors(Array.isArray(response.data) ? response.data : []);
                console.log(`👨‍⚕️ Loaded ${response.data.length} doctors`);
            } else if (response && response.data && Array.isArray(response.data)) {
                // Handle case where response structure might be different
                setDoctors(response.data);
                console.log(`👨‍⚕️ Loaded ${response.data.length} doctors`);
            } else {
                console.log('👨‍⚕️ No doctors found');
                setDoctors([]);
            }
        } catch (error) {
            console.error('❌ Error fetching doctors:', error);
            // Don't show alert for filter changes, just log the error
            if (filter === 'all') {
                Alert.alert('Error', error.message || 'Failed to load doctors');
            }
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDoctorSelect = (doctor) => {
        router.push({
            pathname: '/(bookSession)/BookSession',
            params: { doctorId: doctor._id }
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StandardHeader title="Select Therapist" centeredTitle={true} />

            {/* Filter Tabs */}
            <View className="px-4 pt-4 pb-4">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-2">
                        {[
                            { key: 'all', label: 'All' },
                            { key: 'expert_therapist', label: 'Expert Therapist' },
                            { key: 'therapist', label: 'Therapist' },
                            { key: 'doctor', label: 'Doctor' },
                            { key: 'counselor', label: 'Counselor' }
                        ].map(({ key, label }) => (
                            <TouchableOpacity
                                key={key}
                                onPress={() => setFilter(key)}
                                className={`px-4 py-2 rounded-full ${filter === key
                                    ? 'bg-primary'
                                    : 'bg-gray-100'
                                    }`}
                            >
                                <Text
                                    className={`font-medium ${filter === key
                                        ? 'text-white'
                                        : 'text-gray-700'
                                        }`}
                                >
                                    {label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#623AD9" />
                    <Text className="mt-4 text-gray-600">Loading doctors...</Text>
                </View>
            ) : doctors.length === 0 ? (
                <View className="flex-1 justify-center items-center px-4">
                    <Text className="text-gray-500 text-center text-lg">
                        No doctors available
                    </Text>
                </View>
            ) : (
                <ScrollView
                    className="flex-1 px-4"
                    contentContainerStyle={{ paddingTop: 8 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#623AD9']} />}
                >
                    {doctors.map((doctor) => (
                        <TouchableOpacity
                            key={doctor._id}
                            onPress={() => handleDoctorSelect(doctor)}
                            className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-200"
                        >
                            <View className="flex-row items-center">
                                {/* Profile Image */}
                                <View className="w-20 h-20 rounded-full bg-primary items-center justify-center overflow-hidden">
                                    {doctor.profileImage ? (
                                        <Image
                                            source={getImageSource(doctor.profileImage, images.fullGuide)}
                                            className="w-full h-full"
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <Text className="text-white text-2xl font-bold">
                                            {doctor.name?.charAt(0)?.toUpperCase() || 'D'}
                                        </Text>
                                    )}
                                </View>

                                {/* Doctor Info */}
                                <View className="flex-1 ml-4">
                                    <Text className="text-xl font-bold text-gray-800">
                                        {doctor.name || 'Dr. Unknown'}
                                    </Text>
                                    {doctor.specialization && (
                                        <Text className="text-gray-600 mt-1">
                                            {doctor.specialization}
                                        </Text>
                                    )}
                                    {doctor.designation && (
                                        <View className="mt-2">
                                            <View className="bg-primary/20 self-start px-3 py-1 rounded-full">
                                                <Text className="text-primary text-xs font-semibold">
                                                    {doctor.designation.replace('_', ' ').toUpperCase()}
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                    {doctor.experience && (
                                        <Text className="text-gray-500 text-sm mt-1">
                                            {doctor.experience} years experience
                                        </Text>
                                    )}
                                    <View className="mt-2 flex-row items-center">
                                        <View className="bg-green-100 px-3 py-1 rounded-full border border-green-200">
                                            <Text className="text-green-700 text-xs font-black">
                                                {doctor.sessionPrice > 0 ? `$${doctor.sessionPrice}/session` : 'FREE SESSION'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <ChevronRight size={24} color="#666" />
                            </View>

                            {doctor.bio && (
                                <Text className="text-gray-600 text-sm mt-3" numberOfLines={2}>
                                    {doctor.bio}
                                </Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

