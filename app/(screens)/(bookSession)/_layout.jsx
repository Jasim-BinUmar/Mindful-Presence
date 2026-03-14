import React from 'react'
import { Stack } from 'expo-router';

const _layout = () => {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name='DoctorsList' />
            <Stack.Screen name='BookSession' />
            <Stack.Screen name='Bookings' />
            <Stack.Screen name='SuccessfulBooking' />
        </Stack>
    )
}

export default _layout