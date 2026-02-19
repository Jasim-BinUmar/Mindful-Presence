import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import StandardHeader from '../../../components/StandardHeader';
import { api } from '../../../services/api';
import ContentCard from '../../../components/ContentCard';
import { normalizeMediaUrl } from '../../../utils/imageUtils';
import images from '../../../constants/images';
import { BookOpen } from 'lucide-react-native';

export default function MyCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMyCourses = async () => {
        try {
            if (!refreshing) setLoading(true);
            const response = await api.courses.getUserCourses({ limit: 100 });
            if (response.success) {
                // Backend returns courses in response.data or response.courses
                const courseData = response.data || response.courses || [];
                setCourses(courseData);
            }
        } catch (error) {
            console.error('Error fetching enrolled courses:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchMyCourses();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchMyCourses();
    };

    const handleCoursePress = (courseId) => {
        router.push({
            pathname: '/(courseView)/CourseDetails',
            params: { courseId }
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StandardHeader title="My Courses" centeredTitle={true} />

            {loading && courses.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#623AD9" />
                </View>
            ) : (
                <FlatList
                    data={courses}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item, index }) => {
                        const thumbnailUrl = normalizeMediaUrl(item.thumbnail);
                        const fallbackImage = images[`contentCard${(index % 4) + 1}`] || images.contentCard1;

                        return (
                            <ContentCard
                                title={item.title}
                                image={thumbnailUrl ? { uri: thumbnailUrl } : fallbackImage}
                                badge={item.category}
                                price="ENROLLED"
                                onPress={() => handleCoursePress(item._id)}
                            />
                        );
                    }}
                    onRefresh={onRefresh}
                    refreshing={refreshing}
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center pt-20 px-8">
                            <View className="bg-gray-50 p-6 rounded-full mb-6">
                                <BookOpen size={48} color="#D1D5DB" />
                            </View>
                            <Text className="text-xl font-bold text-gray-900 mb-2">No Courses Enrolled</Text>
                            <Text className="text-gray-500 text-center">
                                You haven't enrolled in any courses yet. Explore our catalog to start your journey!
                            </Text>
                            <TouchableOpacity
                                onPress={() => router.push('/(home)/CourseSearch')}
                                className="mt-8 bg-primary px-8 py-3 rounded-full"
                            >
                                <Text className="text-white font-bold">Explore Courses</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: 40 }}
                />
            )}
        </SafeAreaView>
    );
}
