import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import CustomButton from '../../../components/CustomButton';
import { router, useLocalSearchParams } from 'expo-router';

const CoursePayment = () => {
  const { courseId, courseTitle, coursePrice } = useLocalSearchParams();
  const price = parseFloat(coursePrice) || 0;

  // Function to go back to the previous screen
  const goBack = () => {
    router.back();
  };

  // Function to proceed to payment method
  const proceedToPayment = () => {
    router.push({
      pathname: '/(payment)/paymentMethod',
      params: {
        courseId: courseId,
        courseTitle: courseTitle,
        coursePrice: coursePrice,
        paymentType: 'course'
      }
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 bg-white px-8 py-4">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity className="pr-2" onPress={goBack}>
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

          {/* Info Text */}
          <View className="mb-6">
            <Text className="text-gray-600 text-sm text-center leading-5">
              By proceeding, you will be enrolled in this course after successful payment.
            </Text>
          </View>

          {/* Continue Button */}
          <View className="w-full">
            <CustomButton
              title="Continue to Payment"
              handlePress={proceedToPayment}
              containerStyles="bg-primary py-4 mb-4 border-2 border-primary"
              textStyles="text-lg font-bold text-white"
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CoursePayment;

