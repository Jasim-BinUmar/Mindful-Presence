import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Pressable, Alert, ActivityIndicator } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import StandardHeader from '../../components/StandardHeader';
import { router, useLocalSearchParams } from 'expo-router';
import { api } from '../../services/api';
import { useGlobalContext } from '../../lib/globalContext';

export default function OTPScreen() {
  const { email, registrationData } = useLocalSearchParams();
  const { login } = useGlobalContext();
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6 digits
  const [activeInput, setActiveInput] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleNumberPress = (num) => {
    if (activeInput < 6) {
      const newOtp = [...otp];
      newOtp[activeInput] = num;
      setOtp(newOtp);
      setActiveInput(prev => Math.min(prev + 1, 5));
    }
  };

  const handleBackspace = () => {
    const newOtp = [...otp];
    if (newOtp[activeInput] !== '') {
      newOtp[activeInput] = '';
    } else if (activeInput > 0) {
      newOtp[activeInput - 1] = '';
      setActiveInput(prev => Math.max(prev - 1, 0));
    }
    setOtp(newOtp);
  };

  const handleVerify = async () => {
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit OTP');
      return;
    }

    if (!email) {
      Alert.alert('Error', 'Email not found. Please try registering again.');
      router.back();
      return;
    }

    setIsVerifying(true);

    try {
      const response = await api.auth.registerVerifyOtp({
        email: email,
        otp: otpString
      });

      if (response.success) {
        // Auto-login after successful verification
        if (response.accessToken) {
          // User is already logged in via token storage
          // Navigate to success screen, then auto-navigate to home
          router.replace({
            pathname: '/(auth)/successfulReg',
            params: { autoLogin: 'true' }
          });
        } else {
          Alert.alert('Success', 'Registration successful!', [
            {
              text: 'OK',
              onPress: () => router.replace('/(screens)/(home)/Home')
            }
          ]);
        }
      } else {
        Alert.alert('Verification Failed', response.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      let errorMessage = error.message || 'Failed to verify OTP';
      if (error.data?.message) {
        errorMessage = error.data.message;
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      Alert.alert('Error', 'Email not found');
      return;
    }

    setIsResending(true);

    try {
      const response = await api.auth.registerResendOtp({ email });

      if (response.success) {
        Alert.alert('Success', 'OTP has been resent to your email');
        // Reset OTP input
        setOtp(['', '', '', '', '', '']);
        setActiveInput(0);
      } else {
        Alert.alert('Error', response.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      let errorMessage = error.message || 'Failed to resend OTP';
      if (error.data?.message) {
        errorMessage = error.data.message;
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StandardHeader title="OTP Verification" centeredTitle={true} />
      <View className="flex-1 px-4 pt-8">

        {/* Instructions */}
        <Text className="text-center text-lg mb-8 px-4">
          Enter 6 digit otp that we just send in your email
        </Text>

        {/* OTP Input Boxes */}
        <View className="flex-row justify-center mb-8 px-4" style={{ gap: 12 }}>
          {otp.map((digit, index) => (
            <Pressable
              key={index}
              onPress={() => setActiveInput(index)}
              className={`w-14 h-14 items-center justify-center rounded-2xl ${index === activeInput
                ? 'bg-purple-50 border-2 border-primary'
                : 'bg-gray-50 border border-gray-200'
                }`}
            >
              <Text className="text-2xl font-semibold">{digit}</Text>
            </Pressable>
          ))}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          onPress={handleVerify}
          disabled={isVerifying || otp.join('').length !== 6}
          className={`bg-primary rounded-full py-4 mb-4 ${(isVerifying || otp.join('').length !== 6) ? 'opacity-50' : ''}`}
        >
          {isVerifying ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white text-center text-lg font-semibold">
              Verify
            </Text>
          )}
        </TouchableOpacity>

        {/* Resend Code */}
        <TouchableOpacity
          onPress={handleResendCode}
          disabled={isResending}
          className={isResending ? 'opacity-50' : ''}
        >
          {isResending ? (
            <View className="flex-row items-center justify-center">
              <ActivityIndicator size="small" color="#623AD9" />
              <Text className="text-primary text-center text-base ml-2">
                Resending...
              </Text>
            </View>
          ) : (
            <Text className="text-primary text-center text-base">
              Resend Code
            </Text>
          )}
        </TouchableOpacity>

        {/* Number Pad */}
        <View className="absolute bottom-8 left-4 right-4">
          <View className="flex-row flex-wrap justify-between w-full bg-gray-300 pt-3 rounded-lg px-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0].map((num) => (
              <TouchableOpacity
                key={num}
                onPress={() => handleNumberPress(num.toString())}
                className="w-[30%] h-14 mb-4 items-center justify-center bg-white rounded-xl"
              >
                <Text className="text-2xl">{num}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={handleBackspace}
              className="w-[30%] h-14 mb-4 items-center justify-center bg-gray-50 rounded-xl"
            >
              <Text className="text-2xl">⌫</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}