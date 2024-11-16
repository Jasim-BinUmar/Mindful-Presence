import { View, Text } from 'react-native'
import React from 'react'
import { TouchableOpacity } from 'react-native'

const GuideCard = ({title, buttonTitle, handlePress, isLoading}) => {
  return (
    <View>
      <View className='flex-row min-w-80 min-h-20 border-2 border-gray-300 rounded-full mx-3 my-2 items-center '>
        
        <View className='flex-auto w-[65%] justify-start ml-4 my-2 items-start '>
            <Text className='pl-3 w-full text-[14px] font-medium text-black-200  '>{title}</Text> 
        </View>
        <View className='w-36 h-10 '> 

            <TouchableOpacity 
            className={`mr-4 ml-2 rounded-full bg-primary flex-grow items-center justify-center ${isLoading? 'opacity-50' : '' }`}
            onPress={handlePress}
            >
                <Text className=' text-secondary-100 font-light text-[14px]'>
                    {buttonTitle}
                </Text>
            </TouchableOpacity>

        </View>

      </View>
    </View>
  )
}

export default GuideCard