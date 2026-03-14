import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Check, ChevronLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../../constants';
import { router, useLocalSearchParams } from 'expo-router';
import { useGlobalContext } from '../../lib/globalContext';

export default function SuccessfulReg() {
    const { autoLogin } = useLocalSearchParams();
    const { isAuthenticated } = useGlobalContext();

    useEffect(() => {
        // Auto-navigate to home after 2 seconds if auto-login is enabled
        if (autoLogin === 'true' || isAuthenticated) {
            const timer = setTimeout(() => {
                router.replace('/(screens)/(home)/Home');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [autoLogin, isAuthenticated]);

    const handleSelfAssessment = () => {
        // Handle navigation to self assessment
        router.push('/(screens)/(selfAssesment)/questionnaire1')
        console.log('Navigating to self assessment...');
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
          <View className="flex-1 px-8 items-center justify-evenly">
            {/* Success Icon */}
            <View className="items-center justify-center ">
                <Image
                    source={images.successIcon}
                    style={{ width: 150, height: 150 }}
                    resizeMode="contain"
                />
            </View>

            {/* Congratulations Text */}
            <Text className="text-primary text-3xl font-semibold ">
                Congratulations
            </Text>

            {/* Success Message */}
            <Text className="text-center text-gray-600 text-lg mb-12 leading-7">
                Your Password Has Been Changed Successfully!
            </Text>

            {/* Auto-navigation message */}
            {(autoLogin === 'true' || isAuthenticated) && (
                <Text className="text-center text-gray-500 text-sm mb-4">
                    Redirecting to home...
                </Text>
            )}

            {/* Self Assessment Button - Only show if not auto-logging */}
            {!(autoLogin === 'true' || isAuthenticated) && (
                <TouchableOpacity
                    onPress={handleSelfAssessment}
                    className="w-full bg-primary rounded-full py-4 px-6"
                >
                    <Text className="text-white text-center text-xl font-semibold">
                        Self Assessment
                    </Text>
                </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
    );
}