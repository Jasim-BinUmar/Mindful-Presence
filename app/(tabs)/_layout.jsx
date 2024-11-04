import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router';
const _layout = () => {
    return (
        <>

            <Stack>

                <Stack.Screen name="(home)"

                    options={
                        {
                            headerShown: true
                        }
                    }

                />

                <Stack.Screen name="(selfAssesment)"

                    options={
                        {
                            headerShown: false
                        }
                    }

                />
            </Stack>

            {/* <StatusBar backgroundColor="#161622" style="light"/> */}
        </>
    )
}

export default _layout