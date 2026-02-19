import { View, Text } from 'react-native'
import React from 'react'
import {Stack} from 'expo-router';
const _layout = () => {
    return (
        <>
            <Stack
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name='support' />
            </Stack>

            {/* <StatusBar backgroundColor="#161622" style="light"/> */}
        </>
    )
}

export default _layout