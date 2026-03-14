import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator, ImageBackground, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Search, X } from 'lucide-react-native';
import StandardHeader from '../../../components/StandardHeader';
import { router, useFocusEffect } from 'expo-router';
import { api } from '../../../services/api';
import ContentCard from '../../../components/ContentCard';
import { normalizeMediaUrl } from '../../../utils/imageUtils';
import images from '../../../constants/images';

import { StyleSheet, Platform } from 'react-native';

const styles = StyleSheet.create({});

export default function CourseSearch() {
    const [searchQuery, setSearchQuery] = useState('');
    const [courses, setCourses] = useState([]);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [favoriteIds, setFavoriteIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch user context on focus (enrollments and favorites)
    useFocusEffect(
        useCallback(() => {
            const fetchUserContext = async () => {
                try {
                    console.log('🔄 Fetching user context (enrollments & favorites)...');
                    const [enrollmentRes, favoriteRes] = await Promise.all([
                        api.courses.getUserCourses({ limit: 1000 }),
                        api.user.getFavoriteIds()
                    ]);

                    if (enrollmentRes.success) {
                        const courses = enrollmentRes.data || enrollmentRes.courses || [];
                        setEnrolledCourses(courses.map(c => c._id));
                    }

                    if (favoriteRes.success) {
                        setFavoriteIds(favoriteRes.data || []);
                    }
                } catch (error) {
                    console.error('❌ Error fetching user context:', error);
                }
            };
            fetchUserContext();
        }, [])
    );

    const toggleFavorite = async (courseId) => {
        try {
            // Optimistic UI update
            const isFav = favoriteIds.includes(courseId);
            if (isFav) {
                setFavoriteIds(favoriteIds.filter(id => id !== courseId));
            } else {
                setFavoriteIds([...favoriteIds, courseId]);
            }

            const response = await api.user.toggleFavorite(courseId);
            if (!response.success) {
                // Revert on failure
                if (isFav) setFavoriteIds([...favoriteIds, courseId]);
                else setFavoriteIds(favoriteIds.filter(id => id !== courseId));
            }
        } catch (error) {
            console.error('Toggle favorite error:', error);
        }
    };

    const fetchCourses = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                search: searchQuery,
                limit: 20,
            };

            const response = await api.courses.search(params);
            if (response.success) {
                setCourses(response.data || []);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [searchQuery]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchCourses();
    }, [fetchCourses]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchCourses();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, fetchCourses]);

    const handleCoursePress = (courseId) => {
        router.push({
            pathname: '/(courseView)/CourseDetails',
            params: { courseId }
        });
    };


    return (
        <SafeAreaView className="flex-1 bg-white">
            <StandardHeader title="Explore Courses" centeredTitle={true} />
            <View className="px-6 py-4">

                {/* Search Bar */}
                <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 border border-gray-100 mb-4 shadow-sm">
                    <Search size={20} color="#623AD9" />
                    <TextInput
                        className="flex-1 ml-3 text-black font-medium text-base"
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#9CA3AF"
                    />
                    {searchQuery !== '' && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <View className="bg-gray-100 rounded-full p-1">
                                <X size={14} color="#9CA3AF" />
                            </View>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Status Bar */}
                <View className="mb-4">
                    <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest ml-1">
                        {loading ? 'Searching...' : `${courses.length} Results Found`}
                    </Text>
                </View>
            </View>

            {/* Course List */}
            {loading && courses.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#623AD9" />
                    <Text className="text-gray-500 mt-4 font-bold">Summoning courses...</Text>
                </View>
            ) : (
                <FlatList
                    data={courses}
                    keyExtractor={(item) => item._id}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#623AD9']} />}
                    renderItem={({ item, index }) => {
                        const thumbnailUrl = normalizeMediaUrl(item.thumbnail);
                        const fallbackImage = images[`contentCard${(index % 4) + 1}`] || images.contentCard1;
                        const isEnrolled = enrolledCourses.includes(item._id);
                        const isFavorite = favoriteIds.includes(item._id);

                        return (
                            <ContentCard
                                title={item.title}
                                image={thumbnailUrl ? { uri: thumbnailUrl } : fallbackImage}
                                badge={item.category}
                                price={isEnrolled ? 'ENROLLED' : item.price}
                                isFavorite={isFavorite}
                                onFavoritePress={() => toggleFavorite(item._id)}
                                onPress={() => handleCoursePress(item._id)}
                            />
                        );
                    }}
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center pt-20 px-10">
                            <Text className="text-gray-400 text-center font-bold text-lg mb-2">No Courses Found</Text>
                            <Text className="text-gray-400 text-center">Try searching for a different keyword to find what you're looking for.</Text>
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}
