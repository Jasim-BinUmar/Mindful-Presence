import { TouchableOpacity, View, Text, ActivityIndicator } from 'react-native'
import React from 'react'

const CustomButton = ({ title, handlePress, containerStyles, textStyles, isLoading }) => {
  return (
    <TouchableOpacity
      disabled={isLoading}
      onPress={handlePress}
      className={` rounded-full min-h-[62px] justify-center items-center ${containerStyles}
        ${isLoading ? 'opacity-50' : ''}`}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={textStyles?.includes('text-white') ? '#FFFFFF' : '#623AD9'}
        />
      ) : (
        <Text className={`font-psemibold text-lg ${textStyles}`}>{title}</Text>
      )}
    </TouchableOpacity>

  )
}

export default CustomButton