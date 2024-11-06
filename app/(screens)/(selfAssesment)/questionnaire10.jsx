import React, { useEffect, useState } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { CheckCircle } from 'lucide-react-native';

export default function questionnaire10() {
    const [progress] = useState(new Animated.Value(0));
    const [percentage, setPercentage] = useState(0);

    useEffect(() => {
        // Animate to 75% over 2 seconds
        Animated.timing(progress, {
            toValue: 0.75,
            duration: 2000,
            easing: Easing.easeInOut,
            useNativeDriver: true,
        }).start();

        // Update percentage counter
        const interval = setInterval(() => {
            setPercentage(prev => {
                if (prev >= 75) {
                    clearInterval(interval);
                    return 75;
                }
                return prev + 1;
            });
        }, 20);

        return () => clearInterval(interval);
    }, []);

    const rotateData = progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View className="flex-1 bg-white px-6 pt-16">
            {/* Header */}
            <Text className="text-4xl font-bold text-center mb-4">
                Thank You For Sharing
            </Text>
            
            <Text className="text-xl text-gray-600 text-center mb-12">
                We are taking your data to create personalized app experience.
            </Text>

            {/* Progress Circle */}
            <View className="items-center justify-center mb-16">
                <View className="w-48 h-48 rounded-full border-[16px] border-purple-100 relative">
                    <Animated.View 
                        className="w-48 h-48 absolute top-[-16px] left-[-16px]"
                        style={{
                            transform: [{ rotate: rotateData }],
                        }}
                    >
                        <View className="w-48 h-48 rounded-full border-[16px] border-transparent border-t-purple-600" />
                    </Animated.View>
                    <View className="absolute inset-0 items-center justify-center">
                        <Text className="text-5xl font-bold">
                            {percentage}%
                        </Text>
                    </View>
                </View>
            </View>

            {/* Status List */}
            <View className="space-y-6">
                <View className="flex-row items-center">
                    <CheckCircle size={24} className="text-purple-600" />
                    <Text className="ml-4 text-lg text-gray-400 line-through">
                        Analyzing answers
                    </Text>
                </View>
                
                <View className="flex-row items-center">
                    <CheckCircle size={24} className="text-purple-600" />
                    <Text className="ml-4 text-lg text-gray-400 line-through">
                        Performing calculations
                    </Text>
                </View>
                
                <View className="flex-row items-center">
                    <View className="w-6 h-6 rounded-full border-2 border-gray-300" />
                    <Text className="ml-4 text-lg">
                        Preparing suggestions.....
                    </Text>
                </View>
            </View>
        </View>
    );
}