import React, { useState, useEffect } from 'react';
import { View, Text, Image, Alert, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../../../components/CustomButton';
import { images } from '../../../constants';
import { ChevronLeft } from 'lucide-react-native';
import StandardHeader from '../../../components/StandardHeader';
import { router, useLocalSearchParams } from 'expo-router';
import { assessmentService } from '../../../services/assessmentService';
import { useGlobalContext } from '../../../lib/globalContext';

export default function AssessmentStart() {
    const { fromProfile } = useLocalSearchParams();
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useGlobalContext();

    useEffect(() => {
        fetchAssessments();
    }, []);

    const fetchAssessments = async () => {
        try {
            setLoading(true);
            const response = await assessmentService.getAssessments();

            if (response.success && response.data) {
                setAssessments(response.data);
            } else {
                setError('No assessments available');
            }
        } catch (err) {
            console.error('Error fetching assessments:', err);
            setError(err.message || 'Failed to load assessments');
        } finally {
            setLoading(false);
        }
    };

    const startAssessment = async (assessmentId) => {
        try {
            // Check if there's existing progress
            const progress = await assessmentService.getProgress(assessmentId);

            if (progress && progress.currentQuestion < progress.totalQuestions) {
                Alert.alert(
                    'Resume Assessment',
                    `You have completed ${progress.percentage}% of this assessment. Do you want to continue?`,
                    [
                        {
                            text: 'Start Over',
                            onPress: async () => {
                                await assessmentService.clearProgress(assessmentId);
                                await assessmentService.clearLocalResponses(assessmentId);
                                router.push({
                                    pathname: '/(selfAssesment)/AssessmentQuestion',
                                    params: { assessmentId, questionIndex: 0 }
                                });
                            }
                        },
                        {
                            text: 'Continue',
                            onPress: () => {
                                router.push({
                                    pathname: '/(selfAssesment)/AssessmentQuestion',
                                    params: { assessmentId, questionIndex: progress.currentQuestion }
                                });
                            }
                        }
                    ]
                );
            } else {
                // Start fresh
                router.push({
                    pathname: '/(selfAssesment)/AssessmentQuestion',
                    params: { assessmentId, questionIndex: 0 }
                });
            }
        } catch (error) {
            console.error('Error starting assessment:', error);
            Alert.alert('Error', 'Failed to start assessment');
        }
    };

    const goBack = () => {
        if (fromProfile === 'true') {
            router.replace('/(profile)/profile');
        } else {
            router.back();
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white" edges={['top']}>
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#623AD9" />
                    <Text className="mt-4 text-gray-600">Loading assessments...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView className="flex-1 bg-white" edges={['top']}>
                <View className="flex-1 justify-center items-center px-8">
                    <Text className="text-red-500 text-lg text-center mb-4">{error}</Text>
                    <CustomButton
                        title="Try Again"
                        handlePress={fetchAssessments}
                        containerStyles="bg-primary py-3 px-8 rounded-full"
                        textStyles="text-white font-semibold"
                    />
                    <CustomButton
                        title="Go Back"
                        handlePress={goBack}
                        containerStyles="bg-gray-200 py-3 px-8 rounded-full mt-3"
                        textStyles="text-gray-700 font-semibold"
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <StandardHeader
                title="Assessment"
                centeredTitle={true}
                onBackPress={fromProfile === 'true' ? () => router.replace('/(profile)/profile') : undefined}
            />
            <ScrollView className="flex-1">
                <View className="px-8 py-4">

                    {/* Welcome Message */}
                    <View className="items-center justify-center mb-8">
                        <Image
                            source={images.survey1}
                            style={{ width: 250, height: 250 }}
                            resizeMode="contain"
                        />
                        <Text className="text-black text-2xl font-semibold text-center mt-4">
                            Welcome{user?.firstName ? `, ${user.firstName}` : ''}!
                        </Text>
                        <Text className="text-gray-600 text-center mt-2 px-4">
                            Complete these assessments to help us personalize your experience and recommend the best courses for you.
                        </Text>
                    </View>

                    {/* Start All Questions Flow */}
                    {assessments.length > 0 ? (
                        <View className="w-full">
                            <Text className="text-lg font-semibold text-gray-800 mb-4 text-center">
                                Complete all questions to get personalized recommendations
                            </Text>
                            <Text className="text-sm text-gray-600 mb-6 text-center">
                                {assessments.length} question{assessments.length !== 1 ? 's' : ''} to answer
                            </Text>
                            <CustomButton
                                title="Start Assessment"
                                handlePress={() => {
                                    // Start with the first assessment
                                    if (assessments.length > 0) {
                                        startAssessment(assessments[0]._id);
                                    }
                                }}
                                containerStyles="bg-primary py-4 rounded-full"
                                textStyles="text-white font-semibold text-lg"
                            />
                        </View>
                    ) : (
                        <View className="items-center py-8">
                            <Text className="text-gray-600 text-center">
                                No assessments available at the moment.
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

