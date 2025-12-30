import { View, Text, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
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
            console.log("Sending OTP to email:", trimmedEmail);

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

            console.log("Registration data:", registrationData);

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
        <SafeAreaView className="flex-1 bg-secondary-100 h-full">
            <StatusBar style="dark" />
            <ScrollView 
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
                keyboardShouldPersistTaps="handled"
            >
                <View className="flex-1 mt-6 items-center">
                    <Text className="font-extrabold text-lg">Create An Account</Text>
                </View>
                <View className="w-full justify-center px-4 mb-6 mt-4">
                    <FormField
                        title="First Name"
                        handleChangeText={setFirstName}
                        otherStyles=""
                        labelStyles="text-gray-500 font-semibold mb-2 text-sm"
                        outerInput="border-gray-300 focus:border-primary focus:bg-primary"
                        placeholder="Enter First Name"
                    />
                    <FormField
                        title="Last Name"
                        handleChangeText={setLastName}
                        otherStyles="mt-4"
                        labelStyles="text-gray-500 font-semibold mb-2 text-sm"
                        outerInput="border-gray-300 focus:border-primary focus:bg-primary"
                        placeholder="Enter Last Name"
                    />
                    <FormField
                        title="Email"
                        handleChangeText={(value) => setEmail(value.trim())}
                        otherStyles="mt-4"
                        labelStyles="text-gray-500 font-semibold mb-2 text-sm"
                        outerInput="border-gray-300 focus:border-primary focus:bg-primary"
                        placeholder="Enter Email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <FormField
                        title="Phone Number"
                        handleChangeText={setPhoneNumber}
                        otherStyles="mt-4"
                        labelStyles="text-gray-500 font-semibold mb-2 text-sm"
                        outerInput="border-gray-300 focus:border-primary focus:bg-primary"
                        placeholder="+1234567890"
                        keyboardType="phone-pad"
                    />
                    <FormField
                        title="Password"
                        handleChangeText={setPassword}
                        otherStyles="mt-4"
                        labelStyles="text-gray-500 font-semibold mb-2 text-sm"
                        outerInput="border-gray-300 focus:border-primary focus:bg-primary"
                        placeholder="Enter Password"
                        secureTextEntry
                    />
                    <FormField
                        title="Confirm Password"
                        handleChangeText={setConfirmPassword}
                        otherStyles="mt-4"
                        labelStyles="text-gray-500 font-semibold mb-2 text-sm"
                        outerInput="border-gray-300 focus:border-primary focus:bg-primary"
                        placeholder="Confirm Password"
                        secureTextEntry
                    />
                </View>
                <View>
                    <CustomButton
                        title={isSubmitting ? "Creating Account..." : "Sign Up"}
                        handlePress={handleSignUp}
                        containerStyles="bg-primary py-4 mb-4 rounded-full mx-3"
                        textStyles="text-lg font-bold text-secondary"
                        disabled={isSubmitting}
                    />
                    {isSubmitting && (
                        <ActivityIndicator size="small" color="#0000ff" style={{ marginTop: 10, marginBottom: 20 }} />
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SignUpSubscriber;