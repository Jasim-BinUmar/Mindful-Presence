import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Clock, CheckCircle, ChevronRight } from 'lucide-react-native';
import api from '../../../services/api';

const QuizView = () => {
  const router = useRouter();
  const { lessonId, blockId, courseId, quizContentId, quizId } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [isMultiQuiz, setIsMultiQuiz] = useState(false);
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

      // Determine if this is a multi-quiz or single-quiz
      let id = quizId || quizContentId || blockId;

      // Try to fetch quiz directly
      try {
        const endpoint = quizId ? `/quizzes/full/${quizId}` : `/quizzes/${id}`;
        const response = await api.quizzes.getQuiz(id);

        const quizData = response.success ? response.data : (response.data || response);

        // Detect if this is a multi-quiz (has questions array)
        const hasMultipleQuestions = Array.isArray(quizData.questions) && quizData.questions.length > 0;
        setIsMultiQuiz(hasMultipleQuestions);

        setQuiz(quizData);

        // Initialize timer if quiz has time limit
        const timeLimit = quizData.timeLimit || quizData.content?.timeLimit;
        if (timeLimit) {
          setTimeRemaining(timeLimit * 60); // Convert minutes to seconds
        }
        setStartTime(Date.now());
        return;
      } catch (quizError) {
        // If quiz fetch fails and we have blockId, try fetching the block first
        if (blockId && (!quizContentId || quizContentId === blockId)) {
          try {
            const blockResponse = await api.courses.getBlock(blockId);
            const blockData = blockResponse.success ? blockResponse.data : (blockResponse.data || blockResponse);

            // Check if this is a multiQuiz block
            if (blockData.type === 'multiQuiz' && blockData.quizId) {
              const quizResponse = await api.quizzes.getQuiz(blockData.quizId);
              const quizData = quizResponse.success ? quizResponse.data : (quizResponse.data || quizResponse);

              setIsMultiQuiz(true);
              setQuiz(quizData);

              const timeLimit = quizData.timeLimit;
              if (timeLimit) {
                setTimeRemaining(timeLimit * 60);
              }
              setStartTime(Date.now());
              return;
            }

            // Extract quiz content ID from block (single quiz)
            let actualQuizContentId = blockData?.quizContentId;

            if (!actualQuizContentId && lessonId) {
              try {
                const lessonBlocksResponse = await api.courses.getBlocksByLesson(lessonId);
                const lessonBlocks = lessonBlocksResponse.success
                  ? lessonBlocksResponse.data
                  : (Array.isArray(lessonBlocksResponse.data) ? lessonBlocksResponse.data : []);

                const foundBlock = Array.isArray(lessonBlocks)
                  ? lessonBlocks.find(b => b._id === blockId || b._id?.toString() === blockId?.toString())
                  : null;

                if (foundBlock?.quizContentId) {
                  actualQuizContentId = foundBlock.quizContentId;
                }
              } catch (lessonError) {
                console.warn('⚠️ Could not get quizContentId from lesson blocks:', lessonError);
              }
            }

            if (!actualQuizContentId) {
              console.warn('⚠️ quizContentId not found anywhere.');
              throw new Error('Quiz content ID not found. Please ensure backend returns quizContentId in block response.');
            }

            if (actualQuizContentId && actualQuizContentId !== blockId) {
              id = actualQuizContentId;

              const quizResponse = await api.quizzes.getQuiz(id);
              const quizData = quizResponse.success ? quizResponse.data : (quizResponse.data || quizResponse);
              setQuiz(quizData);
              setIsMultiQuiz(false);

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

        throw quizError;
      }
    } catch (err) {
      console.error('❌ Error fetching quiz:', err);
      setError(err.message || 'Failed to load quiz. Please check if the quiz exists.');
    } finally {
      setLoading(false);
    }
  }, [quizId, quizContentId, blockId, lessonId]);

  useEffect(() => {
    const id = quizContentId || blockId;
    if (id) {
      fetchQuiz();
    }
  }, [quizContentId, blockId, fetchQuiz]);

  const handleSubmitQuiz = React.useCallback(async () => {
    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000); // in seconds

      // Multi-Quiz submission
      if (isMultiQuiz && quiz.questions) {
        // Validate that all questions have answers
        const unansweredQuestions = quiz.questions.filter((q, idx) => !selectedAnswers[idx]);
        if (unansweredQuestions.length > 0) {
          Alert.alert(
            'Incomplete Quiz',
            `Please answer all questions before submitting. ${unansweredQuestions.length} question(s) remaining.`
          );
          return;
        }

        // Format answers for multi-quiz submission
        const answers = quiz.questions.map((question, idx) => {
          const userAnswer = selectedAnswers[idx];
          const questionType = String(question.questionType || 'singleChoice').toLowerCase();
          const isTextType = questionType.includes('short') || questionType.includes('free');

          return {
            questionId: question._id,
            selectedOptionIds: isTextType ? [] : (Array.isArray(userAnswer) ? userAnswer : [userAnswer]),
            freeTextAnswer: isTextType ? (Array.isArray(userAnswer) ? userAnswer[0] : userAnswer) : ''
          };
        });

        const submissionData = {
          answers,
          courseId,
          lessonId,
          quizBlockId: blockId,
          timeTakenSeconds: timeTaken
        };

        const response = await api.quizzes.submitFullQuiz(quiz._id, submissionData);
        setQuizResults(response.data || response);
        setShowResults(true);
        return;
      }

      // Single-Quiz submission (existing logic)
      const selectedAnswer = selectedAnswers[0];

      if (!selectedAnswer) {
        Alert.alert('No Answer Selected', 'Please select an answer before submitting.');
        return;
      }

      if (isMultipleChoice) {
        const answerArray = Array.isArray(selectedAnswer) ? selectedAnswer : [selectedAnswer];
        if (answerArray.length === 0 || answerArray.every(a => !a)) {
          Alert.alert('No Answer Selected', 'Please select at least one answer for this multiple choice question.');
          return;
        }
      }

      const answerArray = Array.isArray(selectedAnswer) ? selectedAnswer : [selectedAnswer];
      const isTextType = isShortAnswer || isFreeText;

      const submissionData = {
        selectedAnswers: isTextType ? [] : answerArray,
        freeTextAnswer: isTextType ? (Array.isArray(selectedAnswer) ? selectedAnswer[0] : selectedAnswer) : undefined,
        courseId: courseId,
        lessonId: lessonId,
        quizBlockId: blockId,
        timeTakenSeconds: timeTaken,
        hintsUsed: 0
      };

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

      setQuizResults(response.data || response);
      setShowResults(true);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      Alert.alert('Error', err.message || 'Failed to submit quiz');
    }
  }, [quiz, selectedAnswers, startTime, quizContentId, blockId, courseId, lessonId, isMultipleChoice, isMultiQuiz, isShortAnswer, isFreeText]);

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

    setSelectedAnswers(prev => {
      // Use currentQuestionIndex for multi-quiz, 0 for single-quiz
      const questionIndex = isMultiQuiz ? currentQuestionIndex : 0;

      if (isMultipleChoice) {
        // For multiple choice, toggle selection
        const currentArray = Array.isArray(prev[questionIndex]) ? [...prev[questionIndex]] : [];
        const answerIndex = currentArray.indexOf(answerId);

        if (answerIndex > -1) {
          // Remove if already selected
          currentArray.splice(answerIndex, 1);
        } else {
          // Add if not selected
          currentArray.push(answerId);
        }

        return { ...prev, [questionIndex]: currentArray };
      } else {
        // For single choice, replace selection
        return { ...prev, [questionIndex]: answerId };
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
        <StatusBar style="dark" translucent />
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
        <StatusBar style="dark" translucent />
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

  // Determine current question data
  let currentQuestion, questionText, questionType, options, displayOptions;
  let isMultipleChoice, isTrueFalse, isShortAnswer, isFreeText;

  if (isMultiQuiz && quiz.questions) {
    // Multi-Quiz: Get current question from array
    currentQuestion = quiz.questions[currentQuestionIndex];
    questionText = currentQuestion?.question || 'No question available';
    const rawQuestionType = currentQuestion?.questionType || 'singleChoice';
    questionType = String(rawQuestionType).toLowerCase();

    options = Array.isArray(currentQuestion?.options) ? currentQuestion.options : [];

    isMultipleChoice = questionType.includes('multiple');
    isTrueFalse = questionType.includes('true') || questionType === 'tf' || questionType === 'true/false';
    isShortAnswer = questionType.includes('short');
    isFreeText = questionType.includes('free') || questionType.includes('text');

    displayOptions = options;
    if (isTrueFalse && (!options || options.length === 0)) {
      displayOptions = [
        { _id: 'true', text: 'True' },
        { _id: 'false', text: 'False' }
      ];
    }
  } else {
    // Single-Quiz: Use quiz object directly
    questionText = quiz.question || quiz.content?.question || quiz.title || 'No question available';
    const rawQuestionType = quiz.questionType || quiz.content?.questionType || 'singleChoice';
    questionType = String(rawQuestionType).toLowerCase();

    options = [];
    if (Array.isArray(quiz.options)) {
      options = quiz.options;
    } else if (Array.isArray(quiz.content?.options)) {
      options = quiz.content.options;
    } else if (quiz.options && typeof quiz.options === 'object') {
      options = Object.values(quiz.options);
    }

    isMultipleChoice = questionType.includes('multiple');
    isTrueFalse = questionType.includes('true') || questionType === 'tf' || questionType === 'true/false';
    isShortAnswer = questionType.includes('short');
    isFreeText = questionType.includes('free') || questionType.includes('text');

    displayOptions = options;
    if (isTrueFalse && (!options || options.length === 0)) {
      displayOptions = [
        { _id: 'true', text: 'True' },
        { _id: 'false', text: 'False' }
      ];
    }
  }

  if (showResults && quizResults) {
    const score = quizResults.score || quizResults.earnedPoints || quizResults.summary?.score || 0;
    const maxScore = quizResults.maxPoints || quizResults.summary?.maxScore || 1;
    const percentage = quizResults.percentage || quizResults.summary?.percentage || (maxScore > 0 ? Math.round((score / maxScore) * 100) : 0);
    const passed = quizResults.passed || quizResults.isCorrect || quizResults.summary?.isPassed || false;

    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar style="dark" translucent />
        <ScrollView className="flex-1 px-5 py-6">
          {/* Result Card - Slim & Professional */}
          <View className="bg-gray-50 p-6 rounded-[32px] border border-gray-100 mb-8 items-center shadow-sm">
            <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
              <CheckCircle size={40} color="#623AD9" />
            </View>
            <Text className="text-gray-900 font-bold text-2xl mb-1">
              {percentage !== undefined ? `${percentage}%` : 'Submitted!'}
            </Text>
            <Text className="text-gray-400 text-sm font-medium uppercase tracking-widest">
              Your Result
            </Text>
          </View>

          {quizResults.feedback && (
            <View className="bg-white p-5 rounded-2xl border border-gray-100 mb-8 shadow-sm">
              <Text className="text-gray-900 font-bold text-sm mb-2 uppercase tracking-tight">Feedback</Text>
              <Text className="text-gray-600 leading-6 text-sm italic">{quizResults.feedback}</Text>
            </View>
          )}

          <View className="flex-row gap-3 justify-center mt-4">
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.8}
              className="px-6 py-2.5 bg-gray-50 rounded-full items-center min-w-[120px] active:scale-95"
            >
              <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Back</Text>
            </TouchableOpacity>

            {!isShortAnswer && !isFreeText && (
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
                activeOpacity={0.8}
                className="px-6 py-2.5 bg-primary rounded-full items-center min-w-[120px] shadow-sm active:scale-95"
              >
                <Text className="text-white font-bold text-[10px] uppercase tracking-wider">Retake</Text>
              </TouchableOpacity>
            )}
          </View>

          {(isShortAnswer || isFreeText) && (
            <View className="mt-8 items-center">
              <View className="bg-blue-50 px-4 py-2 rounded-full">
                <Text className="text-blue-600 text-[10px] font-bold uppercase">Submitted for review</Text>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" translucent />

      {/* Header */}
      <View className="bg-white border-b border-gray-100 flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
          <ChevronLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-gray-900 font-bold text-lg truncate" numberOfLines={1}>
            {quiz.title || 'Knowledge Check'}
          </Text>
          {isMultiQuiz && quiz.questions && (
            <Text className="text-gray-500 text-xs mt-0.5">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </Text>
          )}
        </View>
        {timeRemaining !== null && (
          <View className={`px-3 py-1.5 rounded-lg flex-row items-center ${timeRemaining < 60 ? 'bg-red-50' : 'bg-primary/5'}`}>
            <Clock size={14} color={timeRemaining < 60 ? '#EF4444' : '#623AD9'} />
            <Text className={`font-bold ml-2 ${timeRemaining < 60 ? 'text-red-500' : 'text-primary'}`}>
              {formatTime(timeRemaining)}
            </Text>
          </View>
        )}
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

        {/* Answer Input Section */}
        {isShortAnswer || isFreeText ? (
          <View className="mb-6">
            <TextInput
              className={`p-4 rounded-lg border-2 border-gray-200 bg-white text-gray-800 text-base ${isFreeText ? 'min-h-[150px]' : 'min-h-[60px]'}`}
              placeholder={isFreeText ? "Write your detailed answer here..." : "Type your answer here..."}
              multiline={isFreeText}
              numberOfLines={isFreeText ? 6 : 1}
              value={selectedAnswers[isMultiQuiz ? currentQuestionIndex : 0] || ''}
              onChangeText={(text) => handleAnswerSelect(text, false)}
              textAlignVertical="top"
            />
          </View>
        ) : displayOptions.length > 0 ? (
          <View className="space-y-3">
            {displayOptions.map((option, index) => {
              const optionId = option._id || option.id || index;
              const questionIndex = isMultiQuiz ? currentQuestionIndex : 0;
              const isSelected = isMultipleChoice
                ? (selectedAnswers[questionIndex] || []).includes(optionId)
                : selectedAnswers[questionIndex] === optionId;

              return (
                <TouchableOpacity
                  key={optionId}
                  onPress={() => handleAnswerSelect(optionId, isMultipleChoice)}
                  className={`p-5 rounded-2xl border-2 mb-4 ${isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-100 bg-white'
                    } shadow-sm`}
                >
                  <View className="flex-row items-center">
                    <View className={`w-5 h-5 rounded-full border-2 mr-4 items-center justify-center ${isSelected ? 'border-primary bg-primary' : 'border-gray-200'}`}>
                      {isSelected && (
                        <View className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </View>
                    <Text className={`flex-1 text-sm ${isSelected ? 'text-gray-900 font-bold' : 'text-gray-600 font-medium'}`}>
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
          const questionIndex = isMultiQuiz ? currentQuestionIndex : 0;
          const answer = selectedAnswers[questionIndex];
          const hasAnswer = answer !== undefined && answer !== null && (typeof answer === 'string' ? answer.trim().length > 0 : true);
          let isValid = false;

          if (hasAnswer) {
            if (isMultipleChoice) {
              const answerArray = Array.isArray(answer) ? answer : [answer];
              isValid = answerArray.length > 0 && !answerArray.every(a => !a);
            } else {
              isValid = true;
            }
          }

          // Multi-Quiz: Show Next/Previous/Submit
          if (isMultiQuiz && quiz.questions) {
            const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
            const isFirstQuestion = currentQuestionIndex === 0;

            return (
              <View className="space-y-3">
                {/* Progress Indicator */}
                <View className="flex-row items-center justify-center mb-2">
                  {quiz.questions.map((_, idx) => (
                    <View
                      key={idx}
                      className={`h-1.5 flex-1 mx-0.5 rounded-full ${idx < currentQuestionIndex
                        ? 'bg-green-500'
                        : idx === currentQuestionIndex
                          ? 'bg-primary'
                          : 'bg-gray-200'
                        }`}
                    />
                  ))}
                </View>

                {/* Navigation Buttons */}
                <View className="flex-row gap-3">
                  {!isFirstQuestion && (
                    <TouchableOpacity
                      onPress={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                      activeOpacity={0.8}
                      className="flex-1 py-3.5 rounded-full items-center bg-gray-100 active:scale-[0.98]"
                    >
                      <Text className="text-gray-600 text-sm font-black uppercase tracking-widest">
                        Previous
                      </Text>
                    </TouchableOpacity>
                  )}

                  {!isLastQuestion ? (
                    <TouchableOpacity
                      onPress={() => setCurrentQuestionIndex(prev => Math.min(quiz.questions.length - 1, prev + 1))}
                      activeOpacity={0.8}
                      className={`flex-1 py-3.5 rounded-full items-center shadow-lg active:scale-[0.98] ${isValid ? 'bg-primary shadow-primary/20' : 'bg-gray-100'
                        }`}
                    >
                      <View className="flex-row items-center">
                        <Text className={`text-sm font-black uppercase tracking-widest ${isValid ? 'text-white' : 'text-gray-300'}`}>
                          Next
                        </Text>
                        <ChevronRight size={16} color={isValid ? '#FFFFFF' : '#D1D5DB'} style={{ marginLeft: 4 }} />
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={handleSubmitQuiz}
                      disabled={!isValid}
                      activeOpacity={0.8}
                      className={`flex-1 py-3.5 rounded-full items-center shadow-lg active:scale-[0.98] ${isValid ? 'bg-green-600 shadow-green-600/20' : 'bg-gray-100'
                        }`}
                    >
                      <Text className={`text-sm font-black uppercase tracking-widest ${isValid ? 'text-white' : 'text-gray-300'}`}>
                        Submit Quiz
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }

          // Single-Quiz: Show Submit only
          return (
            <TouchableOpacity
              onPress={handleSubmitQuiz}
              disabled={!isValid}
              activeOpacity={0.8}
              className={`py-3.5 rounded-full items-center shadow-lg active:scale-[0.98] ${isValid ? 'bg-primary shadow-primary/20' : 'bg-gray-100'}`}
            >
              <Text className={`text-sm font-black uppercase tracking-widest ${isValid ? 'text-white' : 'text-gray-300'}`}>
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

