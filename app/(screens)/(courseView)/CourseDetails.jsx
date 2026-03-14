import { View, Text, ImageBackground, RefreshControl, TouchableOpacity, ActivityIndicator, ScrollView, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Play, Lock, Info, Star, Clock, Users, Globe, CheckCircle, MoreVertical, Layers, ChevronRight, Bookmark, HelpCircle, FileText, Video, Heart } from 'lucide-react-native';
import api from '../../../services/api';
import images from '../../../constants/images';
import { normalizeMediaUrl, getImageSource } from '../../../utils/imageUtils';
import { getAllLessonsInDisplayOrder } from '../../../utils/courseStructure';
import SubscriptionPopup from '../../../components/SubscriptionPopup';
import StandardHeader from '../../../components/StandardHeader';

const Skeleton = ({ className }) => (
  <View className={`bg-gray-200 rounded ${className}`} />
);

const CourseDetails = () => {
  const router = useRouter();
  const { courseId } = useLocalSearchParams();

  console.log('🎯 CourseDetails component rendered with courseId:', courseId);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [course, setCourse] = useState(null);
  const [structure, setStructure] = useState({ sections: [], standaloneLessons: [] });
  const [expandedLessons, setExpandedLessons] = useState({});
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progress, setProgress] = useState(null);
  const [lastViewedLessonId, setLastViewedLessonId] = useState(null);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Animation for list items
  const AnimatedPressable = Animated.createAnimatedComponent(TouchableOpacity);

  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 100,
      friction: 5,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 5,
    }).start();
  };

  // Fetch course details
  const fetchCourseDetails = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      console.log('Fetching course details for courseId:', courseId);

      // Fetch course with details (includes lessons and blocks)
      console.log('📡 Making API call to:', `courses/${courseId}?includeDetails=true`);
      const courseResponse = await api.courses.getCourse(courseId, { includeDetails: 'true' });
      console.log('📥 Course API response received');
      console.log('Course response structure:', {
        hasSuccess: !!courseResponse?.success,
        hasData: !!courseResponse?.data,
        isDirectData: !courseResponse?.success && !courseResponse?.data,
        keys: Object.keys(courseResponse || {})
      });
      console.log('Course response:', JSON.stringify(courseResponse, null, 2));

      if (!courseResponse) {
        throw new Error('No course data received');
      }

      // Backend returns: { success: true, data: course }
      const courseData = courseResponse.success ? courseResponse.data : (courseResponse.data || courseResponse);
      if (!courseData) {
        throw new Error('Invalid course data structure');
      }

      console.log('Extracted course data:', courseData);
      console.log('Course has lessons?', !!courseData.lessons, 'Type:', typeof courseData.lessons);
      if (courseData.lessons) {
        console.log('Lessons in course:', Array.isArray(courseData.lessons), 'Length:', courseData.lessons.length);
      }

      setCourse(courseData);

      // Check enrollment first BEFORE fetching lessons/blocks (which might be protected)
      console.log('🔐 Checking enrollment status...');
      let isUserEnrolled = false;
      try {
        const enrollmentResponse = await api.courses.getCourseWithEnrollment(courseId);
        const enrollmentData = enrollmentResponse.success
          ? enrollmentResponse.data
          : (enrollmentResponse.data || enrollmentResponse);

        // More robust enrollment check - look for active status or a valid enrollment ID
        isUserEnrolled = !!(
          enrollmentData?.isEnrolled === true ||
          enrollmentData?.enrollment?.status === 'active' ||
          (enrollmentData?.enrollment && enrollmentData.enrollment._id)
        );
        // Check if course is in favorites
        try {
          const favoriteRes = await api.user.getFavoriteIds();
          if (favoriteRes.success && Array.isArray(favoriteRes.data)) {
            setIsFavorite(favoriteRes.data.includes(courseId));
          }
        } catch (err) {
          console.warn('Error checking favorite status:', err);
        }

        setIsEnrolled(isUserEnrolled);
        console.log('✅ Enrollment status:', isUserEnrolled);
      } catch (enrollError) {
        console.log('⚠️ Enrollment check error:', enrollError.status);
        if (enrollError.status === 409) {
          isUserEnrolled = true;
          setIsEnrolled(true);
        } else {
          isUserEnrolled = false;
          setIsEnrolled(false);
        }
      }

      let structureData = { sections: [], standaloneLessons: [] };
      try {
        const structureResponse = await api.courses.getCourseStructure(courseId, { includeBlocks: 'false' });
        const raw = structureResponse?.success ? structureResponse.data : (structureResponse?.data || structureResponse);
        if (raw && typeof raw === 'object') {
          structureData = {
            sections: Array.isArray(raw.sections) ? raw.sections : [],
            standaloneLessons: Array.isArray(raw.standaloneLessons) ? raw.standaloneLessons : [],
          };
          console.log('✅ Course structure loaded:', structureData.sections.length, 'sections,', structureData.standaloneLessons.length, 'standalone lessons');
        }
      } catch (structureErr) {
        console.warn('⚠️ getCourseStructure failed, falling back to getLessonsByCourse:', structureErr);
        if (isUserEnrolled) {
          try {
            const lessonsResponse = await api.courses.getLessonsByCourse(courseId, { includeBlocks: 'false' });
            const flat = lessonsResponse?.success ? lessonsResponse.data : (lessonsResponse?.data || lessonsResponse);
            const list = Array.isArray(flat) ? flat : [];
            structureData = { sections: [], standaloneLessons: list };
            console.log('✅ Fallback: flat lessons loaded', list.length);
          } catch (e) {
            console.warn('Fallback getLessonsByCourse failed:', e);
          }
        }
      }
      setStructure(structureData);

      // Update progress if enrolled
      if (isUserEnrolled) {
        // Fetch progress data
        try {
          const progressRes = await api.courses.getCourseProgress(courseId);
          setProgress(progressRes?.data || progressRes);

          const lastViewedRes = await api.courses.getLastViewed(courseId);
          setLastViewedLessonId(lastViewedRes?.data?.lessonId || lastViewedRes?.lessonId);
        } catch (pErr) {
          console.warn('Progress fetch error:', pErr);
        }
      } else {
        // Don't show popup immediately, let user see lessons first
        console.log('User not enrolled, lessons will be visible but locked');
      }
    } catch (err) {
      setError(err.message || 'Failed to load course details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [courseId]);

  useEffect(() => {
    console.log('CourseDetails useEffect triggered, courseId:', courseId);

    if (!courseId) {
      console.error('CourseDetails: No courseId provided');
      setError('Course ID is missing');
      setLoading(false);
      return;
    }

    console.log('CourseDetails: Starting to fetch course details for:', courseId);
    fetchCourseDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]); // fetchCourseDetails is stable due to useCallback with courseId dependency

  const toggleFavorite = async () => {
    try {
      const newStatus = !isFavorite;
      setIsFavorite(newStatus);
      const response = await api.user.toggleFavorite(courseId);
      if (!response.success) {
        setIsFavorite(!newStatus);
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
      setIsFavorite(!isFavorite);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCourseDetails();
  }, [fetchCourseDetails]);

  const handleEnroll = async () => {
    // If user is already enrolled, do nothing
    if (isEnrolled) return;

    const coursePrice = course?.price || 0;

    if (coursePrice === 0) {
      try {
        setLoading(true);
        console.log('🚀 Enrolling in free course:', courseId);
        const response = await api.courses.enrollInCourse(courseId);
        if (response.success) {
          setIsEnrolled(true);
          // Refresh course details to get full access
          await fetchCourseDetails();
        }
      } catch (err) {
        console.error('Enrollment error:', err);
        setError(err.message || 'Failed to enroll in free course');
      } finally {
        setLoading(false);
      }
    } else {
      // Redirect to payment screen with course details
      router.push({
        pathname: '/(payment)/coursePayment',
        params: {
          courseId: courseId,
          courseTitle: course?.title || course?.name || 'Course',
          coursePrice: coursePrice.toString(),
        }
      });
    }
  };

  const handleLessonPress = (lessonId) => {
    console.log('👆 Lesson pressed:', lessonId, '| Enrolled:', isEnrolled);
    // If not enrolled, show subscription popup instead of navigating to protected lesson view
    if (!isEnrolled) {
      console.log('🚫 Access blocked: User not enrolled');
      setShowSubscriptionPopup(true);
      return;
    }

    console.log('✅ Access allowed: Navigating to lesson');

    router.push({
      pathname: '/(courseView)/LessonView',
      params: { lessonId, courseId }
    });
  };

  const lessonsInOrder = React.useMemo(() => getAllLessonsInDisplayOrder(structure), [structure]);

  const handleResume = () => {
    if (!isEnrolled) {
      setShowSubscriptionPopup(true);
      return;
    }
    const targetId = lastViewedLessonId || (lessonsInOrder[0]?._id);
    if (targetId) handleLessonPress(targetId);
  };

  const toggleLesson = (lessonId) => {
    setExpandedLessons(prev => ({
      ...prev,
      [lessonId]: !prev[lessonId]
    }));
  };

  const handleContentPress = async (lessonId, blockId, blockType, block = null) => {
    // If not enrolled, show subscription popup
    if (!isEnrolled) {
      console.log('User not enrolled, showing subscription popup on content access');
      setShowSubscriptionPopup(true);
      return;
    }

    // Navigate based on content type
    if (blockType === 'video') {
      router.push({
        pathname: '/(courseView)/VideoPlayer',
        params: { lessonId, blockId, courseId }
      });
    } else if (blockType === 'quiz') {
      // For quiz blocks, quizContentId is stored at block level (block.quizContentId)
      // It references the QuizContent model _id
      console.log('🔍 Quiz block structure:', {
        blockId,
        blockKeys: block ? Object.keys(block) : 'no block',
        contentKeys: block?.content ? Object.keys(block.content) : 'no content',
        blockQuizContentId: block?.quizContentId,  // This is the key field!
        fullBlock: JSON.stringify(block, null, 2)
      });

      // First, try to get quizContentId from the block object
      let quizContentId = block?.quizContentId;  // Primary location: block.quizContentId

      // If not found in block, fetch the block individually to get full data
      if (!quizContentId) {
        try {
          console.log('📦 Fetching block individually to get quizContentId...');
          const blockResponse = await api.courses.getBlock(blockId);
          const fullBlockData = blockResponse.success
            ? blockResponse.data
            : (blockResponse.data || blockResponse);

          console.log('📦 Full block data:', {
            quizContentId: fullBlockData?.quizContentId,
            allKeys: fullBlockData ? Object.keys(fullBlockData) : 'no data',
            fullData: JSON.stringify(fullBlockData, null, 2)
          });

          quizContentId = fullBlockData?.quizContentId;

          // If still not found, try getting from lesson blocks
          if (!quizContentId && lessonId) {
            try {
              console.log('🔍 quizContentId not in block response, trying to get from lesson blocks...');
              const lessonBlocksResponse = await api.courses.getBlocksByLesson(lessonId);
              const lessonBlocks = lessonBlocksResponse.success
                ? lessonBlocksResponse.data
                : (Array.isArray(lessonBlocksResponse.data) ? lessonBlocksResponse.data : []);

              // Find the block in the lesson blocks array
              const foundBlock = Array.isArray(lessonBlocks)
                ? lessonBlocks.find(b => b._id === blockId || b._id?.toString() === blockId?.toString())
                : null;

              if (foundBlock?.quizContentId) {
                quizContentId = foundBlock.quizContentId;
                console.log('✅ Found quizContentId from lesson blocks:', quizContentId);
              }
            } catch (lessonError) {
              console.warn('⚠️ Could not get quizContentId from lesson blocks:', lessonError);
            }
          }
        } catch (fetchError) {
          console.error('❌ Error fetching block:', fetchError);
        }
      }

      // Final check - if still not found, show error
      if (!quizContentId) {
        console.error('❌ quizContentId not found. Backend should include quizContentId in block response.');
        alert('Error: Quiz content ID not found. Please contact support.');
        return;
      }

      console.log('✅ Using quizContentId:', quizContentId);

      router.push({
        pathname: '/(courseView)/QuizView',
        params: { lessonId, blockId, courseId, quizContentId }
      });
    } else {
      router.push({
        pathname: '/(courseView)/ContentView',
        params: { lessonId, blockId, courseId }
      });
    }
  };

  const getBlockIcon = (type) => {
    switch (type) {
      case 'video': return '🎥';
      case 'quiz': return '📝';
      case 'text': return '📄';
      case 'image': return '🖼️';
      case 'heading': return '📌';
      default: return '📚';
    }
  };

  const getBlockTypeLabel = (type) => {
    switch (type) {
      case 'video': return 'Video';
      case 'quiz': return 'Quiz';
      case 'text': return 'Reading';
      case 'image': return 'Image';
      case 'heading': return 'Section';
      default: return 'Content';
    }
  };

  const renderContentBlock = (block, lessonId) => {
    // Log block details for debugging
    if (block.blockType === 'video') {
      console.log('🎥 Rendering video block:', {
        blockId: block._id,
        title: block.title,
        hasContent: !!block.content,
        videoUrl: block.content?.videoUrl || block.content?.url,
        blockType: block.blockType
      });
    }

    // Content is always accessible (preview mode)
    const isLocked = false;

    return (
      <TouchableOpacity
        key={block._id}
        onPress={() => handleContentPress(lessonId, block._id, block.blockType, block)}
        className={`rounded-lg p-4 mb-3 border bg-white border-gray-200`}
        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <Text className="text-2xl mr-3">{getBlockIcon(block.blockType)}</Text>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-base font-semibold text-gray-800" numberOfLines={2}>
                  {block.title || block.content?.heading || `${getBlockTypeLabel(block.blockType)} Content`}
                </Text>
              </View>
              {block.content?.description && (
                <Text className="text-sm mt-1 text-gray-600" numberOfLines={2}>
                  {block.content.description}
                </Text>
              )}
              {block.blockType === 'quiz' && block.content?.questions && (
                <Text className="text-xs mt-1 text-primary">
                  {block.content.questions.length} Questions
                  {block.content.timeLimit && ` • ${block.content.timeLimit} mins`}
                </Text>
              )}
              {block.blockType === 'video' && block.content?.duration && (
                <Text className="text-xs mt-1 text-gray-500">
                  Duration: {Math.floor(block.content.duration / 60)}:{String(block.content.duration % 60).padStart(2, '0')}
                </Text>
              )}
            </View>
          </View>
          <View className="px-3 py-1 rounded-full bg-primary/10">
            <Text className="text-xs font-semibold text-primary">
              {getBlockTypeLabel(block.blockType)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderLesson = (lesson, index) => {
    const isExpanded = expandedLessons[lesson._id];
    const contentBlocks = lesson.blocks || [];
    const hasQuiz = contentBlocks.some(block => block.blockType === 'quiz');

    return (
      <View key={lesson._id} className="mb-4">
        <TouchableOpacity
          onPress={() => toggleLesson(lesson._id)}
          className="bg-primary rounded-lg p-4"
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 3 }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <View className="flex-row items-center mb-1">
                <View className="bg-white/20 rounded-full w-8 h-8 items-center justify-center mr-3">
                  <Text className="text-white font-bold">{lesson.order || index + 1}</Text>
                </View>
                <Text className="text-white font-bold text-lg flex-1" numberOfLines={2}>
                  {lesson.title}
                </Text>
              </View>
              {lesson.description && (
                <Text className="text-white/80 text-sm mt-1 ml-11" numberOfLines={2}>
                  {lesson.description}
                </Text>
              )}
              <View className="flex-row items-center mt-2 ml-11">
                <Text className="text-white/70 text-xs">
                  {contentBlocks.length} {contentBlocks.length === 1 ? 'item' : 'items'}
                </Text>
                {hasQuiz && (
                  <View className="bg-white/20 px-2 py-0.5 rounded-full ml-2">
                    <Text className="text-white text-xs">📝 Quiz</Text>
                  </View>
                )}
                {lesson.duration && (
                  <Text className="text-white/70 text-xs ml-2">
                    • {lesson.duration} mins
                  </Text>
                )}
              </View>
            </View>
            <Text className="text-white text-xl">
              {isExpanded ? '▼' : '▶'}
            </Text>
          </View>
        </TouchableOpacity>

        {isExpanded && contentBlocks.length > 0 && (
          <View className="mt-3 ml-4 mr-2">
            {contentBlocks
              .filter(block => block && block._id) // Filter out any null/undefined blocks
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map(block => renderContentBlock(block, lesson._id))}
          </View>
        )}
        {isExpanded && (!contentBlocks || contentBlocks.length === 0) && (
          <View className="mt-3 ml-4 mr-2 bg-gray-50 p-4 rounded-lg">
            <Text className="text-gray-500 text-sm text-center">
              No content blocks available for this lesson
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar style="dark" translucent />
        <View className="px-5 pt-8">
          <Skeleton className="w-full h-56 mb-6" />
          <Skeleton className="w-3/4 h-8 mb-4" />
          <Skeleton className="w-1/2 h-4 mb-8" />
          <View className="space-y-4">
            <Skeleton className="w-full h-16" />
            <Skeleton className="w-full h-16" />
            <Skeleton className="w-full h-16" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Show error or loading states
  if (error && !loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar style="dark" translucent />
        <ScrollView className="flex-1">
          <View className="flex-1 justify-center items-center px-6 py-10">
            <Text className="text-red-500 text-xl font-semibold mb-2">Error Loading Course</Text>
            <Text className="text-gray-600 text-center mb-2">{error}</Text>
            {courseId && (
              <Text className="text-gray-400 text-sm text-center mb-4">
                Course ID: {courseId}
              </Text>
            )}
            <TouchableOpacity
              onPress={fetchCourseDetails}
              className="bg-primary px-6 py-3 rounded-lg mb-4"
            >
              <Text className="text-white font-semibold">Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-gray-300 px-6 py-3 rounded-lg"
            >
              <Text className="text-gray-800 font-semibold">Go Back</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Don't render if course is null and we're not loading
  if (!course && !loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar style="dark" translucent />
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-gray-600 text-lg mb-2">Course not found</Text>
          <Text className="text-gray-400 text-sm text-center mb-4">
            Course ID: {courseId || 'Not provided'}
          </Text>
          <TouchableOpacity
            onPress={fetchCourseDetails}
            className="bg-primary px-6 py-3 rounded-lg mb-4"
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-gray-300 px-6 py-3 rounded-lg"
          >
            <Text className="text-gray-800 font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Don't render course content if course is null (should not happen)
  if (!course) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" translucent />

      <StandardHeader title={course?.title || course?.name || 'Course Details'} />

      <Animated.ScrollView
        className="flex-1 bg-gray-50/30"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#623AD9']} />
        }
      >
        {/* Parallax Image / Course Banner */}
        <View className="px-5 mt-4">
          <View className="rounded-[32px] overflow-hidden shadow-2xl shadow-black/30 border-2 border-white">
            <ImageBackground
              source={getImageSource(course.thumbnail, images.fullGuide)}
              className="w-full h-80 justify-end"
            >
              <LinearGradient
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)']}
                style={{ position: 'absolute', inset: 0 }}
              />

              <TouchableOpacity
                onPress={toggleFavorite}
                className="absolute top-6 right-6 bg-white/20 p-3 rounded-2xl border border-white/30 backdrop-blur-md"
              >
                <Heart
                  size={20}
                  color={isFavorite ? "#FF4B4B" : "white"}
                  fill={isFavorite ? "#FF4B4B" : "transparent"}
                />
              </TouchableOpacity>

              <View className="p-8">
                <Text className="text-white text-3xl font-black mb-1">
                  {course.title || course.name}
                </Text>
                <View className="flex-row items-center">
                  <View className="bg-primary/30 px-2 py-0.5 rounded-md mr-2">
                    <Text className="text-white text-[10px] font-bold uppercase tracking-widest">
                      {course.category || 'Expert Course'}
                    </Text>
                  </View>
                  <Text className="text-white/60 text-xs font-medium">
                    {lessonsInOrder.length} Modules • Lifetime Access
                  </Text>
                </View>

                <View className="flex-row items-center mt-3">
                  <View className={`px-3 py-1 rounded-full border border-white/30 mr-3 ${isEnrolled ? 'bg-green-500/80' : 'bg-white/20'}`}>
                    <Text className="text-white font-bold text-lg">
                      {isEnrolled ? 'ENROLLED' : (course.price > 0 ? `$${course.price}` : 'FREE')}
                    </Text>
                  </View>
                  {course.originalPrice > course.price && (
                    <Text className="text-white/50 text-sm line-through">
                      ${course.originalPrice}
                    </Text>
                  )}
                </View>
              </View>
            </ImageBackground>
          </View>
        </View>

        {/* Progress Section - Refined & Slimmer */}
        {isEnrolled && progress && (
          <View className="px-5 mb-8 mt-6">
            <View className="bg-white p-4 rounded-[32px] border border-gray-100 shadow-sm">
              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center">
                  <CheckCircle size={14} color="#623AD9" />
                  <Text className="text-gray-900 font-bold text-xs ml-2 uppercase tracking-wide">Course Progress</Text>
                </View>
                <Text className="text-primary font-black text-xs">{progress.percentage || 0}%</Text>
              </View>

              <View className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
                <View
                  className="h-full bg-primary"
                  style={{ width: `${progress.percentage || 0}%` }}
                />
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-gray-400 text-[10px] font-medium">
                  {progress.completedLessons || 0}/{progress.totalLessons ?? lessonsInOrder.length} COMPLETED
                </Text>
                <TouchableOpacity
                  onPress={handleResume}
                  className="bg-primary px-5 py-2.5 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/30 active:scale-95"
                >
                  <Play size={12} color="white" fill="white" />
                  <Text className="text-white font-bold text-[10px] ml-2">RESUME</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Curriculum: sections + standalone lessons */}
        {lessonsInOrder.length > 0 && (
          <View className="px-4 pb-10">
            {[...(structure.sections || [])]
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((section) => (
                <View key={section._id} className="mb-6">
                  <View className="mb-3 px-2">
                    <Text className="text-gray-900 font-bold text-base">
                      {section.title}
                    </Text>
                    {section.description ? (
                      <Text className="text-gray-500 text-sm mt-0.5" numberOfLines={2}>
                        {section.description}
                      </Text>
                    ) : null}
                  </View>
                  {[...(section.lessons || [])]
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                    .filter(lesson => lesson && lesson._id)
                    .map((lesson) => (
                      <TouchableOpacity
                        key={lesson._id}
                        onPress={() => handleLessonPress(lesson._id)}
                        activeOpacity={0.7}
                        className="flex-row items-center px-6 py-4 mb-4 bg-white border border-gray-100 rounded-[32px] shadow-sm active:scale-[0.98]"
                      >
                        <View className="flex-1 mr-4">
                          <View className="flex-row items-center mb-1">
                            {progress?.completedLessonIds?.includes(lesson._id) && (
                              <View className="bg-green-100 p-1 rounded-full mr-2">
                                <CheckCircle size={10} color="#22C55E" />
                              </View>
                            )}
                            <Text className="text-gray-800 font-bold text-sm leading-5">
                              {lesson.title}
                            </Text>
                          </View>
                          <View className="flex-row items-center mt-1">
                            <View className="flex-row items-center bg-gray-50 px-2 py-0.5 rounded-md mr-3">
                              {lesson.blocks?.some(b => b.blockType === 'video') ? (
                                <Video size={10} color="#9CA3AF" />
                              ) : (
                                <FileText size={10} color="#9CA3AF" />
                              )}
                              <Text className="text-gray-400 text-[9px] font-bold ml-1 uppercase">
                                {lesson.blocks?.some(b => b.blockType === 'video') ? 'Video' : 'Course Material'}
                              </Text>
                            </View>
                            <View className="flex-row items-center">
                              <Clock size={10} color="#9CA3AF" />
                              <Text className="text-gray-400 text-[9px] font-bold ml-1 uppercase">
                                {Math.max(5, (lesson.blocks?.length || 0) * 2)}m
                              </Text>
                            </View>
                          </View>
                        </View>
                        <View className={`px-5 py-2 rounded-2xl ${progress?.completedLessonIds?.includes(lesson._id) ? 'bg-gray-100 border border-gray-200' : 'bg-primary shadow-md shadow-primary/20'}`}>
                          <Text className={`font-bold text-[10px] uppercase tracking-wider ${progress?.completedLessonIds?.includes(lesson._id) ? 'text-gray-400' : 'text-white'}`}>
                            {progress?.completedLessonIds?.includes(lesson._id) ? 'Review' : 'Preview'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                </View>
              ))}
            {Array.isArray(structure.standaloneLessons) && structure.standaloneLessons.length > 0 && (
              <View className="mb-6">
                <View className="mb-3 px-2">
                  <Text className="text-gray-900 font-bold text-base">Other</Text>
                </View>
                {[...structure.standaloneLessons]
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .filter(lesson => lesson && lesson._id)
                  .map((lesson) => (
                    <TouchableOpacity
                      key={lesson._id}
                      onPress={() => handleLessonPress(lesson._id)}
                      activeOpacity={0.7}
                      className="flex-row items-center px-6 py-4 mb-4 bg-white border border-gray-100 rounded-[32px] shadow-sm active:scale-[0.98]"
                    >
                      <View className="flex-1 mr-4">
                        <View className="flex-row items-center mb-1">
                          {progress?.completedLessonIds?.includes(lesson._id) && (
                            <View className="bg-green-100 p-1 rounded-full mr-2">
                              <CheckCircle size={10} color="#22C55E" />
                            </View>
                          )}
                          <Text className="text-gray-800 font-bold text-sm leading-5">
                            {lesson.title}
                          </Text>
                        </View>
                        <View className="flex-row items-center mt-1">
                          <View className="flex-row items-center bg-gray-50 px-2 py-0.5 rounded-md mr-3">
                            {lesson.blocks?.some(b => b.blockType === 'video') ? (
                              <Video size={10} color="#9CA3AF" />
                            ) : (
                              <FileText size={10} color="#9CA3AF" />
                            )}
                            <Text className="text-gray-400 text-[9px] font-bold ml-1 uppercase">
                              {lesson.blocks?.some(b => b.blockType === 'video') ? 'Video' : 'Course Material'}
                            </Text>
                          </View>
                          <View className="flex-row items-center">
                            <Clock size={10} color="#9CA3AF" />
                            <Text className="text-gray-400 text-[9px] font-bold ml-1 uppercase">
                              {Math.max(5, (lesson.blocks?.length || 0) * 2)}m
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View className={`px-5 py-2 rounded-2xl ${progress?.completedLessonIds?.includes(lesson._id) ? 'bg-gray-100 border border-gray-200' : 'bg-primary shadow-md shadow-primary/20'}`}>
                        <Text className={`font-bold text-[10px] uppercase tracking-wider ${progress?.completedLessonIds?.includes(lesson._id) ? 'text-gray-400' : 'text-white'}`}>
                          {progress?.completedLessonIds?.includes(lesson._id) ? 'Review' : 'Preview'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
              </View>
            )}
          </View>
        )}
      </Animated.ScrollView>

      {/* Bottom Sticky Action Bar */}
      {!isEnrolled && (
        <View className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 shadow-2xl z-50">
          <TouchableOpacity
            onPress={handleEnroll}
            className="w-full bg-primary h-16 rounded-[24px] flex-row items-center justify-center shadow-xl shadow-primary/40 active:scale-95"
          >
            <View className="flex-row items-center px-6 justify-between w-full">
              <View>
                <Text className="text-white/70 text-[10px] uppercase font-black tracking-widest">Get Full Access</Text>
                <Text className="text-white text-lg font-black mt-0.5">
                  {course.price > 0 ? `BUY FOR $${course.price}` : 'JOIN FOR FREE'}
                </Text>
              </View>
              <View className="bg-white/20 p-2 rounded-xl">
                <ChevronRight size={20} color="white" />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Subscription Popup */}
      <SubscriptionPopup
        visible={showSubscriptionPopup}
        onClose={() => setShowSubscriptionPopup(false)}
        onSubscribe={() => {
          setShowSubscriptionPopup(false);
          handleEnroll();
        }}
        courseTitle={course?.title || course?.name}
      />
    </SafeAreaView>
  );
};

export default CourseDetails;

