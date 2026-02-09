import { View, Text, ImageBackground, StatusBar, RefreshControl, ActivityIndicator } from 'react-native';
import React, { useState, useCallback, useEffect } from 'react';
import { ScrollView } from 'react-native';
import images from '../../../constants/images';
import { SafeAreaView } from 'react-native-safe-area-context';
import CourseContent from '../../../components/CourseContent';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '../../../services/api';
import { normalizeMediaUrl } from '../../../utils/imageUtils';

const CurriculumView = () => {
  const router = useRouter();
  const { courseId, toolId } = useLocalSearchParams();

  const [refreshing, setRefreshing] = useState(false);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCourseDetails = useCallback(async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await api.courses.getCourse(courseId, { includeDetails: 'true' });
      const courseData = response.success ? response.data : (response.data || response);
      setCourse(courseData);
    } catch (err) {
      console.error('❌ Error fetching course details:', err);
      setError('Failed to load curriculum content');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId, fetchCourseDetails]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (courseId) {
      await fetchCourseDetails();
    } else {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    setRefreshing(false);
  }, [courseId, fetchCourseDetails]);

  const handleBlockPress = (blockId) => {
    router.push({
      pathname: '/ContentView',
      params: { blockId, courseId }
    });
  };

  // Toolkit Guide Data
  const toolkitGuides = {
    'dhikr': [
      {
        title: "Introduction to Dhikr",
        guideCards: [
          { title: "What is Dhikr?", buttonTitle: "Read", handlePress: () => handleBlockPress('dhikr_1') },
          { title: "Benefits for Mental Health", buttonTitle: "Read", handlePress: () => handleBlockPress('dhikr_2') }
        ]
      }
    ],
    'breath': [
      {
        title: "Breathing Techniques",
        guideCards: [
          { title: "Box Breathing", buttonTitle: "Try", handlePress: () => handleBlockPress('breath_1') },
          { title: "Diaphragmatic Breathing", buttonTitle: "Try", handlePress: () => handleBlockPress('breath_2') }
        ]
      }
    ],
    'reflect': [
      {
        title: "The Art of Muraqaba",
        guideCards: [
          { title: "Self-Reflection Basics", buttonTitle: "Read", handlePress: () => handleBlockPress('reflect_1') }
        ]
      }
    ],
    'safety': [
      {
        title: "Emotional First Aid",
        guideCards: [
          { title: "Grounding Techniques", buttonTitle: "Open", handlePress: () => handleBlockPress('safety_1') }
        ]
      }
    ]
  };

  const renderCurriculum = () => {
    if (courseId && course?.lessons) {
      return course.lessons.map((lesson, index) => (
        <CourseContent
          key={lesson._id || index}
          title={lesson.title}
          guideCards={(lesson.blocks || []).map(block => ({
            title: block.title || "Content Block",
            buttonTitle: "Start",
            handlePress: () => handleBlockPress(block._id)
          }))}
        />
      ));
    }

    if (toolId && toolkitGuides[toolId]) {
      return toolkitGuides[toolId].map((section, index) => (
        <CourseContent
          key={index}
          title={section.title}
          guideCards={section.guideCards}
        />
      ));
    }

    return null;
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#623AD9" />
          <Text className="text-gray-600 mt-4">Preparing your guide...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar backgroundColor="#161622" style="light" />
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="pb-10">
          <View className="mt-8 mb-4 px-6">
            <Text className="font-bold text-3xl text-gray-900">
              {course?.title || (toolId ? toolId.charAt(0).toUpperCase() + toolId.slice(1) + " Guide" : "Full Guide")}
            </Text>
          </View>

          <View className='mx-6 rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-6'>
            <ImageBackground
              source={course?.thumbnail ? { uri: normalizeMediaUrl(course.thumbnail) } : images.fullGuide}
              className="w-full h-56"
              resizeMode="cover"
            />
          </View>

          <View className="px-5">
            {renderCurriculum()}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CurriculumView;
