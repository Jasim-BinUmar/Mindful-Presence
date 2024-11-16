import {TouchableOpacity, View, Text } from 'react-native'
import React from 'react'

const CustomButton = ({title, handlePress, containerStyles, textStyles, isLoading}) => {
  return (
    <TouchableOpacity 
        disabled={isLoading}
        onPress={handlePress}
        className={` rounded-full min-h-[62px] justify-center items-center ${containerStyles}
        ${isLoading? 'opacity-50' : '' }`}
        activeOpacity={0.8}
    >
        <Text className={`font-psemibold text-lg ${textStyles}`}>{title}</Text>
    </TouchableOpacity>
         
  )
}

export default CustomButton