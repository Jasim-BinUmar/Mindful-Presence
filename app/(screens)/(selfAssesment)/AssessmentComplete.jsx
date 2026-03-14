import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, SafeAreaView } from 'react-native';
import { CheckCircle, ChevronLeft } from 'lucide-react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { router, useLocalSearchParams } from 'expo-router';
import { assessmentService } from '../../../services/assessmentService';

export default function AssessmentComplete() {
    const { totalQuestions = 7 } = useLocalSearchParams();
    const [percentage, setPercentage] = useState(0);
    const [completedTasks, setCompletedTasks] = useState(0);
    const [showDialog, setShowDialog] = useState(false);

    const tasks = [
        'Analyzing answers',
        'Performing calculations',
        'Preparing suggestions....'
    ];

    useEffect(() => {
        // Animate progress to 75% over 3 seconds
        let progressCounter = 0;
        const progressInterval = setInterval(() => {
            progressCounter += 1;
            setPercentage(prev => {
                const newValue = Math.min(prev + 1, 75);
                if (newValue >= 75) {
                    clearInterval(progressInterval);
                }
                return newValue;
            });
        }, 40); // 75 * 40ms ≈ 3 seconds

        // Mark tasks as complete one by one
        let taskCounter = 0;
        const taskInterval = setInterval(() => {
            taskCounter += 1;
            setCompletedTasks(prev => {
                const newValue = prev + 1;
                if (newValue >= tasks.length) {
                    clearInterval(taskInterval);
                    // After all tasks complete, show dialog
                    setTimeout(() => {
                        setShowDialog(true);
                    }, 500);
                    return newValue;
                }
                return newValue;
            });
        }, 1000); // One task per second

        // Regenerate profile in background
        const regenerateProfile = async () => {
            try {
                console.log('🔄 Regenerating profile...');
                const regenerateResponse = await assessmentService.regenerateProfile();
                
                if (regenerateResponse.success) {
                    console.log('✅ Profile regenerated successfully');
                } else {
                    console.warn('⚠️ Profile regeneration returned:', regenerateResponse);
                }
            } catch (error) {
                console.error('Error regenerating profile:', error);
            }
        };

        regenerateProfile();

        return () => {
            clearInterval(progressInterval);
            clearInterval(taskInterval);
        };
    }, []);

    const handleViewRecommendations = () => {
        setShowDialog(false);
        router.replace('/(screens)/(home)/Home');
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <TouchableOpacity
                onPress={() => router.back()}
                className="p-4 self-start"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <ChevronLeft size={24} color="#1E1E2D" strokeWidth={2.5} />
            </TouchableOpacity>
            <View className="flex-1 px-6 pt-4">
                {/* Header */}
                <Text className="text-4xl font-bold text-center mb-4">
                    Thank You For Sharing
                </Text>

                <Text className="text-xl text-gray-600 text-center mb-12">
                    We are taking your data to create personalized app experience.
                </Text>

                {/* Progress Circle */}
                <View className="items-center justify-center mb-16">
                    <AnimatedCircularProgress
                        size={200}
                        width={20}
                        fill={percentage}
                        duration={3000}
                        tintColor="#623AD9"
                        backgroundColor="#FBFBFB"
                    >
                        {(fill) => (
                            <Text className="text-5xl font-bold">
                                {Math.round(percentage)}%
                            </Text>
                        )}
                    </AnimatedCircularProgress>
                </View>

                {/* Status List */}
                <View className="px-12">
                    {tasks.map((task, index) => (
                        <View key={index} className="flex-row items-center mb-6">
                            {completedTasks > index ? (
                                <CheckCircle size={24} color="#623AD9" style={{ marginRight: 10 }} />
                            ) : (
                                <View 
                                    className="w-6 h-6 rounded-full border-2 border-gray-300 mr-3"
                                />
                            )}
                            <Text 
                                className={`text-base ${
                                    completedTasks > index 
                                        ? 'text-gray-500 line-through' 
                                        : 'text-gray-600'
                                }`}
                            >
                                {task}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Assessment Complete Dialog */}
            <Modal
                visible={showDialog}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowDialog(false)}
            >
                <View 
                    style={{ 
                        flex: 1, 
                        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        padding: 24
                    }}
                >
                    <View 
                        style={{
                            backgroundColor: 'white',
                            borderRadius: 16,
                            padding: 24,
                            width: '100%',
                            maxWidth: 400
                        }}
                    >
                        <Text 
                            style={{
                                fontSize: 24,
                                fontWeight: 'bold',
                                textAlign: 'center',
                                marginBottom: 16,
                                color: '#000'
                            }}
                        >
                            Assessment Complete!
                        </Text>
                        <Text 
                            style={{
                                fontSize: 16,
                                color: '#666',
                                textAlign: 'center',
                                marginBottom: 24,
                                lineHeight: 22
                            }}
                        >
                            Thank you for completing all {totalQuestions} questions. We will use this to recommend courses for you.
                        </Text>
                        <TouchableOpacity
                            onPress={handleViewRecommendations}
                            style={{
                                backgroundColor: '#623AD9',
                                paddingVertical: 16,
                                borderRadius: 999,
                                alignItems: 'center'
                            }}
                        >
                            <Text 
                                style={{
                                    color: 'white',
                                    fontSize: 16,
                                    fontWeight: '600'
                                }}
                            >
                                VIEW RECOMMENDATIONS
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

