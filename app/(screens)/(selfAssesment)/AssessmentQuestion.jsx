import React, { useState, useEffect } from 'react';
import { View, Text, Image, Alert, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../../../components/CustomButton';
import { images } from '../../../constants';
import { ChevronLeft } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { assessmentService } from '../../../services/assessmentService';

export default function AssessmentQuestion() {
    const params = useLocalSearchParams();
    const { assessmentId, questionIndex = 0 } = params;
    
    const [assessment, setAssessment] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [selectedAnswers, setSelectedAnswers] = useState([]); // For checkbox questions
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [responses, setResponses] = useState({});

    useEffect(() => {
        loadAssessment();
    }, [assessmentId]);

    const loadAssessment = async () => {
        try {
            setLoading(true);
            const response = await assessmentService.getAssessmentById(assessmentId);
            
            if (response && response.success && response.data) {
                const assessmentData = response.data;
                setAssessment(assessmentData);
                
                // Load existing responses
                const savedResponses = await assessmentService.getLocalResponses(assessmentId);
                setResponses(savedResponses);
                
                // Set selected answer if exists (use assessmentData, not assessment state which is async)
                if (savedResponses[questionIndex] && assessmentData) {
                    const saved = savedResponses[questionIndex];
                    if (assessmentData.answerFieldType === 'checkbox' && Array.isArray(saved)) {
                        setSelectedAnswers(saved);
                    } else {
                        setSelectedAnswer(saved);
                    }
                }
            } else if (response && response.data) {
                // Handle case where response structure might be different
                setAssessment(response.data);
            } else {
                setError('Assessment not found or invalid response');
            }
        } catch (err) {
            console.error('Error loading assessment:', err);
            setError(err.message || 'Failed to load assessment');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAnswer = (answerValue) => {
        const isCheckbox = assessment?.answerFieldType === 'checkbox';
        
        // Find the answer object to get the correct value field
        if (!assessment || !assessment.answers) {
            console.error('Assessment or answers not available');
            return;
        }
        
        const answerObj = assessment.answers.find(
            ans => ans.value === answerValue || 
                   String(ans.value) === String(answerValue) ||
                   ans._id === answerValue ||
                   String(ans._id) === String(answerValue) ||
                   ans.text === answerValue ||
                   ans.label === answerValue
        );
        
        // Use the value field from the answer object (required by backend)
        const actualValue = answerObj?.value || answerValue;
        
        if (isCheckbox) {
            // Toggle selection for checkbox
            setSelectedAnswers(prev => {
                const isSelected = prev.some(a => 
                    a === actualValue || 
                    String(a) === String(actualValue) ||
                    a === answerObj?.value ||
                    String(a) === String(answerObj?.value)
                );
                if (isSelected) {
                    return prev.filter(a => 
                        a !== actualValue && 
                        String(a) !== String(actualValue) &&
                        a !== answerObj?.value &&
                        String(a) !== String(answerObj?.value)
                    );
                } else {
                    return [...prev, actualValue];
                }
            });
        } else {
            // Single selection for radio, button, dropdown, text
            setSelectedAnswer(actualValue);
        }
        console.log('Answer selected:', {
            inputValue: answerValue,
            actualValue,
            answerObj,
            type: assessment?.answerFieldType
        });
    };

    const handleNext = async () => {
        const isCheckbox = assessment?.answerFieldType === 'checkbox';
        
        // Validate selection
        if (isCheckbox) {
            if (selectedAnswers.length === 0) {
                Alert.alert('Please select at least one answer', 'You must select at least one option for checkbox questions.');
                return;
            }
        } else {
            if (!selectedAnswer) {
                Alert.alert('Please select an answer', 'You must select an answer before proceeding.');
                return;
            }
        }

        try {
            // Submit the assessment
            await submitAssessment();
        } catch (error) {
            console.error('Error saving response:', error);
            Alert.alert('Error', 'Failed to save response');
        }
    };

    // Handle single-select answer selection - submit immediately
    const handleSingleSelect = (answerValue) => {
        if (submitting) return;
        
        // Set the selected answer
        handleSelectAnswer(answerValue);
        
        // Auto-submit after a short delay to ensure state is updated
        setTimeout(() => {
            if (!submitting && selectedAnswer) {
                submitAssessment();
            }
        }, 200);
    };

    const submitAssessment = async (answerValueOverride = null) => {
        // Use override value if provided (for single-select immediate submission)
        const answerToSubmit = answerValueOverride !== null ? answerValueOverride : selectedAnswer;
        const answersToSubmit = selectedAnswers;
        
        // Validate before submitting
        const isCheckbox = assessment?.answerFieldType === 'checkbox';
        
        if (isCheckbox) {
            if (answersToSubmit.length === 0) {
                Alert.alert('Selection Required', 'Please select at least one answer before proceeding.');
                return;
            }
        } else {
            if (!answerToSubmit) {
                Alert.alert('Selection Required', 'Please select an answer before proceeding.');
                return;
            }
        }

        try {
            setSubmitting(true);
            
            let formattedResponse;
            
            if (isCheckbox) {
                // For checkbox: send { answers: [{ answerValue, answerLabel }, ...] }
                const answerObjects = selectedAnswers.map(selectedValue => {
                    // Find the answer object that matches the selected value
                    const answerObj = assessment.answers?.find(
                        ans => ans.value === selectedValue || 
                               String(ans.value) === String(selectedValue) ||
                               ans._id === selectedValue || 
                               String(ans._id) === String(selectedValue) ||
                               ans.text === selectedValue ||
                               ans.label === selectedValue
                    );
                    
                    // Use the value field from the answer object (required by backend)
                    const answerValue = answerObj?.value || selectedValue;
                    const answerLabel = answerObj?.label || answerObj?.text || answerValue;
                    
                    return {
                        answerValue: String(answerValue),
                        answerLabel: String(answerLabel)
                    };
                });
                
                console.log('Checkbox submission:', {
                    selectedAnswers,
                    answerObjects
                });
                
                formattedResponse = {
                    answers: answerObjects
                };
            } else {
                // For single-select: send { answerValue, answerLabel }
                // Use override value if provided, otherwise use state
                const valueToUse = answerValueOverride !== null ? answerValueOverride : answerToSubmit;
                const selectedAnswerObj = assessment.answers?.find(
                    ans => ans.value === valueToUse || 
                           String(ans.value) === String(valueToUse) ||
                           ans._id === valueToUse || 
                           String(ans._id) === String(valueToUse) ||
                           ans.text === valueToUse ||
                           ans.label === valueToUse
                );
                
                // Use the value field from the answer object (required by backend)
                const answerValue = selectedAnswerObj?.value || valueToUse;
                const answerLabel = selectedAnswerObj?.label || selectedAnswerObj?.text || answerValue;
                
                console.log('Single-select submission:', {
                    selectedAnswer,
                    answerValue,
                    answerLabel,
                    answerObj: selectedAnswerObj
                });
                
                formattedResponse = {
                    answerValue: String(answerValue),
                    answerLabel: String(answerLabel)
                };
            }
            
            console.log('Submitting assessment:', {
                assessmentId,
                answerFieldType: assessment?.answerFieldType,
                formattedResponse
            });

            const response = await assessmentService.submitAssessment(assessmentId, formattedResponse);

            console.log('Submission response:', response);

            if (response && response.success) {
                console.log('✅ Assessment submitted successfully:', assessmentId);
                
                // Clear local progress for this assessment
                await assessmentService.clearProgress(assessmentId);
                
                // Wait a moment to ensure backend has processed the submission
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // Check if there are more assessments to complete
                try {
                    const allAssessmentsResponse = await assessmentService.getAssessments();
                    
                    if (allAssessmentsResponse && allAssessmentsResponse.success && allAssessmentsResponse.data) {
                        const allAssessments = allAssessmentsResponse.data;
                        const currentIndex = allAssessments.findIndex(a => 
                            a._id === assessmentId || 
                            String(a._id) === String(assessmentId)
                        );
                        
                        console.log(`📊 Progress: Question ${currentIndex + 1} of ${allAssessments.length} submitted`);
                        
                        const hasMoreQuestions = currentIndex >= 0 && 
                                               currentIndex < allAssessments.length - 1;
                        
                        if (hasMoreQuestions) {
                            // Move to next question
                            const nextAssessment = allAssessments[currentIndex + 1];
                            console.log('➡️ Moving to next assessment:', nextAssessment._id);
                            
                            // Small delay to ensure submission is complete before navigation
                            setTimeout(() => {
                                router.replace({
                                    pathname: '/(selfAssesment)/AssessmentQuestion',
                                    params: { 
                                        assessmentId: nextAssessment._id, 
                                        questionIndex: 0 
                                    }
                                });
                            }, 500);
                        } else {
                            // All questions completed
                            console.log(`🎉 All ${allAssessments.length} assessments completed!`);
                            
                            // Wait a moment for backend to process all submissions, then regenerate profile
                            setTimeout(async () => {
                                try {
                                    // Regenerate profile to get updated insights and recommendations
                                    console.log('🔄 Regenerating profile...');
                                    const regenerateResponse = await assessmentService.regenerateProfile();
                                    
                                    if (regenerateResponse.success) {
                                        console.log('✅ Profile regenerated successfully');
                                    } else {
                                        console.warn('⚠️ Profile regeneration returned:', regenerateResponse);
                                    }
                                    
                                    Alert.alert(
                                        'Assessment Complete!',
                                        `Thank you for completing all ${allAssessments.length} questions. We will use this to recommend courses for you.`,
                                        [
                                            {
                                                text: 'View Recommendations',
                                                onPress: () => router.replace('/(screens)/(home)/Home')
                                            }
                                        ]
                                    );
                                } catch (error) {
                                    console.error('Error regenerating profile:', error);
                                    // Still show success even if profile regeneration fails
                                    Alert.alert(
                                        'Assessment Complete!',
                                        `Thank you for completing all ${allAssessments.length} questions.`,
                                        [
                                            {
                                                text: 'OK',
                                                onPress: () => router.replace('/(screens)/(home)/Home')
                                            }
                                        ]
                                    );
                                }
                            }, 1500);
                        }
                    } else {
                        // If we can't get assessments list, just go to home
                        console.warn('Could not fetch assessments list, but submission was successful');
                        Alert.alert(
                            'Question Submitted!',
                            'Your response has been saved.',
                            [
                                {
                                    text: 'OK',
                                    onPress: () => router.replace('/(screens)/(home)/Home')
                                }
                            ]
                        );
                    }
                } catch (error) {
                    console.error('Error checking for more assessments:', error);
                    // Still show success even if we can't check for more
                    Alert.alert(
                        'Question Submitted!',
                        'Your response has been saved.',
                        [
                            {
                                text: 'OK',
                                onPress: () => router.replace('/(screens)/(home)/Home')
                            }
                        ]
                    );
                }
            } else {
                const errorMsg = response?.message || response?.error || 'Failed to submit assessment';
                console.error('❌ Assessment submission failed:', errorMsg);
                Alert.alert('Error', errorMsg);
            }
        } catch (error) {
            console.error('Error submitting assessment:', error);
            Alert.alert('Error', error.message || 'Failed to submit assessment');
        } finally {
            setSubmitting(false);
        }
    };

    const goBack = () => {
        Alert.alert(
            'Exit Assessment',
            'Your progress will be saved. Do you want to exit?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Exit', onPress: () => router.back() }
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text className="mt-4 text-gray-600">Loading question...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !assessment) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 justify-center items-center px-8">
                    <Text className="text-red-500 text-lg text-center mb-4">
                        {error || 'Assessment not found'}
                    </Text>
                    <CustomButton
                        title="Go Back"
                        handlePress={() => router.back()}
                        containerStyles="bg-gray-200 py-3 px-8 rounded-full"
                        textStyles="text-gray-700 font-semibold"
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1">
                <View className="px-8 py-8">
                    {/* Header */}
                    <View className="flex-row items-center mb-6">
                        <TouchableOpacity onPress={goBack} className="pr-2">
                            <ChevronLeft size={24} color="#000" />
                        </TouchableOpacity>
                        <Text className="text-black text-xl font-semibold ml-4">
                            Self Assessment
                        </Text>
                    </View>

                    {/* Question Image */}
                    <View className="items-center justify-center mb-8">
                        <Image
                            source={images.survey1}
                            style={{ width: 250, height: 250 }}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Question */}
                    <Text className="text-black text-2xl font-semibold text-center mb-8">
                        {assessment.question}
                    </Text>

                    {/* Answer Options */}
                    <View className="w-full mb-10">
                        {assessment.answers && assessment.answers.length > 0 ? (
                            assessment.answers.map((answer, index) => {
                                // Get the actual value - backend expects the value field
                                const answerValue = answer.value || answer._id || String(index);
                                const answerLabel = answer.label || answer.text || answer.value || `Option ${index + 1}`;
                                const isCheckbox = assessment?.answerFieldType === 'checkbox';
                                
                                // Check if selected - compare using the actual value field
                                let isSelected = false;
                                if (isCheckbox) {
                                    isSelected = selectedAnswers.some(selected => 
                                        selected === answer.value || 
                                        String(selected) === String(answer.value) ||
                                        selected === answerValue ||
                                        String(selected) === String(answerValue)
                                    );
                                } else {
                                    isSelected = (selectedAnswer === answer.value) || 
                                                (String(selectedAnswer) === String(answer.value)) ||
                                                (selectedAnswer === answerValue) ||
                                                (String(selectedAnswer) === String(answerValue));
                                }
                                
                                // Render checkbox for checkbox questions
                                if (isCheckbox) {
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => handleSelectAnswer(answer.value || answerValue)}
                                            className={`flex-row items-center py-4 mb-3 px-4 border-2 rounded-lg ${
                                                isSelected
                                                    ? 'bg-primary/10 border-primary'
                                                    : 'bg-white border-gray-300'
                                            }`}
                                            disabled={submitting}
                                        >
                                            <View className={`w-6 h-6 border-2 rounded mr-3 items-center justify-center ${
                                                isSelected
                                                    ? 'bg-primary border-primary'
                                                    : 'border-gray-400'
                                            }`}>
                                                {isSelected && (
                                                    <Text className="text-white text-xs font-bold">✓</Text>
                                                )}
                                            </View>
                                            <Text className={`flex-1 text-base ${
                                                isSelected ? 'text-primary font-semibold' : 'text-gray-800'
                                            }`}>
                                                {answerLabel}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                }
                                
                                // Render button for single-select questions
                                return (
                                    <CustomButton
                                        key={index}
                                        title={answerLabel}
                                        handlePress={async () => {
                                            if (submitting) return;
                                            
                                            // For single-select, set answer and submit immediately with the value
                                            const value = answer.value || answerValue;
                                            
                                            // Update state for UI
                                            handleSelectAnswer(value);
                                            
                                            // Submit immediately with the value (don't wait for state update)
                                            await submitAssessment(value);
                                        }}
                                        containerStyles={`py-4 mb-4 border-2 rounded-full ${
                                            isSelected
                                                ? 'bg-primary border-primary'
                                                : 'bg-secondary-100 border-gray-500'
                                        }`}
                                        textStyles={`text-lg font-bold ${
                                            isSelected
                                                ? 'text-white'
                                                : 'text-primary'
                                        }`}
                                        disabled={submitting}
                                    />
                                );
                            })
                        ) : (
                            <Text className="text-center text-gray-600">
                                No answer options available
                            </Text>
                        )}
                    </View>
                    
                    {/* Next/Submit Button for Checkbox Questions */}
                    {assessment?.answerFieldType === 'checkbox' && (
                        <View className="w-full mb-4">
                            <CustomButton
                                title={submitting ? "Submitting..." : "Next"}
                                handlePress={handleNext}
                                containerStyles={`py-4 rounded-full ${
                                    selectedAnswers.length > 0
                                        ? 'bg-primary'
                                        : 'bg-gray-300'
                                }`}
                                textStyles="text-lg font-bold text-white"
                                disabled={submitting || selectedAnswers.length === 0}
                            />
                        </View>
                    )}

                    {/* Submit Button (shown while submitting) */}
                    {submitting && (
                        <View className="items-center py-4">
                            <ActivityIndicator size="large" color="#0000ff" />
                            <Text className="mt-2 text-gray-600">Submitting your response...</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

