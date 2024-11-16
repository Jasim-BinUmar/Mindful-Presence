import { View, Text } from 'react-native'
import React from 'react'
import {Stack} from 'expo-router';
const _layout = () => {
    return (
        <>
            <Stack>
                <Stack.Screen name='BookSession'
                    options={
                        {
                            headerShown: false

                        }
                    }

                />
                <Stack.Screen name='Bookings'
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

export default _layout