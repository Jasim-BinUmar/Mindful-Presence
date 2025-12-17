import { View, Text, StatusBar, ActivityIndicator, TouchableOpacity, ScrollView, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../../services/api';

const QuizView = () => {
  const router = useRouter();
  const { lessonId, blockId, courseId, quizContentId } = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [startTime, setStartTime] = useState(null);

  const fetchQuiz = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let id = quizContentId || blockId;
      console.log('🔍 Fetching quiz with ID:', id);
      console.log('Available params:', { quizContentId, blockId, lessonId, courseId });
      
      // Try to fetch quiz directly
      try {
        const response = await api.quizzes.getQuiz(id);
        console.log('✅ Quiz fetched successfully:', response);
        console.log('📋 Full quiz response:', JSON.stringify(response, null, 2));
        
        const quizData = response.success ? response.data : (response.data || response);
        console.log('📋 Quiz data structure:', {
          hasQuestion: !!quizData.question,
          hasContent: !!quizData.content,
          hasOptions: !!quizData.options,
          questionType: quizData.questionType,
          allKeys: Object.keys(quizData),
          fullData: JSON.stringify(quizData, null, 2)
        });
        
        setQuiz(quizData);
        
        // Initialize timer if quiz has time limit
        const timeLimit = quizData.timeLimit || quizData.content?.timeLimit;
        if (timeLimit) {
          setTimeRemaining(timeLimit * 60); // Convert minutes to seconds
        }
        setStartTime(Date.now());
        return;
      } catch (quizError) {
        console.log('⚠️ Direct quiz fetch failed, trying to fetch block first...', quizError);
        
        // If quiz fetch fails and we have blockId, try fetching the block first
        // Also try if quizContentId equals blockId (fallback case)
        if (blockId && (!quizContentId || quizContentId === blockId)) {
          try {
            console.log('📦 Fetching block to get quiz content ID:', blockId);
            const blockResponse = await api.courses.getBlock(blockId);
            const blockData = blockResponse.success ? blockResponse.data : (blockResponse.data || blockResponse);
            
            console.log('📦 Block data:', blockData);
            
            // Extract quiz content ID from block
            // For quiz blocks, quizContentId is stored at block level (block.quizContentId)
            // It references the QuizContent model _id
            console.log('📦 Block structure for quiz extraction:', {
              blockId,
              blockQuizContentId: blockData?.quizContentId,  // This is the key field!
              blockId_field: blockData?._id,
              allKeys: blockData ? Object.keys(blockData) : 'no data',
              fullBlock: JSON.stringify(blockData, null, 2)
            });
            
            // quizContentId is at block level, not in content
            // But backend transformation might not include it, so try alternative methods
            let actualQuizContentId = blockData?.quizContentId;  // Primary: block.quizContentId
            
            // If quizContentId is not in response, try to get it from lesson blocks
            // The backend might return it when fetching blocks by lesson
            if (!actualQuizContentId && lessonId) {
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
                  actualQuizContentId = foundBlock.quizContentId;
                  console.log('✅ Found quizContentId from lesson blocks:', actualQuizContentId);
                }
              } catch (lessonError) {
                console.warn('⚠️ Could not get quizContentId from lesson blocks:', lessonError);
              }
            }
            
            // Final fallback: try to derive from block ID pattern (not reliable, but last resort)
            if (!actualQuizContentId) {
              console.warn('⚠️ quizContentId not found anywhere. Backend should include quizContentId in block response.');
              // Don't use blockId as fallback since it's different from quizContentId
              throw new Error('Quiz content ID not found. Please ensure backend returns quizContentId in block response.');
            }
            
            if (actualQuizContentId && actualQuizContentId !== blockId) {
              console.log('✅ Using quiz content ID:', actualQuizContentId);
              id = actualQuizContentId;
              
              // Try fetching quiz again with the correct ID
              const quizResponse = await api.quizzes.getQuiz(id);
              console.log('✅ Quiz fetched with correct ID:', quizResponse);
              console.log('📋 Quiz data structure:', JSON.stringify(quizResponse, null, 2));
              
              const quizData = quizResponse.success ? quizResponse.data : (quizResponse.data || quizResponse);
              setQuiz(quizData);
              
              const timeLimit = quizData.timeLimit || quizData.content?.timeLimit;
              if (timeLimit) {
                setTimeRemaining(timeLimit * 60);
              }
              setStartTime(Date.now());
              return;
            }
          } catch (blockError) {
            console.error('❌ Block fetch also failed:', blockError);
          }
        }
        
        // If all else fails, throw the original error
        throw quizError;
      }
    } catch (err) {
      console.error('❌ Error fetching quiz:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.status,
        statusCode: err.statusCode,
        url: err.url
      });
      setError(err.message || 'Failed to load quiz. Please check if the quiz exists.');
    } finally {
      setLoading(false);
    }
  }, [quizContentId, blockId]);

  useEffect(() => {
    const id = quizContentId || blockId;
    if (id) {
      fetchQuiz();
    }
  }, [quizContentId, blockId, fetchQuiz]);

  const handleSubmitQuiz = React.useCallback(async () => {
    try {
      // Quiz is a single question, not an array
      const timeTaken = Math.floor((Date.now() - startTime) / 1000); // in seconds
      
      // Get the selected answer(s)
      const selectedAnswer = selectedAnswers[0]; // Single question, so index 0
      
      // Validate that an answer is selected
      if (!selectedAnswer) {
        Alert.alert('No Answer Selected', 'Please select an answer before submitting.');
        return;
      }
      
      // For multiple choice, ensure at least one option is selected
      if (isMultipleChoice) {
        const answerArray = Array.isArray(selectedAnswer) ? selectedAnswer : [selectedAnswer];
        if (answerArray.length === 0 || answerArray.every(a => !a)) {
          Alert.alert('No Answer Selected', 'Please select at least one answer for this multiple choice question.');
          return;
        }
      }
      
      // Prepare answer for submission
      // Backend requires: selectedAnswers, courseId, lessonId, quizBlockId, timeTakenSeconds
      const answerArray = Array.isArray(selectedAnswer) ? selectedAnswer : [selectedAnswer];
      
      const submissionData = {
        selectedAnswers: answerArray,
        courseId: courseId,           // Required by backend
        lessonId: lessonId,           // Required by backend
        quizBlockId: blockId,         // Required by backend (the block _id)
        timeTakenSeconds: timeTaken,  // Backend expects timeTakenSeconds, not timeTaken
        hintsUsed: 0                  // Optional, default to 0
      };

      console.log('Submitting quiz:', { 
        submissionData, 
        quizQuestionType: quiz?.questionType,
        selectedAnswer,
        isMultipleChoice,
        answerArray,
        params: { quizContentId, blockId, lessonId, courseId }
      });
      
      const id = quizContentId || blockId;
      if (!id) {
        Alert.alert('Error', 'Quiz content ID is missing. Cannot submit quiz.');
        return;
      }
      
      if (!courseId || !lessonId || !blockId) {
        Alert.alert('Error', 'Missing required context (courseId, lessonId, or blockId). Cannot submit quiz.');
        console.error('Missing required fields:', { courseId, lessonId, blockId });
        return;
      }
      
      const response = await api.quizzes.submitQuizAttempt(id, submissionData);

      console.log('Quiz results:', response);
      setQuizResults(response.data || response);
      setShowResults(true);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      Alert.alert('Error', err.message || 'Failed to submit quiz');
    }
  }, [quiz, selectedAnswers, startTime, quizContentId, blockId, courseId, lessonId, isMultipleChoice]);

  useEffect(() => {
    // Timer for timed quizzes - auto-submit when time runs out
    const timeLimit = quiz?.timeLimit || quiz?.content?.timeLimit;
    if (timeLimit && timeRemaining !== null && timeRemaining > 0 && !showResults) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // Auto-submit when time runs out
            setTimeout(() => handleSubmitQuiz(), 100);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [quiz, timeRemaining, showResults, handleSubmitQuiz]);

  const handleAnswerSelect = (answerId, isMultipleChoice = false) => {
    if (showResults) return;

    console.log('🎯 Answer selected:', { answerId, isMultipleChoice, currentAnswers: selectedAnswers });

    setSelectedAnswers(prev => {
      // Quiz is a single question, so we use index 0
      if (isMultipleChoice) {
        // For multiple choice, toggle selection
        const currentArray = Array.isArray(prev[0]) ? [...prev[0]] : [];
        const answerIndex = currentArray.indexOf(answerId);
        
        if (answerIndex > -1) {
          // Remove if already selected
          currentArray.splice(answerIndex, 1);
        } else {
          // Add if not selected
          currentArray.push(answerId);
        }
        
        console.log('✅ Updated multiple choice answers:', currentArray);
        return { 0: currentArray };
      } else {
        // For single choice, replace selection
        console.log('✅ Updated single choice answer:', answerId);
        return { 0: answerId };
      }
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar backgroundColor="#161622" style="light" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#623AD9" />
          <Text className="text-gray-600 mt-4">Loading quiz...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !quiz) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar backgroundColor="#161622" style="light" />
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-red-500 text-lg font-semibold mb-2">Error</Text>
          <Text className="text-gray-600 text-center mb-4">{error || 'Quiz not found'}</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-primary px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Quiz is a single question, not an array
  // Structure: quiz.question (text), quiz.questionType, quiz.options (array)
  // Backend should populate options via virtual field
  const questionText = quiz.question || quiz.content?.question || quiz.title || 'No question available';
  const questionType = quiz.questionType || quiz.content?.questionType || 'singleChoice';
  
  // Options can be at quiz.options (virtual field) or quiz.content.options
  // Also check if options is an array or needs to be extracted
  let options = [];
  if (Array.isArray(quiz.options)) {
    options = quiz.options;
  } else if (Array.isArray(quiz.content?.options)) {
    options = quiz.content.options;
  } else if (quiz.options && typeof quiz.options === 'object') {
    // If options is an object, try to convert to array
    options = Object.values(quiz.options);
  }
  
  console.log('📋 Quiz display data:', {
    questionText,
    questionType,
    optionsCount: options.length,
    optionsStructure: options.length > 0 ? Object.keys(options[0]) : 'no options',
    firstOption: options[0] || 'none'
  });
  
  const isMultipleChoice = questionType === 'multipleChoice' || questionType === 'multiple_choice';

  if (showResults && quizResults) {
    const score = quizResults.score || quizResults.earnedPoints || 0;
    const maxScore = quizResults.maxPoints || 1;
    const percentage = quizResults.percentage || (maxScore > 0 ? Math.round((score / maxScore) * 100) : 0);
    const passed = quizResults.passed || quizResults.isCorrect || false;

    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar backgroundColor="#161622" style="light" />
        <ScrollView className="flex-1 px-5 py-6">
          <View className="items-center mb-6">
            <View className={`w-32 h-32 rounded-full items-center justify-center mb-4 ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
              <Text className="text-5xl">{passed ? '✓' : '✗'}</Text>
            </View>
            <Text className={`text-2xl font-bold mb-2 ${passed ? 'text-green-600' : 'text-red-600'}`}>
              {passed ? 'Quiz Passed!' : 'Quiz Failed'}
            </Text>
            <Text className="text-gray-600 text-lg">
              You scored {score} out of {maxScore}
            </Text>
            <Text className="text-gray-500 text-base">
              {percentage.toFixed(1)}%
            </Text>
          </View>

          {quizResults.feedback && (
            <View className="bg-gray-50 p-4 rounded-lg mb-4">
              <Text className="text-gray-800 font-semibold mb-2">Feedback:</Text>
              <Text className="text-gray-700">{quizResults.feedback}</Text>
            </View>
          )}

          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-1 bg-gray-200 py-4 rounded-lg items-center"
            >
              <Text className="text-gray-800 font-semibold">Back to Course</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => {
                setShowResults(false);
                setSelectedAnswers({});
                setQuizResults(null);
                setStartTime(Date.now());
                const timeLimit = quiz?.timeLimit || quiz?.content?.timeLimit;
                if (timeLimit) {
                  setTimeRemaining(timeLimit * 60);
                }
              }}
              className="flex-1 bg-primary py-4 rounded-lg items-center"
            >
              <Text className="text-white font-semibold">Retake Quiz</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar backgroundColor="#161622" style="light" />
      
      {/* Header */}
      <View className="bg-primary p-5">
        <View className="flex-row justify-between items-center mb-2">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-white font-semibold">← Back</Text>
          </TouchableOpacity>
          {timeRemaining !== null && (
            <View className={`px-3 py-1 rounded-full ${timeRemaining < 60 ? 'bg-red-500' : 'bg-white/20'}`}>
              <Text className="text-white font-bold">
                ⏱️ {formatTime(timeRemaining)}
              </Text>
            </View>
          )}
        </View>
        <Text className="text-white font-bold text-xl">
          {quiz.title || quiz.question || 'Quiz'}
        </Text>
        <Text className="text-white/80 text-sm mt-1">
          {options.length > 0 ? `${options.length} Options` : 'Quiz Question'}
        </Text>
      </View>

      <ScrollView className="flex-1 px-5 py-6">
        {/* Question */}
        <View className="mb-6">
          <Text className="text-gray-800 font-bold text-lg mb-4">
            {questionText}
          </Text>
          
          {quiz.description && (
            <Text className="text-gray-600 text-base mb-4">
              {quiz.description}
            </Text>
          )}

          {isMultipleChoice && (
            <Text className="text-gray-500 text-sm mb-4">
              (Select all that apply)
            </Text>
          )}
        </View>

        {/* Answer Options */}
        {options.length > 0 ? (
          <View className="space-y-3">
            {options.map((option, index) => {
              const optionId = option._id || option.id || index;
              const isSelected = isMultipleChoice
                ? (selectedAnswers[0] || []).includes(optionId)
                : selectedAnswers[0] === optionId;

              return (
                <TouchableOpacity
                  key={optionId}
                  onPress={() => handleAnswerSelect(optionId, isMultipleChoice)}
                  className={`p-4 rounded-lg border-2 ${
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <View className="flex-row items-center">
                    <View className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${
                      isSelected ? 'border-primary bg-primary' : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <Text className="text-white font-bold text-xs">✓</Text>
                      )}
                    </View>
                    <Text className={`flex-1 text-base ${isSelected ? 'text-primary font-semibold' : 'text-gray-800'}`}>
                      {option.text || option.label || option.value || `Option ${index + 1}`}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View className="items-center py-8">
            <Text className="text-gray-500 text-center mb-2">
              No options available for this question.
            </Text>
            <Text className="text-gray-400 text-sm mb-4">
              Please check if quiz options are configured in the backend.
            </Text>
            <Text className="text-gray-300 text-xs text-center">
              Quiz ID: {quizContentId || blockId || 'unknown'}
            </Text>
            <Text className="text-gray-300 text-xs text-center mt-2">
              Question Type: {questionType}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Navigation Buttons */}
      <View className="p-5 border-t border-gray-200">
        {(() => {
          const answer = selectedAnswers[0];
          const hasAnswer = answer !== undefined && answer !== null;
          let isValid = false;
          
          if (hasAnswer) {
            if (isMultipleChoice) {
              const answerArray = Array.isArray(answer) ? answer : [answer];
              isValid = answerArray.length > 0 && !answerArray.every(a => !a);
            } else {
              isValid = true; // Single choice has a value
            }
          }
          
          return (
            <TouchableOpacity
              onPress={handleSubmitQuiz}
              disabled={!isValid}
              className={`py-4 rounded-lg items-center ${
                isValid ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <Text className={`font-bold ${
                isValid ? 'text-white' : 'text-gray-500'
              }`}>
                Submit Quiz
              </Text>
            </TouchableOpacity>
          );
        })()}
      </View>
    </SafeAreaView>
  );
};

export default QuizView;

