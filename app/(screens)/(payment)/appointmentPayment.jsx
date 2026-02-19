import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, CheckCircle, Calendar, Clock, User } from 'lucide-react-native';
import CustomButton from '../../../components/CustomButton';
import { router, useLocalSearchParams } from 'expo-router';
import { useStripe } from '@stripe/stripe-react-native';
import { api } from '../../../services/api';

const AppointmentPayment = () => {
    const { appointmentId, doctorName, price, date, time } = useLocalSearchParams();
    const appointmentPrice = parseFloat(price) || 0;
    const [loading, setLoading] = useState(false);
    const { initPaymentSheet, presentPaymentSheet } = useStripe();

    // Check if this is a free session - if so, redirect to success immediately
    useEffect(() => {
        if (appointmentPrice <= 0) {
            console.log('💰 Free session detected, redirecting to success');
            router.replace({
                pathname: '/(bookSession)/SuccessfulBooking',
                params: {
                    appointmentId,
                    date,
                    time,
                    doctorName
                },
            });
        }
    }, [appointmentPrice, appointmentId, date, time, doctorName]);

    // Function to go back to the previous screen
    const goBack = () => {
        router.back();
    };

    // Initialize and present Stripe Payment Sheet
    const handlePayment = async () => {
        try {
            setLoading(true);

            // Create payment intent on backend
            console.log('Creating payment intent for appointment:', appointmentId);
            const response = await api.payments.createPaymentIntent({
                appointmentId,
            });

            if (!response.success) {
                throw new Error(response.message || 'Failed to create payment intent');
            }

            // Handle already paid session
            if (response.data?.isPaid) {
                console.log('✅ Session already paid, navigating to success');
                router.replace({
                    pathname: '/(bookSession)/SuccessfulBooking',
                    params: {
                        appointmentId,
                        date,
                        time,
                        doctorName
                    },
                });
                return;
            }

            if (!response.data?.clientSecret) {
                throw new Error('Payment initialization failed. Missing client secret.');
            }

            const { clientSecret, paymentIntentId, customerEphemeralKeySecret, customerId } = response.data;

            console.log('✅ Payment intent created successfully');
            console.log('📋 Initializing payment sheet...');

            // Initialize payment sheet
            const { error: initError } = await initPaymentSheet({
                merchantDisplayName: 'Mindful Presence',
                paymentIntentClientSecret: clientSecret,
                customerId: customerId,
                customerEphemeralKeySecret: customerEphemeralKeySecret,
                defaultBillingDetails: {
                    name: 'User',
                },
                returnURL: 'mindfulpresence://payment-success',
                allowsDelayedPaymentMethods: true,
            });

            if (initError) {
                console.error('❌ Payment sheet init error:', initError);
                Alert.alert('Error', initError.message || 'Failed to initialize payment. Please try again.');
                setLoading(false);
                return;
            }

            console.log('✅ Payment sheet initialized successfully');
            console.log('📱 Presenting payment sheet...');

            // Small delay to ensure sheet is ready
            await new Promise(resolve => setTimeout(resolve, 300));

            // Present payment sheet
            const { error: presentError } = await presentPaymentSheet();

            if (presentError) {
                // Check if user canceled the payment
                const isCanceled = 
                    presentError.code === 'Canceled' || 
                    presentError.code === 'canceled' ||
                    presentError.type === 'canceled' ||
                    presentError.message?.toLowerCase().includes('cancel') ||
                    presentError.localizedMessage?.toLowerCase().includes('cancel');
                
                if (isCanceled) {
                    // User canceled - silently handle, no error shown
                    console.log('ℹ️ User canceled the payment');
                    setLoading(false);
                    return;
                }
                
                // Real error - show alert
                console.error('❌ Payment sheet error:', presentError);
                Alert.alert(
                    'Payment Error',
                    presentError.message || presentError.localizedMessage || 'An error occurred during payment. Please try again.'
                );
                setLoading(false);
                return;
            }

            // Payment successful - confirm on backend
            console.log('Payment successful, confirming...');
            const confirmResponse = await api.payments.confirmPayment({
                paymentIntentId,
            });

            if (confirmResponse.success) {
                Alert.alert(
                    'Success!',
                    'Payment successful! Your session is confirmed.',
                    [
                        {
                            text: 'View Bookings',
                            onPress: () => {
                                router.replace({
                                    pathname: '/(bookSession)/Bookings',
                                });
                            },
                        },
                        {
                            text: 'OK',
                            style: 'cancel',
                        },
                    ]
                );
            }
        } catch (error) {
            // Check if error is related to cancellation
            const isCancelError = 
                error.message?.toLowerCase().includes('cancel') ||
                error.code === 'Canceled' ||
                error.code === 'canceled';
            
            if (isCancelError) {
                // User canceled - silently handle
                console.log('ℹ️ Payment was canceled');
            } else {
                // Real error - show alert
                console.error('❌ Payment error:', error);
                Alert.alert(
                    'Payment Failed',
                    error.message || 'An error occurred during payment. Please try again.'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDevBypass = async () => {
        if (!__DEV__) return;
        try {
            setLoading(true);
            // Simulate successful payment confirmation directly
            // Typically we would call an endpoint to mark appointment as paid, but generic confirmPayment might work if extended
            // Or call specific appointment confirm endpoint if exists.
            // For now, assuming confirmPayment works or we just redirect.

            // Mock success
            Alert.alert('Dev Success', 'Payment simulated successfully', [
                {
                    text: 'OK',
                    onPress: () => router.replace({
                        pathname: '/(bookSession)/SuccessfulBooking',
                        params: { appointmentId, date, time, doctorName }
                    })
                }
            ]);
        } catch (e) {
            Alert.alert('Error', e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View className="flex-1 bg-white px-8 py-4">
                <View className="flex-row items-center mb-6">
                    <TouchableOpacity className="pr-2" onPress={goBack} disabled={loading}>
                        <ChevronLeft size={24} color="#000" />
                    </TouchableOpacity>
                    <Text className="text-black text-2xl font-semibold ml-4">
                        Session Payment
                    </Text>
                </View>

                <View className="flex-1 justify-center">
                    {/* Appointment Info Card */}
                    <View className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
                        <Text className="text-lg font-semibold text-gray-700 mb-4">
                            Session Details
                        </Text>

                        <View className="flex-row items-center mb-3">
                            <User size={18} color="#6B7280" className="mr-2" />
                            <Text className="text-gray-800 font-medium ml-2">{doctorName || 'Therapist'}</Text>
                        </View>

                        <View className="flex-row items-center mb-3">
                            <Calendar size={18} color="#6B7280" className="mr-2" />
                            <Text className="text-gray-800 font-medium ml-2">{date}</Text>
                        </View>

                        <View className="flex-row items-center mb-4">
                            <Clock size={18} color="#6B7280" className="mr-2" />
                            <Text className="text-gray-800 font-medium ml-2">{time}</Text>
                        </View>

                        <View className="border-t border-gray-300 my-4" />

                        <View className="mb-2">
                            <Text className="text-gray-500 text-sm mb-1">Session Price</Text>
                            <Text className="text-primary text-3xl font-bold">
                                ${appointmentPrice.toFixed(2)}
                            </Text>
                        </View>
                    </View>

                    {/* Payment Summary */}
                    <View className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
                        <Text className="text-lg font-semibold text-gray-700 mb-4">
                            Payment Summary
                        </Text>

                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-500">Subtotal</Text>
                            <Text className="text-gray-800 font-medium">${appointmentPrice.toFixed(2)}</Text>
                        </View>
                        <View className="border-t border-gray-300 my-2" />

                        <View className="flex-row justify-between">
                            <Text className="text-gray-700 font-semibold">Total to Pay</Text>
                            <Text className="text-gray-800 font-semibold text-lg">
                                ${appointmentPrice.toFixed(2)}
                            </Text>
                        </View>
                    </View>

                    {/* Secure Payment Badge */}
                    <View className="flex-row items-center justify-center mb-6">
                        <CheckCircle size={16} color="#22C55E" />
                        <Text className="text-gray-600 text-sm ml-2">
                            Secure payment powered by Stripe
                        </Text>
                    </View>

                    {/* Continue Button */}
                    <View className="w-full">
                        <CustomButton
                            title={loading ? 'Processing...' : 'Pay & Confirm Booking'}
                            handlePress={handlePayment}
                            containerStyles={`bg-primary py-4 mb-4 border-2 border-primary ${loading ? 'opacity-50' : ''}`}
                            textStyles="text-lg font-bold text-white"
                            disabled={loading}
                        />
                        {loading && (
                            <ActivityIndicator size="small" color="#623AD9" style={{ marginTop: 10 }} />
                        )}
                        {__DEV__ && (
                            <TouchableOpacity onPress={handleDevBypass} className="mt-4 py-2">
                                <Text className="text-gray-400 text-center text-xs">Dev: Simulate Payment</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default AppointmentPayment;

