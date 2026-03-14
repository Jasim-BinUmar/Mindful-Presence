import React from 'react'
import { Stack } from 'expo-router';

const _layout = () => {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name='profile' />
            <Stack.Screen name='profileSettings' />
            <Stack.Screen name='EditProfile' />
            <Stack.Screen name='myCourses' />
        </Stack>
    )
}

export default _layout