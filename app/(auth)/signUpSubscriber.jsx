import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import StandardHeader from '../../components/StandardHeader';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

const SignUpSubscriber = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = () => {
        if (!firstName.trim()) {
            Alert.alert('Error', 'Please enter your first name');
            return false;
        }
        if (!lastName.trim()) {
            Alert.alert('Error', 'Please enter your last name');
            return false;
        }
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email');
            return false;
        }
        if (!password) {
            Alert.alert('Error', 'Please enter a password');
            return false;
        }
        if (password.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters long');
            return false;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return false;
        }
        // Phone number validation (required)
        if (!phoneNumber.trim()) {
            Alert.alert('Error', 'Please enter your phone number');
            return false;
        }
        if (!/^\+?[1-9]\d{1,14}$/.test(phoneNumber.trim().replace(/\s/g, ''))) {
            Alert.alert('Error', 'Please enter a valid phone number (e.g., +1234567890)');
            return false;
        }
        return true;
    };

    const handleSignUp = async () => {
        if (!validateForm()) {
            return;
        }
        
        const trimmedEmail = email.trim();
        const trimmedPhone = phoneNumber.trim();
        setIsSubmitting(true);
        
        try {
            // Combine firstName and lastName into name, and format phone number
            const registrationData = {
                name: `${firstName.trim()} ${lastName.trim()}`.trim(),
                email: trimmedEmail,
                password,
            };

            // Format phone number (required)
            let formattedPhone = trimmedPhone.replace(/\s/g, '');
            // If it doesn't start with +, add it
            if (!formattedPhone.startsWith('+')) {
                // Remove all non-digits and add +
                formattedPhone = '+' + formattedPhone.replace(/\D/g, '');
            } else {
                // Keep + but ensure only digits after it
                formattedPhone = '+' + formattedPhone.substring(1).replace(/\D/g, '');
            }
            registrationData.phoneNumber = formattedPhone;

            // Send OTP to email (using register endpoint - backward compatible)
            const { api } = await import('../../services/api');
            const response = await api.auth.register(registrationData);

            if (response.success) {
                // Navigate to OTP screen with email
                router.push({
                    pathname: '/(auth)/OTP',
                    params: { 
                        email: trimmedEmail,
                        registrationData: JSON.stringify(registrationData)
                    }
                });
            } else {
                let errorMessage = response.message || 'Failed to send OTP';
                Alert.alert('Error', errorMessage);
            }
        } catch (error) {
            console.error('OTP send error:', error);
            let errorMessage = error.message || 'An error occurred while sending OTP';
            if (error.data) {
                if (error.data.errors && Array.isArray(error.data.errors)) {
                    errorMessage = error.data.errors.map(err => err.msg || err.message || err).join('\n');
                } else if (error.data.message) {
                    errorMessage = error.data.message;
                } else if (error.data.error) {
                    errorMessage = typeof error.data.error === 'string' 
                        ? error.data.error 
                        : error.data.error.message || errorMessage;
                }
            }
            Alert.alert('Error', errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 h-full">
            <StatusBar style="dark" translucent />
            <StandardHeader title="Create An Account" centeredTitle={true} backgroundColor="#F9FAFB" />
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View className="items-center px-6 pt-8 pb-4">
                    <Text className="font-black text-3xl text-black-200 mb-2">Create Your Account</Text>
                    <Text className="text-gray-500 text-center text-base">Join us and start your journey.</Text>
                </View>

                <View className="mx-4 mt-6 bg-white rounded-t-3xl px-5 py-6 shadow-sm border border-gray-100">
                    <FormField
                        title="First Name"
                        handleChangeText={setFirstName}
                        otherStyles="mt-4"
                        labelStyles="text-gray-600 font-semibold mb-2"
                        outerInput="border-gray-200 rounded-button focus:border-primary"
                        placeholder="Enter First Name"
                        value={firstName}
                    />
                    <FormField
                        title="Last Name"
                        handleChangeText={setLastName}
                        otherStyles="mt-5"
                        labelStyles="text-gray-600 font-semibold mb-2"
                        outerInput="border-gray-200 rounded-button focus:border-primary"
                        placeholder="Enter Last Name"
                        value={lastName}
                    />
                    <FormField
                        title="Your Email"
                        handleChangeText={(value) => setEmail(value.trim())}
                        otherStyles="mt-5"
                        labelStyles="text-gray-600 font-semibold mb-2"
                        outerInput="border-gray-200 rounded-button focus:border-primary"
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                    />
                    <FormField
                        title="Phone Number"
                        handleChangeText={setPhoneNumber}
                        otherStyles="mt-5"
                        labelStyles="text-gray-600 font-semibold mb-2"
                        outerInput="border-gray-200 rounded-button focus:border-primary"
                        placeholder="+1234567890"
                        keyboardType="phone-pad"
                        value={phoneNumber}
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
                    <FormField
                        title="Confirm Password"
                        handleChangeText={setConfirmPassword}
                        otherStyles="mt-5"
                        labelStyles="text-gray-600 font-semibold mb-2"
                        outerInput="border-gray-200 rounded-button focus:border-primary"
                        placeholder="Confirm your password"
                        secureTextEntry
                        value={confirmPassword}
                    />

                    <View className="mt-8">
                        <CustomButton
                            title={isSubmitting ? "Creating Account..." : "Sign Up"}
                            handlePress={handleSignUp}
                            isLoading={isSubmitting}
                            containerStyles="bg-primary rounded-full w-full py-4"
                            textStyles="text-lg font-bold text-white"
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SignUpSubscriber;