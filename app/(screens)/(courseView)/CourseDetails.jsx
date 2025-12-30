import { View, Text, ImageBackground, StatusBar, RefreshControl, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft } from 'lucide-react-native';
import api from '../../../services/api';
import images from '../../../constants/images';
import { normalizeMediaUrl, getImageSource } from '../../../utils/imageUtils';
import SubscriptionPopup from '../../../components/SubscriptionPopup';

const CourseDetails = () => {
  const router = useRouter();
  const { courseId } = useLocalSearchParams();
  
  console.log('🎯 CourseDetails component rendered with courseId:', courseId);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [expandedLessons, setExpandedLessons] = useState({});
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [error, setError] = useState(null);
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);

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

      // Check if course already has lessons populated (from includeDetails)
      let lessonsData = [];
      if (courseData.lessons && Array.isArray(courseData.lessons) && courseData.lessons.length > 0) {
        console.log('✅ Using lessons from course data:', courseData.lessons.length);
        lessonsData = courseData.lessons;
      } else {
        // Fetch lessons separately if not included
        console.log('⚠️ Course data does not include lessons, fetching separately...');
        const lessonsResponse = await api.courses.getLessonsByCourse(courseId, { includeBlocks: 'true' });
        console.log('Lessons response structure:', {
          hasSuccess: !!lessonsResponse.success,
          hasData: !!lessonsResponse.data,
          isArray: Array.isArray(lessonsResponse.data),
          isArrayDirect: Array.isArray(lessonsResponse),
          responseKeys: Object.keys(lessonsResponse || {})
        });
        console.log('Full lessons response:', JSON.stringify(lessonsResponse, null, 2));
        
        // Backend returns: { success: true, data: lessons }
        if (lessonsResponse.success) {
          lessonsData = Array.isArray(lessonsResponse.data) ? lessonsResponse.data : [];
        } else if (Array.isArray(lessonsResponse.data)) {
          lessonsData = lessonsResponse.data;
        } else if (Array.isArray(lessonsResponse)) {
          lessonsData = lessonsResponse;
        } else {
          lessonsData = [];
        }
      }
      
      console.log('✅ Final lessons data:', lessonsData.length, 'lessons');
      if (lessonsData.length > 0) {
        console.log('First lesson sample:', {
          id: lessonsData[0]._id,
          title: lessonsData[0].title,
          hasBlocks: !!lessonsData[0].blocks,
          blocksCount: lessonsData[0].blocks?.length || 0
        });
      }

      // If blocks are not included in lessons, fetch them for each lesson
      const lessonsWithBlocks = await Promise.all(
        lessonsData.map(async (lesson) => {
          // Check if lesson already has valid blocks
          const hasValidBlocks = lesson.blocks && 
                                Array.isArray(lesson.blocks) && 
                                lesson.blocks.length > 0 &&
                                lesson.blocks.some(block => block && block._id);
          
          if (hasValidBlocks) {
            console.log(`✅ Lesson "${lesson.title}" (${lesson._id}) already has ${lesson.blocks.length} blocks`);
            // Filter out any null/undefined blocks and ensure they have required fields
            const validBlocks = lesson.blocks
              .filter(block => block && block._id)
              .map(block => ({
                ...block,
                blockType: block.blockType || 'text',
                title: block.title || block.content?.heading || 'Untitled',
              }));
            return { ...lesson, blocks: validBlocks };
          }

          // Otherwise, fetch blocks for this lesson
          try {
            console.log(`📦 Fetching blocks for lesson "${lesson.title}" (${lesson._id})...`);
            const blocksResponse = await api.courses.getBlocksByLesson(lesson._id);
            console.log(`📦 Blocks response for lesson ${lesson._id}:`, {
              hasSuccess: !!blocksResponse?.success,
              hasData: !!blocksResponse?.data,
              isArray: Array.isArray(blocksResponse?.data),
              responseType: typeof blocksResponse
            });
            
            let blocks = [];
            if (blocksResponse?.success && blocksResponse?.data) {
              blocks = Array.isArray(blocksResponse.data) ? blocksResponse.data : [];
            } else if (Array.isArray(blocksResponse?.data)) {
              blocks = blocksResponse.data;
            } else if (Array.isArray(blocksResponse)) {
              blocks = blocksResponse;
            }

            // Filter and validate blocks
            const validBlocks = blocks
              .filter(block => block && block._id)
              .map(block => ({
                ...block,
                blockType: block.blockType || 'text',
                title: block.title || block.content?.heading || block.content?.title || 'Untitled',
              }));

            console.log(`✅ Fetched ${validBlocks.length} valid blocks for lesson "${lesson.title}"`);
            if (validBlocks.length > 0) {
              console.log(`   Block types: ${validBlocks.map(b => b.blockType).join(', ')}`);
            }
            return { ...lesson, blocks: validBlocks };
          } catch (blockError) {
            console.warn(`⚠️ Error fetching blocks for lesson "${lesson.title}" (${lesson._id}):`, blockError);
            return { ...lesson, blocks: [] };
          }
        })
      );

      console.log('✅ Final lessons with blocks:', lessonsWithBlocks.length);
      lessonsWithBlocks.forEach((lesson, index) => {
        console.log(`Lesson ${index + 1}: ${lesson.blocks?.length || 0} blocks`);
      });

      setLessons(Array.isArray(lessonsWithBlocks) ? lessonsWithBlocks : []);

      // Check enrollment status
      try {
        const enrollmentResponse = await api.courses.getCourseWithEnrollment(courseId);
        console.log('Enrollment response:', enrollmentResponse);
        const enrollmentData = enrollmentResponse.success 
          ? enrollmentResponse.data 
          : (enrollmentResponse.data || enrollmentResponse);
        
        // More robust enrollment check
        const isUserEnrolled = !!(
          enrollmentData?.enrollment?.status === 'active' || 
          enrollmentData?.isEnrolled === true ||
          (enrollmentData?.enrollment && enrollmentData.enrollment !== null && enrollmentData.enrollment !== undefined)
        );
        
        console.log('✅ Enrollment check:', {
          hasEnrollment: !!enrollmentData?.enrollment,
          enrollmentStatus: enrollmentData?.enrollment?.status,
          isEnrolled: enrollmentData?.isEnrolled,
          finalDecision: isUserEnrolled
        });
        
        setIsEnrolled(isUserEnrolled);
      } catch (enrollError) {
        console.log('Enrollment check error:', {
          message: enrollError.message,
          status: enrollError.status,
          statusCode: enrollError.statusCode
        });
        
        // If error is 409 (Conflict = already enrolled), set as enrolled
        if (enrollError.status === 409 || enrollError.statusCode === 409) {
          console.log('✅ 409 detected - User is already enrolled');
          setIsEnrolled(true);
        } else {
          setIsEnrolled(false);
        }
      }
    } catch (err) {
      console.error('Error fetching course details:', err);
      console.error('Error stack:', err.stack);
      console.error('Error details:', {
        message: err.message,
        status: err.status,
        data: err.data
      });
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCourseDetails();
  }, [fetchCourseDetails]);

  const handleEnroll = () => {
    // Redirect to payment screen with course details
    const coursePrice = course?.price || course?.cost || 0;
    router.push({
      pathname: '/(payment)/coursePayment',
      params: {
        courseId: courseId,
        courseTitle: course?.title || course?.name || 'Course',
        coursePrice: coursePrice.toString(),
      }
    });
  };

  const toggleLesson = (lessonId) => {
    setExpandedLessons(prev => ({
      ...prev,
      [lessonId]: !prev[lessonId]
    }));
  };

  const handleContentPress = async (lessonId, blockId, blockType, block = null) => {
    if (!isEnrolled) {
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

    const isLocked = !isEnrolled;

    return (
      <TouchableOpacity
        key={block._id}
        onPress={() => handleContentPress(lessonId, block._id, block.blockType, block)}
        className={`rounded-lg p-4 mb-3 border ${isLocked ? 'bg-gray-100 border-gray-300 opacity-75' : 'bg-white border-gray-200'}`}
        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}
        disabled={isLocked}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <Text className="text-2xl mr-3">{getBlockIcon(block.blockType)}</Text>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className={`text-base font-semibold ${isLocked ? 'text-gray-500' : 'text-gray-800'}`} numberOfLines={2}>
                  {block.title || block.content?.heading || `${getBlockTypeLabel(block.blockType)} Content`}
                </Text>
                {isLocked && (
                  <Text className="ml-2 text-lg">🔒</Text>
                )}
              </View>
              {block.content?.description && (
                <Text className={`text-sm mt-1 ${isLocked ? 'text-gray-400' : 'text-gray-600'}`} numberOfLines={2}>
                  {block.content.description}
                </Text>
              )}
              {block.blockType === 'quiz' && block.content?.questions && (
                <Text className={`text-xs mt-1 ${isLocked ? 'text-gray-400' : 'text-primary'}`}>
                  {block.content.questions.length} Questions
                  {block.content.timeLimit && ` • ${block.content.timeLimit} mins`}
                </Text>
              )}
              {block.blockType === 'video' && block.content?.duration && (
                <Text className={`text-xs mt-1 ${isLocked ? 'text-gray-400' : 'text-gray-500'}`}>
                  Duration: {Math.floor(block.content.duration / 60)}:{String(block.content.duration % 60).padStart(2, '0')}
                </Text>
              )}
            </View>
          </View>
          <View className={`px-3 py-1 rounded-full ${isLocked ? 'bg-gray-200' : 'bg-primary/10'}`}>
            <Text className={`text-xs font-semibold ${isLocked ? 'text-gray-500' : 'text-primary'}`}>
              {isLocked ? 'Locked' : getBlockTypeLabel(block.blockType)}
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
        <StatusBar backgroundColor="#161622" style="light" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#623AD9" />
          <Text className="text-gray-600 mt-4">Loading course details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error or loading states
  if (error && !loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar backgroundColor="#161622" style="light" />
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
        <StatusBar backgroundColor="#161622" style="light" />
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
      <StatusBar backgroundColor="#161622" style="light" />
      <ScrollView
        className="flex-1 bg-white"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#623AD9']} />
        }
      >
        {/* Header with Back Button */}
        <View className="flex-row items-center px-4 py-3 bg-white">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold flex-1" numberOfLines={2}>
            {course.title || course.name}
          </Text>
        </View>

        {/* Course Banner - Show actual course image and title */}
        <View className="relative bg-black">
          <ImageBackground
            source={getImageSource(course.thumbnail, images.fullGuide)}
            className="w-full"
            style={{ minHeight: 280 }}
            imageStyle={{ opacity: 0.7 }}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
            <View className="p-6" style={{ minHeight: 280 }}>
              {/* Course Title */}
              <View className="mb-4">
                <Text className="text-white text-2xl font-bold" numberOfLines={3}>
                  {course.title || course.name}
                </Text>
              </View>
              
              {/* Scenic Image Area - Bottom part of banner */}
              <View className="absolute bottom-0 left-0 right-0 h-40">
                <ImageBackground
                  source={getImageSource(course.thumbnail, images.fullGuide)}
                  className="w-full h-full"
                  imageStyle={{ opacity: 0.9 }}
                >
                  {/* Overlay for text readability */}
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.5)']}
                    style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 50 }}
                  />
                  {/* Bottom Text */}
                  <View className="absolute bottom-2 left-0 right-0 px-6">
                    <Text className="text-white text-xs" style={{ fontSize: 10, letterSpacing: 0.5 }}>
                      MY DAILY WELL-BEING ONLINE PORTAL
                    </Text>
                  </View>
                </ImageBackground>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* All Course Content - Show all lessons and blocks with clean UI */}
        {lessons.length > 0 && (
          <View className="px-5 pb-6 bg-white">
            {lessons
              .filter(lesson => lesson && lesson._id)
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((lesson, lessonIndex) => {
                const contentBlocks = lesson.blocks || [];
                
                return (
                  <View key={lesson._id} className="mb-6">
                    {/* Lesson Title */}
                    <Text className="text-lg font-bold text-gray-800 mb-3">
                      {lesson.title || `Lesson ${lessonIndex + 1}`}
                    </Text>
                    
                    {/* All Content Blocks in this Lesson */}
                    {contentBlocks
                      .filter(block => block && block._id)
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((block, blockIndex) => {
                        const blockTitle = block.title || block.content?.heading || `${getBlockTypeLabel(block.blockType)} ${blockIndex + 1}`;
                        
                        return (
                          <TouchableOpacity
                            key={block._id || blockIndex}
                            onPress={() => {
                              if (!isEnrolled) {
                                setShowSubscriptionPopup(true);
                              } else {
                                handleContentPress(lesson._id, block._id, block.blockType, block);
                              }
                            }}
                            className="bg-white rounded-lg p-4 mb-3 flex-row items-center justify-between border border-gray-200"
                            style={{
                              shadowColor: '#000',
                              shadowOffset: { width: 0, height: 1 },
                              shadowOpacity: 0.05,
                              shadowRadius: 2,
                              elevation: 1
                            }}
                          >
                            <Text className="text-gray-800 flex-1 text-base" numberOfLines={2}>
                              {blockTitle}
                            </Text>
                            <TouchableOpacity 
                              className="bg-gray-800 px-4 py-2 rounded-full"
                              onPress={(e) => {
                                e.stopPropagation();
                                if (!isEnrolled) {
                                  setShowSubscriptionPopup(true);
                                } else {
                                  handleContentPress(lesson._id, block._id, block.blockType, block);
                                }
                              }}
                            >
                              <Text className="text-white text-sm font-semibold">Start</Text>
                            </TouchableOpacity>
                          </TouchableOpacity>
                        );
                      })}
                  </View>
                );
              })}
          </View>
        )}
      </ScrollView>

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

