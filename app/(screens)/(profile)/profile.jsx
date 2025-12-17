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

                    {/* Profile Insights Section */}
                    <View className="mt-6 mx-4 p-4 bg-gradient-to-br from-primary/10 to-purple-50 rounded-xl border border-primary/20">
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-lg font-semibold text-gray-800">Profile Insights</Text>
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
                        
                        {!profileInsights && !insightsLoading && (
                            <View className="py-4">
                                <Text className="text-sm text-gray-600 text-center mb-2">
                                    No insights available yet.
                                </Text>
                                <Text className="text-xs text-gray-500 text-center">
                                    Complete assessments to get personalized insights.
                                </Text>
                            </View>
                        )}
                        
                        {profileInsights && (
                            <>
                            
                            {/* Summary */}
                            {profileInsights.summary && (
                                <View className="mb-4">
                                    <Text className="text-sm font-semibold text-gray-700 mb-2">Summary</Text>
                                    <View className="bg-white p-3 rounded-lg">
                                        <Text className="text-xs text-gray-600 mb-1">
                                            Assessments Completed: {profileInsights.summary.assessmentCount || 0}
                                        </Text>
                                        {profileInsights.summary.overallScore !== undefined && (
                                            <Text className="text-xs text-gray-600 mb-1">
                                                Overall Score: {profileInsights.summary.overallScore}
                                            </Text>
                                        )}
                                        {profileInsights.summary.profileCompleteness !== undefined && (
                                            <Text className="text-xs text-gray-600">
                                                Profile Completeness: {profileInsights.summary.profileCompleteness}%
                                            </Text>
                                        )}
                                        {profileInsights.summary.primaryConcerns && profileInsights.summary.primaryConcerns.length > 0 && (
                                            <View className="mt-2">
                                                <Text className="text-xs font-semibold text-gray-700 mb-1">Primary Concerns:</Text>
                                                <View className="flex-row flex-wrap">
                                                    {profileInsights.summary.primaryConcerns.map((concern, idx) => (
                                                        <View key={idx} className="bg-red-100 px-2 py-1 rounded mr-2 mb-1">
                                                            <Text className="text-xs text-red-700">{concern}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            )}

                            {/* Insights */}
                            {profileInsights.insights && profileInsights.insights.length > 0 && (
                                <View className="mb-4">
                                    <Text className="text-sm font-semibold text-gray-700 mb-2">Insights</Text>
                                    {profileInsights.insights.map((insight, index) => (
                                        <View key={index} className="bg-white p-3 rounded-lg mb-2">
                                            <View className="flex-row items-center mb-1">
                                                {insight.type === 'concern' && (
                                                    <Text className="text-red-500 text-xs font-bold mr-2">⚠️</Text>
                                                )}
                                                {insight.type === 'strength' && (
                                                    <Text className="text-green-500 text-xs font-bold mr-2">✓</Text>
                                                )}
                                                {insight.type === 'category_analysis' && (
                                                    <Text className="text-blue-500 text-xs font-bold mr-2">📊</Text>
                                                )}
                                                <Text className="text-xs font-semibold text-gray-800 flex-1">
                                                    {insight.message || insight.type}
                                                </Text>
                                            </View>
                                            {insight.severity && (
                                                <Text className="text-xs text-gray-600">
                                                    Severity: {insight.severity}
                                                </Text>
                                            )}
                                            {insight.tags && insight.tags.length > 0 && (
                                                <View className="mt-2 flex-row flex-wrap">
                                                    {insight.tags.map((tag, tagIdx) => (
                                                        <View key={tagIdx} className="bg-primary/10 px-2 py-1 rounded mr-2 mb-1">
                                                            <Text className="text-xs text-primary">
                                                                {tag.tagName || tag}: {tag.score || ''}
                                                            </Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Recommendations */}
                            {profileInsights.recommendations && profileInsights.recommendations.length > 0 && (
                                <View>
                                    <Text className="text-sm font-semibold text-gray-700 mb-2">Recommendations</Text>
                                    <View className="bg-primary/5 p-3 rounded-lg border-l-4 border-primary">
                                        {profileInsights.recommendations.map((rec, index) => (
                                            <Text key={index} className="text-sm text-gray-700 mb-1">
                                                💡 {rec}
                                            </Text>
                                        ))}
                                    </View>
                                </View>
                            )}
                        </>
                        )}
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
