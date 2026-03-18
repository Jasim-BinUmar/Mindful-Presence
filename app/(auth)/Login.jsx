import { View, Text, ScrollView, Alert, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import StandardHeader from '../../components/StandardHeader';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useGlobalContext } from '../../lib/globalContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login, isAuthenticated, isLoading } = useGlobalContext();

    useEffect(() => {
        // Redirect if already authenticated
        if (isAuthenticated && !isLoading) {
            router.replace('/(screens)/(home)/Home');
        }
    }, [isAuthenticated, isLoading]);

    const handleLogin = async () => {
        if (!email.trim() || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        const trimmedEmail = email.trim();
        setIsSubmitting(true);

        try {
            const response = await login({ email: trimmedEmail, password });

            if (response.success) {
                Alert.alert('Success', 'Logged in successfully');
                router.replace('/(screens)/(home)/Home');
            } else {
                Alert.alert('Login Failed', response.message || 'Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('Login Failed', error.message || 'An unknown error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 h-full">
            <StatusBar style="dark" translucent />
            <StandardHeader title="Login" centeredTitle={true} backgroundColor="#F9FAFB" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 32, flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View className="items-center px-6 pt-8 pb-4">
                    <Text className="font-black text-3xl text-black-200 mb-2">Welcome Back!</Text>
                    <Text className="text-gray-500 text-center text-base">Please enter your credentials to continue your journey.</Text>
                </View>

                <View className="mx-4 mt-6 bg-white rounded-t-3xl px-5 py-6 shadow-sm border border-gray-100">
                    <FormField
                        title="Your Email"
                        handleChangeText={(value) => setEmail(value.trim())}
                        otherStyles="mt-4"
                        labelStyles="text-gray-600 font-semibold mb-2"
                        outerInput="border-gray-200 rounded-button focus:border-primary"
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        value={email}
                    />
                    <FormField
                        title="Password"
                        handleChangeText={setPassword}
                        otherStyles="mt-5"
                        labelStyles="text-gray-600 font-semibold mb-2"
                        outerInput="border-gray-200 rounded-button focus:border-primary"
                        placeholder="Enter your password"
                        secureTextEntry
                        value={password}
                    />

                    <View className="flex-row items-center mt-5">
                        <TouchableOpacity
                            onPress={() => setRememberMe(!rememberMe)}
                            className="flex-row items-center"
                        >
                            <View className={`w-5 h-5 border-2 rounded items-center justify-center mr-2 ${rememberMe ? 'bg-primary border-primary' : 'border-gray-400'}`}>
                                {rememberMe && (
                                    <Text className="text-white text-xs font-bold">✓</Text>
                                )}
                            </View>
                            <Text className="text-gray-700">Remember me</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="mt-8">
                        <CustomButton
                            title="Login"
                            handlePress={handleLogin}
                            isLoading={isSubmitting}
                            containerStyles="bg-primary rounded-full w-full py-4"
                            textStyles="text-lg font-bold text-white"
                        />
                    </View>

                    <TouchableOpacity
                        onPress={() => {
                            Alert.alert('Forgot Password', 'Forgot password functionality coming soon');
                        }}
                        className="mt-5"
                    >
                        <Text className="text-primary text-center text-base font-semibold">
                            Forgot Password?
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default Login;