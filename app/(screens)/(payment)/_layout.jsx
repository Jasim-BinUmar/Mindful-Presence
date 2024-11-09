import { View, Text, StatusBar } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router';
const _layout = () => {
    return (
        <>
            <Stack>
                <Stack.Screen name='payment'
                    options={
                        {
                            headerShown: false
                        }
                    }

                />
                <Stack.Screen name='paymentMethod'
                    options={
                        {
                            headerShown: false
                        }
                    }

                />
                <Stack.Screen name='cardDetails'
                    options={
                        {
                            headerShown: false
                        }
                    }

                />

            </Stack>

            {/* <StatusBar backgroundColor="#161622" style="dark"/> */}
        </>
    )
}

export default _layout