import { View, Text } from 'react-native'
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
                <Stack.Screen name='AssessmentStart' />
                <Stack.Screen name='AssessmentQuestion' />
                <Stack.Screen name='AssessmentComplete' />
                <Stack.Screen name='questionnaire1' />
                <Stack.Screen name='questionnaire2' />
                <Stack.Screen name='questionnaire3' />
                <Stack.Screen name='questionnaire4' />
                <Stack.Screen name='questionnaire5' />
                <Stack.Screen name='questionnaire6' />
                <Stack.Screen name='questionnaire7' />
                <Stack.Screen name='questionnaire8' />
                <Stack.Screen name='questionnaire9' />
                <Stack.Screen name='questionnaire10' />
            </Stack>
        </>
    )
}

export default _layout