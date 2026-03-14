import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Modal, Alert, Animated, Dimensions, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import YoutubePlayer from 'react-native-youtube-iframe';
import { ArrowLeft, CheckCircle, ChevronRight, X, Play, Clock, Award, ChevronLeft, FileText, ArrowRight, HelpCircle, List } from 'lucide-react-native';

const Skeleton = ({ className }) => (
    <View className={`bg-gray-200 rounded ${className}`} />
);
import api from '../../../services/api';
import { normalizeMediaUrl, getYoutubeId } from '../../../utils/imageUtils';
import { getAllLessonsInDisplayOrder } from '../../../utils/courseStructure';
import MarkdownText from '../../../components/MarkdownText';

const { width } = Dimensions.get('window');

const LessonView = () => {
    const router = useRouter();
    const { lessonId, courseId } = useLocalSearchParams();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lesson, setLesson] = useState(null);
    const [blocks, setBlocks] = useState([]);
    const [courseLessons, setCourseLessons] = useState([]);
    const [quizStatuses, setQuizStatuses] = useState({});
    const [nextLessonId, setNextLessonId] = useState(null);
    const [isCurriculumOpen, setIsCurriculumOpen] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [error, setError] = useState(null);
    const videoRef = useRef(null);

    const fetchLessonData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('📡 Fetching lesson details and blocks for:', lessonId);

            // 1. Fetch Lesson Core Data
            const lessonResponse = await api.courses.getLesson(lessonId);
            const lessonData = lessonResponse.success ? lessonResponse.data : (lessonResponse.data || lessonResponse);
            setLesson(lessonData);

            // 2. Fetch Blocks for this lesson
            const blocksResponse = await api.courses.getBlocksByLesson(lessonId);
            let blocksData = [];
            if (blocksResponse.success && blocksResponse.data) {
                blocksData = Array.isArray(blocksResponse.data) ? blocksResponse.data : [];
            } else if (Array.isArray(blocksResponse)) {
                blocksData = blocksResponse;
            }

            // Sort blocks by order
            const sortedBlocks = blocksData.sort((a, b) => (a.order || 0) - (b.order || 0));
            setBlocks(sortedBlocks);

            // 3. Check Quiz Statuses for all quiz blocks
            const quizBlocks = sortedBlocks.filter(b => b.blockType === 'quiz');
            const statuses = {};

            await Promise.all(quizBlocks.map(async (block) => {
                const quizContentId = block.quizContentId || (block.content?.quizContentId);
                if (quizContentId) {
                    try {
                        const summary = await api.quizzes.getAttemptSummary(quizContentId);
                        statuses[block._id] = summary?.data || summary;
                    } catch (e) {
                        console.warn(`Could not fetch status for quiz ${quizContentId}:`, e);
                        statuses[block._id] = { totalAttempts: 0, hasPassed: false };
                    }
                }
            }));

            setQuizStatuses(statuses);

            // 4. Find Next Lesson (use course structure for ordered list)
            if (courseId) {
                try {
                    const structureResponse = await api.courses.getCourseStructure(courseId, { includeBlocks: 'false' });
                    const raw = structureResponse?.success ? structureResponse.data : (structureResponse?.data || structureResponse);
                    if (raw && typeof raw === 'object') {
                        const structureData = {
                            sections: Array.isArray(raw.sections) ? raw.sections : [],
                            standaloneLessons: Array.isArray(raw.standaloneLessons) ? raw.standaloneLessons : [],
                        };
                        const sortedLessons = getAllLessonsInDisplayOrder(structureData);
                        setCourseLessons(sortedLessons);
                        const currentIndex = sortedLessons.findIndex(l => l._id === lessonId);
                        if (currentIndex !== -1 && currentIndex < sortedLessons.length - 1) {
                            setNextLessonId(sortedLessons[currentIndex + 1]._id);
                        } else {
                            setNextLessonId(null);
                        }
                    } else {
                        const courseResponse = await api.courses.getCourse(courseId, { includeDetails: 'true' });
                        const courseData = courseResponse?.success ? courseResponse.data : (courseResponse?.data || courseResponse);
                        if (courseData?.lessons && Array.isArray(courseData.lessons)) {
                            const sortedLessons = [...courseData.lessons].sort((a, b) => (a.order || 0) - (b.order || 0));
                            setCourseLessons(sortedLessons);
                            const currentIndex = sortedLessons.findIndex(l => l._id === lessonId);
                            if (currentIndex !== -1 && currentIndex < sortedLessons.length - 1) {
                                setNextLessonId(sortedLessons[currentIndex + 1]._id);
                            } else {
                                setNextLessonId(null);
                            }
                        }
                    }
                } catch (e) {
                    console.warn('Could not determine next lesson:', e);
                }
            }

            // Mark this lesson as 'in_progress' when opened
            if (lessonId) {
                api.courses.updateLessonProgress(lessonId, 'in_progress').catch(err => console.log('Silent progress error'));
            }

        } catch (err) {
            console.error('❌ Error fetching lesson data:', err);

            // If access denied (403), navigate back and potentially show popup
            if (err.status === 403 || err.statusCode === 403 || err.message?.includes('Access denied')) {
                Alert.alert(
                    "Enrollment Required",
                    "Please enroll in this course to view the full lesson content.",
                    [
                        {
                            text: "OK",
                            onPress: () => router.back()
                        }
                    ]
                );
                return;
            }

            setError(err.message || 'Failed to load lesson content');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [lessonId, courseId]);

    useEffect(() => {
        if (lessonId) {
            fetchLessonData();
        }
    }, [lessonId, fetchLessonData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchLessonData();
    }, [fetchLessonData]);

    const handleStartQuiz = (blockId, quizContentId) => {
        router.push({
            pathname: '/(courseView)/QuizView',
            params: { lessonId, blockId, courseId, quizContentId }
        });
    };

    const handleMarkComplete = async () => {
        try {
            setIsCompleting(true);
            await api.courses.updateLessonProgress(lessonId, 'completed');
            handleNextLesson();
        } catch (err) {
            console.error('Complete lesson error:', err);
            handleNextLesson(); // Move anyway
        } finally {
            setIsCompleting(false);
        }
    };

    const handleNextLesson = () => {
        if (nextLessonId) {
            router.push({
                pathname: '/(courseView)/LessonView',
                params: { lessonId: nextLessonId, courseId }
            });
        } else {
            router.back();
        }
    };

    const renderBlock = (block, index) => {
        const { blockType, content, _id } = block;

        switch (blockType) {
            case 'heading':
                return (
                    <View key={_id || index} className="mb-6 px-5">
                        <Text className="text-gray-900 font-bold text-2xl">
                            {content?.heading || block.title}
                        </Text>
                    </View>
                );

            case 'subheading':
                return (
                    <View key={_id || index} className="mb-4 px-5">
                        <Text className="text-gray-800 font-bold text-xl">
                            {content?.subheading || block.title}
                        </Text>
                    </View>
                );

            case 'text':
                return (
                    <View key={_id || index} className="mb-6 px-5">
                        <MarkdownText content={content?.text || content?.body || content?.description} />
                    </View>
                );

            case 'image':
                const imageUrl = normalizeMediaUrl(content?.imageUrl || content?.url);
                return (
                    <View key={_id || index} className="mb-6 px-5">
                        {imageUrl ? (
                            <View className="rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-gray-100">
                                <Image
                                    source={{ uri: imageUrl }}
                                    className="w-full h-56"
                                    resizeMode="cover"
                                />
                                {content?.caption && (
                                    <View className="bg-gray-50 p-3">
                                        <Text className="text-gray-500 text-sm text-center italic">
                                            {content.caption}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ) : null}
                    </View>
                );

            case 'video':
                const vUrl = normalizeMediaUrl(content?.videoUrl || content?.url);
                const yId = getYoutubeId(content?.videoUrl || content?.url);
                return (
                    <View key={_id || index} className="mb-8 overflow-hidden rounded-2xl bg-black mx-5 shadow-lg">
                        {yId ? (
                            <YoutubePlayer height={220} videoId={yId} play={false} />
                        ) : vUrl ? (
                            <Video
                                source={{ uri: vUrl }}
                                useNativeControls
                                resizeMode={ResizeMode.CONTAIN}
                                className="w-full h-56"
                            />
                        ) : (
                            <View className="h-56 items-center justify-center bg-gray-900">
                                <Text className="text-gray-500">Video not available</Text>
                            </View>
                        )}
                        <View className="bg-primary/10 px-4 py-2 flex-row items-center border-t border-primary/5">
                            <Play size={14} color="#623AD9" fill="#623AD9" />
                            <Text className="text-primary font-bold text-xs ml-2 uppercase tracking-widest">Video Lesson</Text>
                        </View>
                    </View>
                );

            case 'multiQuiz':
            case 'quiz':
                const quizStatus = quizStatuses[_id] || { totalAttempts: 0, hasPassed: false };
                const hasTaken = quizStatus.totalAttempts > 0;

                // Determine if it's a multi-quiz or single quiz for styling/text purposes
                const isMulti = blockType === 'multiQuiz';
                const questionCount = content?.questions?.length || (blockType === 'multiQuiz' ? 'Multiple' : 1);

                const qType = block.content?.questionType || 'singleChoice';
                const isOneTime = !isMulti && (qType === 'freeText' || qType === 'shortAnswer');

                // Use quizId for multiQuiz, quizContentId for single quiz
                const quizIdToUse = blockType === 'multiQuiz' ? (block.quizId || content?.quizId) : (block.quizContentId || content?.quizContentId);

                return (
                    <View key={_id || index} className="mb-8 px-5">
                        <View className="bg-white border-2 border-primary/20 rounded-2xl p-5 shadow-sm">
                            <View className="flex-row items-center mb-4">
                                <View className="bg-primary/10 p-3 rounded-full mr-4">
                                    <HelpCircle size={24} color="#623AD9" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-900 font-bold text-lg">
                                        {block.title || (isMulti ? 'Quiz Assessment' : 'Knowledge Check')}
                                    </Text>
                                    <Text className="text-gray-500 text-sm">
                                        {hasTaken
                                            ? `Completed • Score: ${quizStatus.bestScore || 0}%`
                                            : (isMulti ? `${questionCount} Questions • Test your knowledge` : 'Take this quiz to test your learning')}
                                    </Text>
                                </View>
                                {quizStatus.hasPassed && (
                                    <CheckCircle size={24} color="#22C55E" />
                                )}
                            </View>

                            <TouchableOpacity
                                onPress={() => handleStartQuiz(_id, quizIdToUse)}
                                disabled={isOneTime && hasTaken}
                                className={`py-4 rounded-xl items-center flex-row justify-center ${isOneTime && hasTaken ? 'bg-gray-200' : 'bg-primary'}`}
                            >
                                <Text className={`font-bold mr-2 ${isOneTime && hasTaken ? 'text-gray-500' : 'text-white'}`}>
                                    {hasTaken ? (isOneTime ? 'Submitted' : 'Retake Quiz') : 'Start Quiz'}
                                </Text>
                                {!(isOneTime && hasTaken) && <ArrowRight size={18} color="white" />}
                            </TouchableOpacity>

                            {isOneTime && hasTaken && (
                                <Text className="text-gray-400 text-xs text-center mt-2">
                                    This is a one-time submission question
                                </Text>
                            )}
                        </View>
                    </View>
                );

            default:
                return null;
        }
    };

    const lessonBlocks = blocks;

    if (loading && !refreshing) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="px-5 pt-10">
                    <Skeleton className="w-full h-12 mb-8" />
                    <Skeleton className="w-1/2 h-4 mb-4" />
                    <Skeleton className="w-3/4 h-8 mb-8" />
                    <Skeleton className="w-full h-56 mb-8" />
                    <Skeleton className="w-full h-24 mb-4" />
                </View>
            </SafeAreaView>
        );
    }

    if (error && !refreshing) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 justify-center items-center px-6">
                    <Text className="text-red-500 text-lg font-bold mb-2">Oops!</Text>
                    <Text className="text-gray-600 text-center mb-6">{error}</Text>
                    <TouchableOpacity onPress={() => router.back()} className="bg-primary px-8 py-3 rounded-xl">
                        <Text className="text-white font-bold">Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <StatusBar style="dark" translucent />

            {/* Dynamic Header */}
            <View className="flex-row items-center px-4 py-3 border-b border-gray-100 bg-white shadow-sm">
                <TouchableOpacity onPress={() => router.back()} className="mr-2 p-2">
                    <ChevronLeft size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-gray-900 font-bold text-lg flex-1 truncate mr-2" numberOfLines={1}>
                    {lesson?.title || 'Lesson Details'}
                </Text>
                <TouchableOpacity
                    onPress={() => setIsCurriculumOpen(true)}
                    className="p-3 bg-gray-50 rounded-full"
                >
                    <List size={22} color="#623AD9" />
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#623AD9']} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Intro Header */}
                <View className="mt-8 mb-6 px-5 items-center">
                    <View className="bg-primary/5 p-6 rounded-full mb-4">
                        <FileText size={48} color="#623AD9" />
                    </View>
                    <Text className="text-gray-400 text-sm uppercase tracking-widest font-bold">
                        {lessonBlocks.some(b => b.blockType === 'video') ? 'Video Lesson' : 'Reading Lesson'}
                    </Text>
                    <Text className="text-gray-900 font-bold text-2xl text-center mt-2">
                        {lesson?.title}
                    </Text>
                </View>

                {/* Main Content Area - All blocks in sequence */}
                <View className="pb-10">
                    {lessonBlocks.length > 0 ? (
                        lessonBlocks.map((block, index) => renderBlock(block, index))
                    ) : (
                        <View className="py-20 items-center px-10">
                            <View className="bg-gray-50 p-8 rounded-full mb-6">
                                <FileText size={64} color="#D1D5DB" />
                            </View>
                            <Text className="text-gray-900 font-bold text-xl text-center mb-2">No Content Yet</Text>
                            <Text className="text-gray-400 text-center leading-6">
                                This lesson doesn't have any content blocks added yet. Please check back later or add content from the admin panel.
                            </Text>
                        </View>
                    )}
                </View>

                {/* Footer/Progress - Smart End Logic */}
                <View className="px-5 pb-12 mt-6">
                    <View className="h-px bg-gray-50 w-full mb-8 shadow-sm" />
                    <TouchableOpacity
                        onPress={handleMarkComplete}
                        disabled={isCompleting}
                        activeOpacity={0.8}
                        className={`${nextLessonId ? 'bg-primary' : 'bg-green-500'} py-4 rounded-2xl items-center flex-row justify-center active:scale-95 shadow-lg shadow-black/30`}
                    >
                        {isCompleting ? (
                            <ActivityIndicator color="white" className="mr-2" />
                        ) : (
                            nextLessonId ? (
                                <CheckCircle size={18} color="white" className="mr-2" />
                            ) : (
                                <Award size={18} color="white" className="mr-2" />
                            )
                        )}
                        <Text className="text-white font-black text-base ml-2 uppercase tracking-wide">
                            {nextLessonId ? 'Complete & Continue' : 'Finish Course'}
                        </Text>
                    </TouchableOpacity>

                    {nextLessonId && (
                        <TouchableOpacity
                            onPress={handleNextLesson}
                            className="mt-6 py-2 items-center"
                        >
                            <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest">Skip to next lesson</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>

            {/* Curriculum Drawer Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isCurriculumOpen}
                onRequestClose={() => setIsCurriculumOpen(false)}
            >
                <View className="flex-1 bg-black/40 justify-end">
                    <TouchableOpacity
                        className="flex-1"
                        activeOpacity={1}
                        onPress={() => setIsCurriculumOpen(false)}
                    />
                    <View className="bg-white rounded-t-3xl h-3/4 shadow-2xl overflow-hidden">
                        <View className="flex-row justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                            <View>
                                <Text className="text-xl font-bold text-gray-900">Course Curriculum</Text>
                                <Text className="text-gray-500 text-sm">{courseLessons.length} Lessons</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setIsCurriculumOpen(false)}
                                className="bg-gray-200 p-2 rounded-full"
                            >
                                <X size={20} color="#4B5563" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView className="flex-1">
                            {courseLessons.map((l, index) => {
                                const isActive = l._id === lessonId;
                                return (
                                    <TouchableOpacity
                                        key={l._id}
                                        onPress={() => {
                                            if (l._id !== lessonId) {
                                                router.push({
                                                    pathname: '/(courseView)/LessonView',
                                                    params: { lessonId: l._id, courseId }
                                                });
                                                setIsCurriculumOpen(false);
                                            }
                                        }}
                                        className={`flex-row items-center p-5 border-b border-gray-50 ${isActive ? 'bg-primary/5' : ''}`}
                                    >
                                        <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${isActive ? 'bg-primary' : 'bg-gray-100'}`}>
                                            <Text className={`font-bold ${isActive ? 'text-white' : 'text-gray-500'}`}>{index + 1}</Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text className={`text-base font-semibold ${isActive ? 'text-primary' : 'text-gray-800'}`} numberOfLines={1}>
                                                {l.title}
                                            </Text>
                                            <Text className="text-gray-400 text-sm">
                                                {l.blocks?.length || 0} items
                                            </Text>
                                        </View>
                                        {isActive && <CheckCircle size={18} color="#623AD9" />}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default LessonView;
