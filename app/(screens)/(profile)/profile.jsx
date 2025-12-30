import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { icons } from '../../../constants';
import { router } from 'expo-router';
import { useGlobalContext } from '../../../lib/globalContext';
import { api } from '../../../services/api';
import { assessmentService } from '../../../services/assessmentService';

export default function Component() {
    const { user, logout: logoutFromContext, isAuthenticated, isLoading: authLoading } = useGlobalContext();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profileInsights, setProfileInsights] = useState(null);
    const [insightsLoading, setInsightsLoading] = useState(false);

    useEffect(() => {
        // Wait for auth check to complete
        if (authLoading) {
            return;
        }
        
        if (isAuthenticated) {
            fetchProfile();
        } else {
            router.replace('/(auth)/userAuthScreen');
        }
    }, [isAuthenticated, authLoading]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await api.user.getProfile();
            if (response.success && response.data) {
                setProfileData(response.data);
            } else {
                // Fallback to user data from context if profile API fails
                setProfileData(user);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            // Fallback to user data from context
            setProfileData(user);
        } finally {
            setLoading(false);
        }
    };

    const fetchProfileInsights = async () => {
        try {
            setInsightsLoading(true);
            const response = await api.user.getProfileInsights();
            if (response.success && response.data) {
                setProfileInsights(response.data);
            }
        } catch (error) {
            console.error('Error fetching profile insights:', error);
        } finally {
            setInsightsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            fetchProfileInsights();
        }
    }, [isAuthenticated, authLoading]);

    const handleLogout = async () => {
        try {
            await logoutFromContext();
            Alert.alert('Logged out', 'You have been successfully logged out.');
            router.replace('/(auth)/userAuthScreen');
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
            link: '/(selfAssesment)/AssessmentStart',
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
                        {loading ? (
                            <ActivityIndicator size="large" color="#6A3DE8" />
                        ) : (
                            <>
                                <Image
                                    source={{ 
                                        uri: profileData?.profilePicture || 
                                             profileData?.avatar || 
                                             user?.profilePicture || 
                                             user?.avatar || 
                                             'https://bootdey.com/img/Content/avatar/avatar6.png' 
                                    }}
                                    className="w-28 h-28 rounded-full bg-purple-600"
                                />
                                <Text className="text-2xl font-semibold mt-4">
                                    {profileData?.firstName && profileData?.lastName
                                        ? `${profileData.firstName} ${profileData.lastName}`
                                        : profileData?.name || 
                                          (user?.firstName && user?.lastName 
                                            ? `${user.firstName} ${user.lastName}` 
                                            : user?.name || 'User')}
                                </Text>
                                <Text className="text-gray-500 mt-1">
                                    {profileData?.email || user?.email || ''}
                                </Text>
                            </>
                        )}
                    </View>

                    {/* Profile Tags Section - Clean Display */}
                    {profileInsights && (
                        <View className="mt-6 mx-4 p-4 bg-gradient-to-br from-primary/10 to-purple-50 rounded-xl border border-primary/20">
                            <View className="flex-row items-center justify-between mb-3">
                                <Text className="text-lg font-semibold text-gray-800">Your Profile Tags</Text>
                                <TouchableOpacity 
                                    onPress={fetchProfileInsights}
                                    disabled={insightsLoading}
                                    className="px-3 py-1 bg-primary rounded-full"
                                >
                                    {insightsLoading ? (
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : (
                                        <Text className="text-white text-xs font-semibold">Refresh</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                            
                            {/* Collect all tags from insights */}
                            {(() => {
                                const allTags = [];
                                
                                // Get tags from insights
                                if (profileInsights.insights && Array.isArray(profileInsights.insights)) {
                                    profileInsights.insights.forEach(insight => {
                                        if (insight.tags && Array.isArray(insight.tags)) {
                                            insight.tags.forEach(tag => {
                                                const tagName = tag.tagName || tag;
                                                if (!allTags.find(t => t.name === tagName)) {
                                                    allTags.push({
                                                        name: tagName,
                                                        score: tag.score || tag.scoreValue || ''
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                                
                                // Get primary concerns as tags
                                if (profileInsights.summary?.primaryConcerns && Array.isArray(profileInsights.summary.primaryConcerns)) {
                                    profileInsights.summary.primaryConcerns.forEach(concern => {
                                        if (!allTags.find(t => t.name === concern)) {
                                            allTags.push({ name: concern, score: '' });
                                        }
                                    });
                                }
                                
                                if (allTags.length === 0) {
                                    return (
                                        <View className="py-4">
                                            <Text className="text-sm text-gray-600 text-center mb-2">
                                                No tags available yet.
                                            </Text>
                                            <Text className="text-xs text-gray-500 text-center">
                                                Complete assessments to get personalized tags.
                                            </Text>
                                        </View>
                                    );
                                }
                                
                                return (
                                    <View className="flex-row flex-wrap">
                                        {allTags.map((tag, idx) => (
                                            <View 
                                                key={idx} 
                                                className="bg-primary px-3 py-2 rounded-full mr-2 mb-2"
                                                style={{
                                                    shadowColor: '#623AD9',
                                                    shadowOffset: { width: 0, height: 2 },
                                                    shadowOpacity: 0.2,
                                                    shadowRadius: 3,
                                                    elevation: 2
                                                }}
                                            >
                                                <Text className="text-white text-sm font-semibold">
                                                    {tag.name}
                                                    {tag.score && ` (${tag.score})`}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                );
                            })()}
                            
                            {/* One-line summary if available */}
                            {profileInsights.recommendations && profileInsights.recommendations.length > 0 && (
                                <View className="mt-4 pt-4 border-t border-primary/20">
                                    <Text className="text-sm text-gray-700 leading-5">
                                        {profileInsights.recommendations[0]}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                    
                    {!profileInsights && !insightsLoading && (
                        <View className="mt-6 mx-4 p-4 bg-gray-50 rounded-xl">
                            <Text className="text-sm text-gray-600 text-center mb-2">
                                No insights available yet.
                            </Text>
                            <Text className="text-xs text-gray-500 text-center">
                                Complete assessments to get personalized insights.
                            </Text>
                        </View>
                    )}

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
