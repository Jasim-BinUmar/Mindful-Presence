import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Check, ChevronLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../../../constants';
import { router, useLocalSearchParams } from 'expo-router';
import api from '../../../services/api';

export default function successfulPayment() {
    const params = useLocalSearchParams();
    const { courseId, courseTitle, coursePrice, paymentType } = params;
    const [enrolling, setEnrolling] = useState(false);
    const [enrolled, setEnrolled] = useState(false);

    useEffect(() => {
        // If this is a course payment, enroll the user
        if (paymentType === 'course' && courseId && !enrolled && !enrolling) {
            enrollInCourse();
        }
    }, [paymentType, courseId]);

    const enrollInCourse = async () => {
        if (!courseId) return;
        
        try {
            setEnrolling(true);
            await api.courses.enrollInCourse(courseId);
            setEnrolled(true);
        } catch (err) {
            console.error('Error enrolling in course:', err);
            // If user is already enrolled (409 Conflict), that's fine
            if (err.status === 409 || err.statusCode === 409 || err.message?.toLowerCase().includes('already enrolled')) {
                setEnrolled(true);
            } else {
                Alert.alert(
                    'Enrollment Error',
                    'Payment was successful but there was an issue enrolling you in the course. Please contact support.',
                    [{ text: 'OK' }]
                );
            }
        } finally {
            setEnrolling(false);
        }
    };

    const handleContinue = () => {
        if (paymentType === 'course' && courseId) {
            // Navigate back to course details
            router.replace({
                pathname: '/(courseView)/CourseDetails',
                params: { courseId }
            });
        } else {
            // Default navigation for other payment types
            router.push('/(screens)/(home)/Home');
        }
    };

    const handleViewPaymentHistory = () => {
        router.replace({
            pathname: '/(payment)/Payment',
        });
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
          <View className="flex-1 px-8 items-center justify-center">
            {/* Success Icon */}
            <View className="items-center justify-center ">
                <Image
                    source={images.successIcon}
                    style={{ width: 150, height: 150 }}
                    resizeMode="contain"
                />
            </View>

            {/* Congratulations Text */}
            <Text className="text-primary text-3xl font-semibold mb-12 mt-12">
                Congratulations
            </Text>

            {/* Description */}
            <Text className="text-center text-gray-800 text-lg mb-6 leading-7">
                Your Payment has been Completed Successfully
            </Text>

            {paymentType === 'course' && (
                <View className="mb-4">
                    {enrolling ? (
                        <View className="items-center mb-4">
                            <ActivityIndicator size="small" color="#623AD9" />
                            <Text className="text-gray-600 text-sm mt-2">
                                Enrolling you in the course...
                            </Text>
                        </View>
                    ) : enrolled ? (
                        <View className="bg-green-100 px-4 py-2 rounded-lg mb-4">
                            <Text className="text-green-800 text-center text-sm font-semibold">
                                ✓ Successfully enrolled in {courseTitle || 'the course'}
                            </Text>
                        </View>
                    ) : null}
                </View>
            )}

            {/* View Payment History Button */}
            <TouchableOpacity
                onPress={handleViewPaymentHistory}
                className="w-full bg-primary rounded-full py-4 px-6 mb-4"
                disabled={enrolling}
            >
                <Text className="text-white text-center text-xl font-semibold">
                    View Payment History
                </Text>
            </TouchableOpacity>

            {/* Continue Button */}
            <TouchableOpacity
                onPress={handleContinue}
                className="w-full bg-gray-200 rounded-full py-4 px-6"
                disabled={enrolling}
            >
                <Text className="text-gray-800 text-center text-xl font-semibold">
                    {paymentType === 'course' ? 'Go to Course' : 'Continue'}
                </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
    );
}