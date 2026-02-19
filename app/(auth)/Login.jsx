import { View, Text, ScrollView, Alert, ActivityIndicator, TouchableOpacity, Checkbox } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import StandardHeader from '../../components/StandardHeader';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useGlobalContext } from '../../lib/globalContext';

const Login = () => {
    const [email, setEmail] = useState('ericangelo1503@gmail.com');
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
            console.log("Attempting login with email:", trimmedEmail);
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
        <SafeAreaView className="flex-1 bg-white h-full">
            <StatusBar style="dark" />
            <StandardHeader title="Login" centeredTitle={true} />
            <ScrollView className="flex-1">
                <View className="flex-1 mt-8 items-center px-6">
                    <Text className='font-black text-3xl text-black-200 mb-2'>Welcome Back!</Text>
                    <Text className="text-gray-500 text-center text-base">Please enter your credentials to continue your journey.</Text>
                </View>

                <View className="w-full justify-start min-h-[75vh] px-4 mb-6 mt-8">
                    <FormField
                        title="Your Email"
                        handleChangeText={(value) => setEmail(value.trim())}
                        otherStyles="mt-6"
                        labelStyles="text-gray-500 font-semibold mb-3"
                        outerInput="border-gray-300 focus:border-primary focus:bg-primary"
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        value={email}
                    />
                    <FormField
                        title="Password"
                        handleChangeText={setPassword}
                        otherStyles="mt-6"
                        labelStyles="text-gray-500 font-semibold mb-3"
                        outerInput="border-gray-300 focus:border-primary focus:bg-primary"
                        placeholder="Insert your password here"
                        secureTextEntry
                        value={password}
                    />

                    {/* Remember Me Checkbox */}
                    <View className="flex-row items-center mt-6">
                        <TouchableOpacity
                            onPress={() => setRememberMe(!rememberMe)}
                            className="flex-row items-center"
                        >
                            <View className={`w-5 h-5 border-2 rounded items-center justify-center mr-2 ${rememberMe ? 'bg-primary border-primary' : 'border-gray-400'
                                }`}>
                                {rememberMe && (
                                    <Text className="text-white text-xs">✓</Text>
                                )}
                            </View>
                            <Text className="text-gray-700">Remember me</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Login Button */}
                    <View className='mt-8'>
                        <CustomButton
                            title="Login"
                            handlePress={handleLogin}
                            isLoading={isSubmitting}
                            containerStyles="bg-primary rounded-full w-full py-4 mt-4"
                            textStyles="text-lg font-bold text-white"
                        />
                    </View>

                    {/* Forgot Password Link */}
                    <TouchableOpacity
                        onPress={() => {
                            // Navigate to forgot password screen
                            Alert.alert('Forgot Password', 'Forgot password functionality coming soon');
                        }}
                        className="mt-6"
                    >
                        <Text className="text-primary text-center text-base">
                            Forgot Password?
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Login;