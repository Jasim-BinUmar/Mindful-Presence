import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useGlobalContext } from '../../lib/globalContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
        <SafeAreaView className="flex-1 bg-secondary-100 h-full">
            <StatusBar style="dark" />
            <ScrollView>
                <View className='flex-1 mt-12 items-center'>
                    <Text className='font-bold text-2xl'>Log In</Text>
                </View>
                <View className="w-full justify-start min-h-[75vh] px-4 mb-6">
                    <FormField
                        title="Email"
                        handleChangeText={(value) => setEmail(value.trim())}
                        otherStyles="mt-7"
                        labelStyles="text-gray-500 font-semibold mb-3"
                        outerInput="border-gray-300 focus:border-primary focus:bg-primary"
                        placeholder="Enter Email"
                        keyboardType="email-address"
                        value={email}
                    />
                    <FormField
                        title="Password"
                        handleChangeText={setPassword}
                        otherStyles="mt-7"
                        labelStyles="text-gray-500 font-semibold mb-3"
                        outerInput="border-gray-300 focus:border-primary focus:bg-primary"
                        placeholder="Enter Password"
                        secureTextEntry
                        value={password}
                    />
                    <View className='mt-10'>
                        <CustomButton
                            title={isSubmitting ? 'Logging in...' : 'Log In'}
                            handlePress={handleLogin}
                            containerStyles="bg-primary rounded-full w-full"
                            textStyles="text-lg font-bold text-secondary"
                            disabled={isSubmitting}
                        />
                        {isSubmitting && (
                            <ActivityIndicator size="small" color="#0000ff" style={{ marginTop: 10 }} />
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Login;