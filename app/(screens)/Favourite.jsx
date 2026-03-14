import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import StandardHeader from '../../components/StandardHeader';
import { api } from '../../services/api';
import ContentCard from '../../components/ContentCard';
import { normalizeMediaUrl } from '../../utils/imageUtils';
import images from '../../constants/images';
import { Heart, Search } from 'lucide-react-native';

const Favourite = () => {
  const { fromProfile } = useLocalSearchParams() || {};
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      if (!refreshing) setLoading(true);

      // Fetch favorites and enrollments in parallel
      const [favResponse, enrollmentResponse] = await Promise.all([
        api.user.getFavorites(),
        api.courses.getUserCourses({ limit: 100 })
      ]);

      if (favResponse.success) {
        setCourses(favResponse.data || []);
      }

      if (enrollmentResponse.success) {
        const enrolledData = enrollmentResponse.data || enrollmentResponse.courses || [];
        setEnrolledCourses(enrolledData.map(c => c._id));
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleCoursePress = (courseId) => {
    router.push({
      pathname: '/(courseView)/CourseDetails',
      params: { courseId }
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StandardHeader
        title="Favourites"
        centeredTitle={true}
        onBackPress={fromProfile === 'true' ? () => router.replace('/(profile)/profile') : undefined}
      />

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
            const isEnrolled = enrolledCourses.includes(item._id);

            return (
              <ContentCard
                title={item.title}
                image={thumbnailUrl ? { uri: thumbnailUrl } : fallbackImage}
                badge={item.category}
                price={isEnrolled ? 'ENROLLED' : item.price}
                onPress={() => handleCoursePress(item._id)}
              />
            );
          }}
          onRefresh={onRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center pt-20 px-8">
              <View className="bg-pink-50 p-6 rounded-full mb-6">
                <Heart size={48} color="#623AD9" fill="#623AD9" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2">No Favourites Yet</Text>
              <Text className="text-gray-500 text-center">
                Save your favorite courses and therapists here to access them easily later.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(home)/CourseSearch')}
                className="mt-8 bg-primary px-8 py-3 rounded-full"
              >
                <View className="flex-row items-center">
                  <Search size={18} color="white" className="mr-2" />
                  <Text className="text-white font-bold ml-2">Browse Courses</Text>
                </View>
              </TouchableOpacity>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </SafeAreaView>
  );
};

export default Favourite;