import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const StandardHeader = ({
    title,
    showBackButton = true,
    onBackPress,
    rightIcon: RightIcon,
    onRightIconPress,
    centeredTitle = false,
    backgroundColor = '#FFFFFF'
}) => {
    const handleBack = () => {
        if (onBackPress) {
            onBackPress();
        } else if (router.canGoBack()) {
            router.back();
        }
    };

    return (
        <View style={[styles.headerContainer, { backgroundColor }]}>
            <View className="flex-row items-center px-4 h-16">
                {showBackButton && (
                    <TouchableOpacity
                        onPress={handleBack}
                        className="p-2 -ml-2 mr-2"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <ChevronLeft size={24} color="#1E1E2D" strokeWidth={2.5} />
                    </TouchableOpacity>
                )}

                <View className={`${centeredTitle ? 'flex-1 items-center' : 'flex-1'}`}>
                    <Text
                        className="text-lg font-black text-black-200"
                        numberOfLines={1}
                        style={{
                            marginRight: RightIcon ? 0 : (showBackButton && centeredTitle ? 40 : 0)
                        }}
                    >
                        {title}
                    </Text>
                </View>

                {RightIcon && (
                    <TouchableOpacity
                        onPress={onRightIconPress}
                        className="p-2 -mr-2 ml-2"
                    >
                        <RightIcon size={24} color="#1E1E2D" strokeWidth={2.5} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
        zIndex: 1000,
    },
});

export default StandardHeader;
