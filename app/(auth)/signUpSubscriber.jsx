import { View, Text, SafeAreaView, ScrollView, Alert } from 'react-native';
import React, { useState } from 'react';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { createUser } from '../../lib/appWrite';

const SignUpSubscriber = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSignUp = async () => {
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }
        
        const trimmedEmail = email.trim();
        
        try {
            console.log("email in signup form :" + trimmedEmail);

            const newUser = await createUser(trimmedEmail, password, firstName, lastName);
            if (newUser) {
                router.push('/(auth)/successfulReg');
            }
        } catch (error) {
            Alert.alert('Sign-Up Failed', error.message);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-secondary-100 h-full">
            <StatusBar style="dark" />
            <ScrollView>
                <View className="flex-1 mt-12 items-center">
                    <Text className="font-extrabold text-lg">Create An Account</Text>
                </View>
                <View className="w-full justify-center min-h-[75vh] px-4 mb-6">
                    <FormField
                        title="First Name"
                        handleChangeText={setFirstName}
                        otherStyles=""
                        labelStyles="text-gray-500 font-semibold mb-3"
                        outerInput="border-gray-300 focus:border-primary focus:bg-primary"
                        placeholder="Enter First Name"
                    />
                    <FormField
                        title="Last Name"
                        handleChangeText={setLastName}
                        otherStyles="mt-7"
                        labelStyles="text-gray-500 font-semibold mb-3"
                        outerInput="border-gray-300 focus:border-primary focus:bg-primary"
                        placeholder="Enter Last Name"
                    />
                    <FormField
                        title="Email"
                        handleChangeText={(value) => setEmail(value.trim())}
                        otherStyles="mt-7"
                        labelStyles="text-gray-500 font-semibold mb-3"
                        outerInput="border-gray-300 focus:border-primary focus:bg-primary"
                        placeholder="Enter Email"
                        keyboardType="email-address"
                    />
                    <FormField
                        title="Password"
                        handleChangeText={setPassword}
                        otherStyles="mt-7"
                        labelStyles="text-gray-500 font-semibold mb-3"
                        outerInput="border-gray-300 focus:border-primary focus:bg-primary"
                        placeholder="Enter Password"
                        secureTextEntry
                    />
                    <FormField
                        title="Confirm Password"
                        handleChangeText={setConfirmPassword}
                        otherStyles="mt-7"
                        labelStyles="text-gray-500 font-semibold mb-4"
                        outerInput="border-gray-300 focus:border-primary focus:bg-primary"
                        placeholder="Confirm Password"
                        secureTextEntry
                    />
                </View>
                <View>
                    <CustomButton
                        title="Sign Up"
                        handlePress={handleSignUp}
                        containerStyles="bg-primary py-4 mb-4 rounded-full mx-3"
                        textStyles="text-lg font-bold text-secondary"
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SignUpSubscriber;