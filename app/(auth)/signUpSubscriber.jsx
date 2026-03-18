import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import StandardHeader from '../../components/StandardHeader';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

const GENDER_OPTIONS = ['Male', 'Female'];
const RELIGION_OPTIONS = ['Christianity', 'Islam', 'Hinduism', 'Buddhism', 'Sikhism', 'Judaism', 'Other'];

const SignUpSubscriber = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');
    const [religion, setReligion] = useState('');
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
        if (age.trim()) {
            const ageNum = parseInt(age.trim(), 10);
            if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
                Alert.alert('Error', 'Age must be a number between 1 and 120');
                return false;
            }
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

            if (gender === 'Male' || gender === 'Female') registrationData.gender = gender;
            if (age.trim()) {
                const ageNum = parseInt(age.trim(), 10);
                if (!isNaN(ageNum) && ageNum >= 1 && ageNum <= 120) {
                    registrationData.age = ageNum;
                }
            }
            if (RELIGION_OPTIONS.includes(religion)) registrationData.religion = religion;

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
                    <Text className="text-gray-500 text-sm mt-5 mb-1">Optional</Text>
                    <View className="mt-1">
                        <Text className="text-gray-600 font-semibold mb-2">Gender (optional)</Text>
                        <View className="w-full h-16 px-4 border-2 border-gray-200 rounded-2xl justify-center">
                            <Picker
                                selectedValue={gender}
                                onValueChange={setGender}
                                style={{ height: 60, color: '#111827', backgroundColor: 'transparent' }}
                                itemStyle={{ color: '#111827', fontSize: 16 }}
                                prompt="Select gender"
                            >
                                <Picker.Item label="Select gender" value="" color="#111827" />
                                {GENDER_OPTIONS.map((opt) => (
                                    <Picker.Item key={opt} label={opt} value={opt} color="#111827" />
                                ))}
                            </Picker>
                        </View>
                    </View>
                    <FormField
                        title="Age (optional)"
                        handleChangeText={(v) => setAge(v.replace(/\D/g, '').slice(0, 3))}
                        otherStyles="mt-5"
                        labelStyles="text-gray-600 font-semibold mb-2"
                        outerInput="border-gray-200 rounded-button focus:border-primary"
                        placeholder="1–120"
                        keyboardType="number-pad"
                        value={age}
                    />
                    <View className="mt-5">
                        <Text className="text-gray-600 font-semibold mb-2">Religion (optional)</Text>
                        <View className="w-full h-16 px-4 border-2 border-gray-200 rounded-2xl justify-center">
                            <Picker
                                selectedValue={religion}
                                onValueChange={setReligion}
                                style={{ height: 60, color: '#111827', backgroundColor: 'transparent' }}
                                itemStyle={{ color: '#111827', fontSize: 16 }}
                                prompt="Select religion"
                            >
                                <Picker.Item label="Select religion" value="" color="#111827" />
                                {RELIGION_OPTIONS.map((opt) => (
                                    <Picker.Item key={opt} label={opt} value={opt} color="#111827" />
                                ))}
                            </Picker>
                        </View>
                    </View>
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
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default SignUpSubscriber;