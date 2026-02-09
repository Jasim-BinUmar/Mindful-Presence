import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router';

const _layout = () => {
    return (
        <>
            <Stack>
                <Stack.Screen name='AssessmentStart'
                    options={
                        {
                            headerShown: false
                        }
                    }
                />
                <Stack.Screen name='AssessmentQuestion'
                    options={
                        {
                            headerShown: false
                        }
                    }
                />
                <Stack.Screen name='AssessmentComplete'
                    options={
                        {
                            headerShown: false
                        }
                    }
                />
            </Stack>
        </>
    )
}

export default _layout