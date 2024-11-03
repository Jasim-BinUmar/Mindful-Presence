import { View, Text, Image } from 'react-native'
import React from 'react'
import { Stack, Tabs, Redirect } from "expo-router";
import { icons } from "../../../constants";


const homeLayout = () => {
    return (
        < >
            <Stack
            >
                {/* Home Tab */}
                <Stack.Screen
                    name='homeScreen'
                    options={
                        {
                            headerShown: false,
                        }
                    }
                />
               
            </Stack>

        </>
    )
}

export default homeLayout