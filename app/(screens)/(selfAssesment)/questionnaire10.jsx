import React, { useEffect, useState } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { router } from 'expo-router';

export default function questionnaire10() {
    const [progress] = useState(new Animated.Value(0));
    const [percentage, setPercentage] = useState(0);
    const [lineThroughIndex, setLineThroughIndex] = useState(-1);

    useEffect(() => {
        // Animate to 100% over 3 seconds
        Animated.timing(progress, {
            toValue: 1,
            duration: 3000,
            easing: Easing.easeInOut,
            useNativeDriver: true,
        }).start(() => {
            // Navigate to the home screen once animation is complete
            router.replace('/(screens)/(home)/Home')
        });

        // Update percentage counter
        const interval = setInterval(() => {
            setPercentage(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 1;
            });
        }, 30);

        return () => clearInterval(interval);


    }, []);

    // Line-through effect every second
    useEffect(() => {
        const intervalText = setInterval(() => {
            setLineThroughIndex((prevIndex) => {
                if (prevIndex < 2) {
                    return prevIndex + 1;
                } else {
                    clearInterval(intervalText);
                    return prevIndex;
                }
            });
        }, 1000);

        return () => clearInterval(intervalText);
    }, []);

    // const rotateData = progress.interpolate({
    //     inputRange: [0, 1],
    //     outputRange: ['0deg', '360deg'],
    // });

    return (
        <View className="flex-1 bg-white px-6 pt-32">
            {/* Header */}
            <Text className="text-4xl font-bold text-center mb-4">
                Thank You For Sharing
            </Text>

            <Text className="text-xl text-gray-600 text-center mb-12">
                We are taking your data to create personalized app experience.
            </Text>

            {/* Progress Circle */}
            <View className="items-center justify-center mb-16">
                <View>
                    <View>

                        <AnimatedCircularProgress
                            size={200}
                            width={20}
                            fill={100}
                            duration={3000}
                            tintColor="#623AD9"
                            backgroundColor="#FBFBFB">

                            {
                                (fill) => (
                                    <Text className="text-5xl">
                                        {percentage}%
                                    </Text>
                                )
                            }
                        </AnimatedCircularProgress>
                    </View>
                </View>
            </View>

            {/* Status List */}
            <View className="space-y-6 px-12">

                <View style={styles.statusContainer}>
                    {["Analyzing answers", "Performing calculations", "Preparing suggestions....."].map((text, index) => (
                        <View key={index} style={styles.lineContainer}>
                            {lineThroughIndex >= index && (
                                <CheckCircle size={24} color="#623AD9" style={styles.icon} />
                            )}
                            <Text style={[styles.text, lineThroughIndex >= index && styles.lineThrough]}>
                                {text}
                            </Text>
                        </View>
                    ))}
                </View>
               
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    text: {
        fontSize: 16,
        color: "gray"
    },
    lineThrough: {
        textDecorationLine: 'line-through',
    },
    icon: {
        marginRight: 10,
    },
});
