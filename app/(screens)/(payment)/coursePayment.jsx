import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, CreditCard, CheckCircle } from 'lucide-react-native';
import CustomButton from '../../../components/CustomButton';
import { router, useLocalSearchParams } from 'expo-router';
import { useStripe } from '@stripe/stripe-react-native';
import { api } from '../../../services/api';

const CoursePayment = () => {
  const { courseId, courseTitle, coursePrice } = useLocalSearchParams();
  const price = parseFloat(coursePrice) || 0;
  const [loading, setLoading] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;
    api.courses.getCourseWithEnrollment(courseId).then((res) => {
      if (cancelled) return;
      const data = res?.success ? res.data : (res?.data || res);
      const enrolled = !!(data?.isEnrolled === true || data?.enrollment?.status === 'active' || (data?.enrollment && data?.enrollment._id));
      if (enrolled) {
        router.replace({ pathname: '/(courseView)/CourseDetails', params: { courseId } });
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [courseId]);

  // Function to go back to the previous screen
  const goBack = () => {
    router.back();
  };

  // Initialize and present Stripe Payment Sheet
  const handlePayment = async () => {
    try {
      setLoading(true);

      const response = await api.payments.createPaymentIntent({
        courseId,
      });

      if (!response.success || !response.data?.clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      if (response.data?.isPaid === true || response.data?.isEnrolled === true) {
        router.replace({ pathname: '/(courseView)/CourseDetails', params: { courseId } });
        setLoading(false);
        return;
      }

      const { clientSecret, paymentIntentId, customerEphemeralKeySecret, customerId } = response.data;

      const sheetParams = {
        merchantDisplayName: 'Mindful Presence',
        paymentIntentClientSecret: clientSecret,
        defaultBillingDetails: { name: 'User' },
        returnURL: 'mindfulpresence://payment-success',
      };
      if (customerId) sheetParams.customerId = customerId;
      if (customerEphemeralKeySecret) sheetParams.customerEphemeralKeySecret = customerEphemeralKeySecret;

      const { error: initError } = await initPaymentSheet(sheetParams);

      if (initError) {
        console.error('Payment sheet init error:', initError);
        Alert.alert('Error', initError.message);
        setLoading(false);
        return;
      }

      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        // Check if user canceled the payment
        const isCanceled = 
          presentError.code === 'Canceled' || 
          presentError.code === 'canceled' ||
          presentError.type === 'canceled' ||
          presentError.message?.toLowerCase().includes('cancel') ||
          presentError.localizedMessage?.toLowerCase().includes('cancel');
        
        if (isCanceled) {
          // User canceled - silently handle, no error shown
          setLoading(false);
          return;
        }
        
        // Real error - show alert
        console.error('❌ Payment sheet error:', presentError);
        Alert.alert(
          'Payment Error',
          presentError.message || presentError.localizedMessage || 'An error occurred during payment. Please try again.'
        );
        setLoading(false);
        return;
      }

      // Payment successful - confirm on backend
      const confirmResponse = await api.payments.confirmPayment({
        paymentIntentId,
      });

      if (confirmResponse.success) {
        Alert.alert(
          'Success!',
          'Payment successful! You are now enrolled in the course.',
          [
            {
              text: 'View Payment History',
              onPress: () => {
                router.replace({
                  pathname: '/(payment)/Payment',
                });
              },
            },
            {
              text: 'Start Learning',
              onPress: () => {
                router.replace({
                  pathname: '/(courseView)/CourseDetails',
                  params: { courseId },
                });
              },
            },
          ]
        );
      }
    } catch (error) {
      // Check if error is related to cancellation
      const isCancelError = 
        error.message?.toLowerCase().includes('cancel') ||
        error.code === 'Canceled' ||
        error.code === 'canceled';
      
      if (isCancelError) {
        // User canceled - silently handle
      } else {
        // Real error - show alert
        console.error('❌ Payment error:', error);
        Alert.alert(
          'Payment Failed',
          error.message || 'An error occurred during payment. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDevBypass = async () => {
    if (!__DEV__) return;
    try {
      setLoading(true);
      // Simulate successful enrollment
      const response = await api.courses.enrollInCourse(courseId);
      if (response.success) {
        Alert.alert('Dev Success', 'Enrolled successfully (Bypass)', [
          { text: 'OK', onPress: () => router.replace({ pathname: '/(courseView)/CourseDetails', params: { courseId } }) }
        ]);
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 bg-white px-8 py-4">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity className="pr-2" onPress={goBack} disabled={loading}>
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-black text-2xl font-semibold ml-4">
            Course Enrollment
          </Text>
        </View>

        <View className="flex-1 justify-center">
          {/* Course Info Card */}
          <View className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
            <Text className="text-lg font-semibold text-gray-700 mb-4">
              Course Details
            </Text>

            <View className="mb-4">
              <Text className="text-gray-500 text-sm mb-1">Course Name</Text>
              <Text className="text-gray-800 font-semibold text-base">
                {courseTitle || 'Course'}
              </Text>
            </View>

            <View className="border-t border-gray-300 my-4" />

            <View className="mb-2">
              <Text className="text-gray-500 text-sm mb-1">Course Price</Text>
              <Text className="text-primary text-3xl font-bold">
                ${price.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Payment Summary */}
          <View className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
            <Text className="text-lg font-semibold text-gray-700 mb-4">
              Payment Summary
            </Text>

            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-500">Subtotal</Text>
              <Text className="text-gray-800 font-medium">${price.toFixed(2)}</Text>
            </View>
            <View className="border-t border-gray-300 my-2" />

            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-500">Tax</Text>
              <Text className="text-gray-800 font-medium">$0.00</Text>
            </View>
            <View className="border-t border-gray-300 my-2" />

            <View className="flex-row justify-between">
              <Text className="text-gray-700 font-semibold">Total</Text>
              <Text className="text-gray-800 font-semibold text-lg">
                ${price.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Secure Payment Badge */}
          <View className="flex-row items-center justify-center mb-6">
            <CheckCircle size={16} color="#22C55E" />
            <Text className="text-gray-600 text-sm ml-2">
              Secure payment powered by Stripe
            </Text>
          </View>

          {/* Info Text */}
          <View className="mb-6">
            <Text className="text-gray-600 text-sm text-center leading-5">
              By proceeding, you will be enrolled in this course after successful payment.
            </Text>
          </View>

          {/* Continue Button */}
          <View className="w-full">
            <CustomButton
              title={loading ? 'Processing...' : 'Continue to Payment'}
              handlePress={handlePayment}
              containerStyles={`bg-primary py-4 mb-4 border-2 border-primary ${loading ? 'opacity-50' : ''}`}
              textStyles="text-lg font-bold text-white"
              disabled={loading}
            />
            {loading && (
              <ActivityIndicator size="small" color="#623AD9" style={{ marginTop: 10 }} />
            )}
            {__DEV__ && (
              <TouchableOpacity onPress={handleDevBypass} className="mt-4 py-2">
                <Text className="text-gray-400 text-center text-xs">Dev: Simulate Payment</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CoursePayment;
