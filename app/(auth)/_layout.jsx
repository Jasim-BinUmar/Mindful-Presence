import React from 'react'
import { Stack } from 'expo-router';

const AuthLayout = () => {
  return (
    <Stack>
        <Stack.Screen name='userAuthScreen'
          options={
            {
              headerShown: false
            }
          }
        />
        <Stack.Screen name='userRegistrationScreen'
          options={
            {
              headerShown: false
            }
          }
        />

        <Stack.Screen name='OTP'
          options={
            {
              headerShown: false
            }
          }


        />
        <Stack.Screen name='signUpSubscriber'
          options={
            {
              headerShown: false
            }
          }

        />
        <Stack.Screen name='signUpOrg'
          options={
            {
              headerShown: false
            }
          }

        />

        <Stack.Screen name='successfulReg'
          options={
            {
              headerShown: false
            }
          }
        />
        <Stack.Screen name='Login'
          options={
            {
              headerShown: false
            }
          }
        />
        <Stack.Screen name='OrgLogin'
          options={
            {
              headerShown: false
            }
          }
        />
        <Stack.Screen name='LoginOption'
          options={
            {
              headerShown: false
            }
          }
        />

    </Stack>
  )
}

export default AuthLayout 