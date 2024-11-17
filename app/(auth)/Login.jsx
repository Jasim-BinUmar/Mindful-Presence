import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { signIn, getCurrentUser } from '../../lib/appWrite'; // Adjust path as needed

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Check for an existing session on component mount
    useEffect(() => {
        const checkUserSession = async () => {
            try {
                const currentUser = await getCurrentUser();
                if (currentUser) {
                    Alert.alert('Welcome Back', `You are already logged in as ${currentUser.email}`);
                    router.replace('/(home)/Home'); // Redirect if a session exists
                }
            } catch (error) {
                console.log('No active session found', error);
            }
        };

        checkUserSession();
    }, []);

    const handleLogin = async () => {
        try {
            const session = await signIn(email, password);
            if (session) {
                Alert.alert('Success', 'Logged in successfully');
                router.replace('/(home)/Home');
            }
        } catch (error) {
            Alert.alert('Login Failed', error.message);
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
                        handleChangeText={setEmail}
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
                            title='Log In'
                            handlePress={handleLogin}
                            containerStyles="bg-primary rounded-full w-full"
                            textStyles="text-lg font-bold text-secondary"
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Login;
