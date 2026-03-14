import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import StandardHeader from '../../../components/StandardHeader'

export default function profileSettings() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StandardHeader title="Profile Settings" />
      <View className="flex-1 items-center justify-center">
        <Text>profileSettings</Text>
      </View>
    </SafeAreaView>
  )
}