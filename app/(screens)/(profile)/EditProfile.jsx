import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useGlobalContext } from '../../../lib/globalContext';
import { api } from '../../../services/api';
import { normalizeMediaUrl, getImageSource } from '../../../utils/imageUtils';
import images from '../../../constants/images';

export default function EditProfile() {
    const { user } = useGlobalContext();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
      
        profilePicture: null,
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            console.log('👤 EditProfile: Fetching profile data...');
            
            const response = await api.user.getProfile();
            console.log('👤 EditProfile: Profile API response:', JSON.stringify(response, null, 2));
            
            if (response.success && response.data) {
                const data = response.data;
                console.log('👤 EditProfile: Setting profile data:', data);
                
                // Extract name into firstName and lastName if needed
                let firstName = data.firstName || '';
                let lastName = data.lastName || '';
                
                if (!firstName && !lastName && data.name) {
                    const nameParts = data.name.split(' ');
                    firstName = nameParts[0] || '';
                    lastName = nameParts.slice(1).join(' ') || '';
                }
                
                setProfileData({
                    firstName: firstName || user?.firstName || '',
                    lastName: lastName || user?.lastName || '',
                    email: data.email || user?.email || '',
                    phoneNumber: data.phoneNumber || user?.phoneNumber || '',
                    dateOfBirth: data.dateOfBirth || '',
                    gender: data.gender || '',
                    address: typeof data.address === 'string' 
                        ? data.address 
                        : data.address 
                            ? `${data.address.street || ''} ${data.address.city || ''} ${data.address.country || ''}`.trim()
                            : '',
                    bio: data.bio || '',
                    profilePicture: data.profilePicture || data.avatar || user?.profilePicture || user?.avatar || null,
                });
            } else {
                // Fallback to user context
                const nameParts = (user?.name || '').split(' ');
                setProfileData({
                    firstName: user?.firstName || nameParts[0] || '',
                    lastName: user?.lastName || nameParts.slice(1).join(' ') || '',
                    email: user?.email || '',
                    phoneNumber: user?.phoneNumber || '',
                    dateOfBirth: '',
                    gender: '',
                    address: '',
                    bio: '',
                    profilePicture: user?.profilePicture || user?.avatar || null,
                });
            }
        } catch (error) {
            console.error('❌ EditProfile: Error fetching profile:', error);
            // Fallback to user context
            const nameParts = (user?.name || '').split(' ');
            setProfileData({
                firstName: user?.firstName || nameParts[0] || '',
                lastName: user?.lastName || nameParts.slice(1).join(' ') || '',
                email: user?.email || '',
                phoneNumber: user?.phoneNumber || '',
                dateOfBirth: '',
                gender: '',
                address: '',
                bio: '',
                profilePicture: user?.profilePicture || user?.avatar || null,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            
            // Prepare update data
            const updateData = {
                name: `${profileData.firstName} ${profileData.lastName}`.trim(),
                email: profileData.email,
                phoneNumber: profileData.phoneNumber,
                dateOfBirth: profileData.dateOfBirth || undefined,
                gender: profileData.gender || undefined,
                address: profileData.address || undefined,
                bio: profileData.bio || undefined,
            };

            console.log('👤 EditProfile: Updating profile with data:', updateData);
            
            const response = await api.user.updateProfile(updateData);
            
            if (response.success) {
                Alert.alert('Success', 'Profile updated successfully');
                router.back();
            } else {
                Alert.alert('Error', response.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('❌ EditProfile: Error updating profile:', error);
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#6A3DE8" />
                <Text className="mt-4 text-gray-600">Loading profile...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1">
                <View className="p-4">
                    {/* Header with back button */}
                    <TouchableOpacity 
                        className="w-10 h-10 justify-center"
                        onPress={() => router.back()}
                    >
                        <ChevronLeft size={24} color="#000" />
                    </TouchableOpacity>

                    {/* Profile Section */}
                    <View className="items-center mt-4">
                        <Image
                            source={getImageSource(
                                profileData.profilePicture,
                                images.fullGuide
                            )}
                            className="w-28 h-28 rounded-full bg-purple-600"
                        />
                    </View>

                    <View className="bg-white p-2 mt-8 space-y-4">
                        <View className="py-2">
                            <Text className="text-black font-medium">First Name</Text>
                            <TextInput
                                className="py-2 border-b border-gray-300"
                                placeholder="Enter first name"
                                value={profileData.firstName}
                                onChangeText={(text) => setProfileData({ ...profileData, firstName: text })}
                            />
                        </View>

                        <View className="py-2">
                            <Text className="text-black font-medium">Last Name</Text>
                            <TextInput
                                className="py-2 border-b border-gray-300"
                                placeholder="Enter last name"
                                value={profileData.lastName}
                                onChangeText={(text) => setProfileData({ ...profileData, lastName: text })}
                            />
                        </View>
                        
                        <View className="py-2">
                            <Text className="text-black font-medium">Email</Text>
                            <TextInput
                                className="py-2 border-b border-gray-300"
                                placeholder="Enter email"
                                value={profileData.email}
                                onChangeText={(text) => setProfileData({ ...profileData, email: text })}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View className="py-2">
                            <Text className="text-black font-medium">Phone Number</Text>
                            <TextInput
                                className="py-2 border-b border-gray-300"
                                placeholder="Enter phone number"
                                value={profileData.phoneNumber}
                                onChangeText={(text) => setProfileData({ ...profileData, phoneNumber: text })}
                                keyboardType="phone-pad"
                            />
                        </View>

                       
                     

                      

                        
                    </View>

                    {/* Save Button */}
                    <View className="mt-8 space-y-4 py-4">
                        <TouchableOpacity
                            activeOpacity={0.7}
                            className="flex-row items-center justify-center px-4 py-5 m-2 bg-primary rounded-full border border-gray-100"
                            onPress={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text className="text-base font-medium text-white">Save</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
