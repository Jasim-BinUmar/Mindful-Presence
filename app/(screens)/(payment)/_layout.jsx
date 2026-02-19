import { View, Text, StatusBar } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router';
const _layout = () => {
    return (
        <>
            <Stack
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name='Payment' />
                <Stack.Screen name='paymentMethod' />
                <Stack.Screen name='cardDetails' />
                <Stack.Screen name='coursePayment' />
                <Stack.Screen name='successfulPayment' />
                <Stack.Screen name='checkout' />
                <Stack.Screen name='paymentHistory' />
                <Stack.Screen name='appointmentPayment' />
            </Stack>

            {/* <StatusBar backgroundColor="#161622" style="dark"/> */}
        </>
    )
}

export default _layout