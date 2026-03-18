import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, Pressable, ImageBackground, FlatList, ScrollView, RefreshControl, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Search } from 'lucide-react-native';
import images from '../../../constants/images';
import { icons } from '../../../constants';
import CustomButton from '../../../components/CustomButton';
import ContentCard from '../../../components/ContentCard';
import { router, useRouter, useFocusEffect } from 'expo-router';
import { useGlobalContext } from '../../../lib/globalContext';
import { api } from '../../../services/api';
import { assessmentService } from '../../../services/assessmentService';
import { normalizeMediaUrl, getImageSource } from '../../../utils/imageUtils';

export default function Component() {
  const routerInstance = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, showRecommendations } = useGlobalContext();

  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);
  const [profileInsights, setProfileInsights] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      routerInstance.replace('/(auth)/userAuthScreen');
    }
  }, [authLoading, isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      if (authLoading || !isAuthenticated) return;
      loadData();
    }, [authLoading, isAuthenticated, showRecommendations])
  );

  const loadData = async () => {
    try {
      setLoading(true);

      // Check if user has completed assessments
      const responseHistory = await assessmentService.getResponseHistory();
      const hasResponses = responseHistory.success && responseHistory.data?.length > 0;
      setHasCompletedAssessment(hasResponses);

      // Fetch user enrollments and favorites
      try {
        const [enrollResponse, favoriteRes] = await Promise.all([
          api.courses.getUserCourses({ limit: 1000 }),
          api.user.getFavoriteIds()
        ]);

        if (enrollResponse.success) {
          const courses = enrollResponse.data || enrollResponse.courses || [];
          setEnrolledCourseIds(courses.map(c => c._id));
        }

        if (favoriteRes.success) {
          setFavoriteIds(favoriteRes.data || []);
        }
      } catch (err) {
        console.warn('Error fetching user context on Home:', err);
      }

      if (hasResponses) {
        try {
          const insightsResponse = await api.user.getProfileInsights();
          if (insightsResponse.success && insightsResponse.data) {
            setProfileInsights(insightsResponse.data);
          }
        } catch (error) {
          console.error('[Home] Error fetching profile insights:', error);
        }
      }

      if (showRecommendations && hasResponses) {
        try {
          setRecommendationsLoading(true);
          const recParams = { page: 1, limit: 10 };
          const recommendations = await api.recommendations.getUserRecommendations(recParams);
          if (recommendations.success && recommendations.data) {
            let recData = [];
            if (Array.isArray(recommendations.data)) {
              recData = recommendations.data;
            } else if (recommendations.data?.courses && Array.isArray(recommendations.data.courses)) {
              recData = recommendations.data.courses;
            } else if (recommendations.data?.items && Array.isArray(recommendations.data.items)) {
              recData = recommendations.data.items;
            } else if (recommendations.data?.data) {
              recData = Array.isArray(recommendations.data.data)
                ? recommendations.data.data
                : (recommendations.data.data?.courses || []);
            }
            setRecommendedCourses(recData);
          } else {
            setRecommendedCourses([]);
          }
        } catch (error) {
          console.error('[Home] Error fetching recommendations:', error);
          setRecommendedCourses([]);
        } finally {
          setRecommendationsLoading(false);
        }
      } else {
        setRecommendedCourses([]);
        setRecommendationsLoading(false);
      }

      const coursesParams = { limit: 20, status: 'published' };
      const coursesResponse = await api.courses.getAll(coursesParams);
      if (coursesResponse.success && coursesResponse.data) {
        const coursesData = Array.isArray(coursesResponse.data)
          ? coursesResponse.data
          : (coursesResponse.data.courses || coursesResponse.data.items || []);
        setAllCourses(coursesData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const handleTakeAssessment = () => {
    routerInstance.push('/(selfAssesment)/AssessmentStart');
  };

  const toggleFavorite = async (courseId) => {
    try {
      const isFav = favoriteIds.includes(courseId);
      if (isFav) {
        setFavoriteIds(favoriteIds.filter(id => id !== courseId));
      } else {
        setFavoriteIds([...favoriteIds, courseId]);
      }

      const response = await api.user.toggleFavorite(courseId);
      if (!response.success) {
        if (isFav) setFavoriteIds([...favoriteIds, courseId]);
        else setFavoriteIds(favoriteIds.filter(id => id !== courseId));
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
    }
  };

  const handleCoursePress = (courseId) => {
    if (!courseId) {
      console.error('handleCoursePress: No courseId provided');
      return;
    }
    routerInstance.push({
      pathname: '/(courseView)/CourseDetails',
      params: { courseId: String(courseId) }
    });
  };

  // Filter out recommended courses from all courses
  const recommendedCourseIds = recommendedCourses.map(rec =>
    rec.courseId?._id || rec.courseId?.id || rec.course?._id || rec._id
  ).filter(Boolean);

  const publishedCourses = allCourses.filter(course =>
    !recommendedCourseIds.includes(course._id)
  );

  const contentCardData = publishedCourses.length > 0
    ? publishedCourses.slice(0, 8).map((course, index) => {
      const thumbnailUrl = normalizeMediaUrl(course.thumbnail);
      const fallbackImage = images[`contentCard${index + 1}`] || images.contentCard1;

      // Filter out placeholder/example URLs
      const isPlaceholderUrl = thumbnailUrl && (
        thumbnailUrl.includes('example.com') ||
        thumbnailUrl.includes('placeholder') ||
        course.thumbnail === 'https://example.com/thumbnail.jpg'
      );

      return {
        id: course._id || `${index}`,
        image: thumbnailUrl && !isPlaceholderUrl ? { uri: thumbnailUrl } : fallbackImage,
        title: course.title || course.name || 'Course',
        courseId: course._id,
        price: enrolledCourseIds.includes(course._id) ? 'ENROLLED' : (course.price || 0),
        isFavorite: favoriteIds.includes(course._id),
      };
    })
    : [];

  const renderContentCard = ({ item }) => (
    <ContentCard
      image={item.image}
      customStyles=""
      title={item.title}
      badge={item.badge}
      price={item.price}
      isFavorite={item.isFavorite}
      onFavoritePress={() => item.courseId && toggleFavorite(item.courseId)}
      onPress={() => item.courseId && handleCoursePress(item.courseId)}
    />
  );

  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#623AD9']} />}
      >
        <View className="flex-1">
          <ImageBackground
            source={images.mainBg}
            className="min-h-[320px] items-center justify-center pb-5"
          >
            {/* Header with Search and Profile - Absolute at top */}
            <View className="absolute top-0 left-0 right-0 flex flex-row w-full justify-between items-center px-6 pt-2 pb-2 z-10">
              <TouchableOpacity
                onPress={() => { routerInstance.push('/(home)/CourseSearch') }}
                activeOpacity={0.8}
                className="flex-1 mr-3"
              >
                <View className="flex-row items-center bg-white/20 backdrop-blur-md rounded-xl px-3 py-2 border border-white/30">
                  <Search size={16} color="#FFFFFF" />
                  <Text className="text-white/70 ml-2 text-sm font-medium">Search courses...</Text>
                </View>
              </TouchableOpacity>

              <Pressable
                onPress={() => { routerInstance.push('../(profile)/profile') }}
                style={{
                  padding: 8,
                  width: 44,
                  height: 44,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Image
                  source={icons.profile}
                  style={{ width: 28, height: 28, tintColor: '#FFFFFF' }}
                  resizeMode="contain"
                />
              </Pressable>
            </View>

            {/* Hero Section - Title and Buttons - Centered in hero area */}
            <View className="w-full flex flex-col items-center justify-center px-4" style={{ minHeight: 280, paddingTop: 60 }}>
              <Text className="text-white text-xl text-center font-semibold px-4 mb-6 leading-6">
                Understanding The Power Of Well-Being Tools, Techniques & Strategies In Your Daily Life
              </Text>

              {/* Take Assessment Button - Show ONLY if assessment NOT completed */}
              {!hasCompletedAssessment && (
                <TouchableOpacity
                  onPress={handleTakeAssessment}
                  className="bg-primary/70 rounded-full px-8 py-3 mb-3 w-[90%] max-w-[350px]"
                  style={{
                    shadowColor: '#F59E0B',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 5,
                    elevation: 5
                  }}
                >
                  <Text className="text-white text-base font-bold text-center">Take Assessment</Text>
                </TouchableOpacity>
              )}

              {/* Full Guide Button - Always show */}
              <TouchableOpacity
                onPress={() => { routerInstance.push('../(guide)/FullGuide') }}
                className="bg-primary rounded-full px-8 py-3 w-[90%] max-w-[350px]"
                style={{
                  shadowColor: '#623AD9',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 5,
                  elevation: 5
                }}
              >
                <Text className="text-white text-base font-bold text-center">App Foundations</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>

          <View className="flex-1 bg-secondary rounded-t-3xl pt-8 -mt-5">
            {/* Recommended Courses Section - On Top */}
            {showRecommendations && hasCompletedAssessment && (
              <View className="mb-6">
                <View className="flex-row items-center justify-between mx-5 mb-4">
                  <Text className="text-lg font-semibold">Recommended For You</Text>
                  <View className="bg-primary px-3 py-1 rounded-full">
                    <Text className="text-white text-xs font-bold">PERSONALIZED</Text>
                  </View>
                </View>

                {/* Personalized Recommendations Text from Insights */}
                {profileInsights?.recommendations && profileInsights.recommendations.length > 0 && (
                  <View className="mx-5 mb-4 px-4 py-4 bg-gradient-to-r from-primary/10 to-purple-50 rounded-xl border-l-4 border-primary shadow-sm">
                    <View className="flex-row items-start mb-2">
                      <Text className="text-2xl mr-2">✨</Text>
                      <View className="flex-1">
                        <Text className="text-sm font-bold text-primary mb-1">
                          Personalized Just For You
                        </Text>
                        <Text className="text-sm text-gray-700 leading-5">
                          {profileInsights.recommendations[0]}
                        </Text>
                        {profileInsights.summary?.primaryConcerns && profileInsights.summary.primaryConcerns.length > 0 && (
                          <View className="mt-2 flex-row flex-wrap">
                            {profileInsights.summary.primaryConcerns.map((concern, idx) => (
                              <View key={idx} className="bg-primary/20 px-2.5 py-1 rounded-full mr-2 mb-1">
                                <Text className="text-xs font-semibold text-primary">{concern}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                )}

                {/* Recommended Courses from API */}
                {recommendationsLoading ? (
                  <View className="mx-5 mb-4 p-4 bg-gray-50 rounded-lg items-center justify-center">
                    <ActivityIndicator size="large" color="#623AD9" />
                    <Text className="text-sm text-gray-600 text-center mt-2">Loading recommended courses...</Text>
                  </View>
                ) : recommendedCourses.length > 0 ? (
                  <FlatList
                    data={recommendedCourses}
                    renderItem={({ item, index }) => {
                      // Handle the actual API response structure: item.courseId is an object
                      const courseId = item.courseId?._id || item.courseId?.id || item.course?._id || item._id;
                      const courseTitle = item.courseId?.title || item.courseName || item.course?.title || item.title || item.course?.name || 'Course';
                      const courseThumbnail = item.courseId?.thumbnail || item.course?.thumbnail || item.thumbnail;
                      const courseDescription = item.courseId?.description || item.description;
                      const matchingTags = item.matchingTags || [];
                      const reason = item.reason || '';

                      // Use fallback image if no thumbnail
                      const fallbackImage = images[`contentCard${(index % 4) + 1}`] || images.contentCard1;
                      const normalizedThumbnail = normalizeMediaUrl(courseThumbnail);
                      const isPlaceholderUrl = normalizedThumbnail && (
                        normalizedThumbnail.includes('example.com') ||
                        normalizedThumbnail.includes('placeholder')
                      );
                      const imageSource = normalizedThumbnail && !isPlaceholderUrl ? { uri: normalizedThumbnail } : fallbackImage;

                      const isFavorite = favoriteIds.includes(courseId);
                      const isEnrolled = enrolledCourseIds.includes(courseId);
                      const price = isEnrolled ? 'ENROLLED' : (item.courseId?.price || item.price || 0);

                      return (
                        <ContentCard
                          title={courseTitle}
                          image={imageSource}
                          badge="RECOMMENDED"
                          price={price}
                          isFavorite={isFavorite}
                          onFavoritePress={() => toggleFavorite(courseId)}
                          onPress={() => handleCoursePress(courseId)}
                        />
                      );
                    }}
                    keyExtractor={(item, index) => {
                      const id = item.courseId?._id || item.courseId?.id || item._id || item.course?._id || `rec-${index}`;
                      return String(id);
                    }}
                    scrollEnabled={false}
                  />
                ) : (
                  <View className="mx-5 mb-4 p-4 bg-gray-50 rounded-lg">
                    <Text className="text-sm text-gray-600 text-center">
                      {profileInsights?.recommendations && profileInsights.recommendations.length > 0
                        ? 'Loading recommended courses...'
                        : 'Complete more assessments to get personalized course recommendations.'}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Mindfulness Resources Section */}
            {publishedCourses.length > 0 && (
              <>
                <Text className="text-lg font-semibold ml-5 mb-4 mt-2">
                  Mindfulness Resources
                </Text>

                {loading ? (
                  <View className="py-10">
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text className="text-center text-gray-600 mt-2">Loading courses...</Text>
                  </View>
                ) : (
                  <FlatList
                    data={contentCardData}
                    renderItem={renderContentCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    scrollEnabled={false}
                  />
                )}
              </>
            )}

            {/* Show message if no recommended courses but insights exist */}
            {showRecommendations && hasCompletedAssessment && !recommendationsLoading && recommendedCourses.length === 0 && profileInsights && (
              <View className="mx-5 mb-6 p-4 bg-gray-50 rounded-lg">
                <Text className="text-sm text-gray-600 text-center">
                  {profileInsights.recommendations && profileInsights.recommendations.length > 0
                    ? profileInsights.recommendations[0]
                    : 'Complete more assessments to get personalized course recommendations.'}
                </Text>
              </View>
            )}

            {!loading && publishedCourses.length === 0 && recommendedCourses.length === 0 && (
              <View className="py-10 px-5">
                <Text className="text-center text-gray-600">
                  No courses available at the moment. Please check back later.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView >
    </SafeAreaView >
  );
}