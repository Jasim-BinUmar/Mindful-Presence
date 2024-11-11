import { View, Text, StatusBar } from 'react-native'
import React from 'react'
import {Stack} from 'expo-router';
const _layout = () => {
    return (
        <>
            <Stack>
                <Stack.Screen name='profile'
                    options={
                        {
                            headerShown: false
                        }
                    }

                />
            </Stack>

            {/* <StatusBar style="light"/> */}
        </>
    )
}

export default _layout