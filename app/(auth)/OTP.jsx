import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';

export default function OTPScreen() {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [activeInput, setActiveInput] = useState(0);

  const handleNumberPress = (num) => {
    if (activeInput < 4) {
      const newOtp = [...otp];
      newOtp[activeInput] = num;
      setOtp(newOtp);
      setActiveInput(prev => Math.min(prev + 1, 3));
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

  const handleVerify = () => {
    const otpString = otp.join('');
    // Handle verification logic here
    router.replace('../(screens)/(home)/Home')
    console.log('Verifying OTP:', otpString);
  };

  const handleResendCode = () => {
    // Handle resend logic here
    console.log('Resending code...');
  };

  return (
    <View className="flex-1 bg-white px-4">
      {/* Header */}
      <View className="flex-row items-center justify-between pt-12 pb-8">
        <TouchableOpacity className="p-2">
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold">OTP</Text>
        <View className="w-10" />
      </View>

      {/* Instructions */}
      <Text className="text-center text-lg mb-8">
        Enter 4 digit otp that we just send in your email
      </Text>

      {/* OTP Input Boxes */}
      <View className="flex-row justify-center space-x-4 mb-8">
        {otp.map((digit, index) => (
          <Pressable
            key={index}
            onPress={() => setActiveInput(index)}
            className={`w-16 h-16 items-center justify-center rounded-2xl ${
              index === activeInput
                ? 'bg-purple-50 border-2 border-primary'
                : 'bg-gray-50'
            }`}
          >
            <Text className="text-2xl font-semibold">{digit}</Text>
          </Pressable>
        ))}
      </View>

      {/* Verify Button */}
      <TouchableOpacity
        onPress={handleVerify}
        className="bg-primary rounded-full py-4 mb-4"
      >
        <Text className="text-white text-center text-lg font-semibold">
          Verify
        </Text>
      </TouchableOpacity>

      {/* Resend Code */}
      <TouchableOpacity onPress={handleResendCode}>
        <Text className="text-primary text-center text-base">
          Resend Code
        </Text>
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
  );
}