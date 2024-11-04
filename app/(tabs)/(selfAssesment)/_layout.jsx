import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router';
// import successfulReg from '../../(auth)/successfulReg';
const _layout = () => {
    return (
        <>
            <Stack>
                <Stack.Screen name='questionnaire1'
                    options={
                        {
                            headerShown: false
                        }
                    }
                />

                <Stack.Screen name='questionnaire2'
                    options={
                        {
                            headerShown: false
                        }
                    }

                />
                <Stack.Screen name='questionnaire3'
                    options={
                        {
                            headerShown: false
                        }
                    }

                />
                 <Stack.Screen name='questionnaire4'
                    options={
                        {
                            headerShown: false
                        }
                    }

                />
                 {/* <Stack.Screen name='questionnaire5'
                    options={
                        {
                            headerShown: false
                        }
                    }

                />
                 <Stack.Screen name='questionnaire6'
                    options={
                        {
                            headerShown: false
                        }
                    }

                />
                 <Stack.Screen name='questionnaire7'
                    options={
                        {
                            headerShown: false
                        }
                    }

                />
                 <Stack.Screen name='questionnaire8'
                    options={
                        {
                            headerShown: false
                        }
                    }

                /> */}
            </Stack>

            {/* <StatusBar backgroundColor="#161622" style="light"/> */}
        </>
    )
}

export default _layout