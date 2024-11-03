import { View, Text, TextInput, Image } from 'react-native'
import React, { useState } from 'react'  
import { TouchableOpacity } from 'react-native';
import { icons } from '../constants';
const FormField = ({title, value, placeholder, handleChangeText, otherStyles, labelStyles, outerInput, inputStyles ,...props}) => {
  const [showPassword, setShowPassword] = useState(false);
    return (
    <View  className={`space-y-2 ${otherStyles}`}>
      <Text className={`text-base ${labelStyles}`}>{title}</Text>
      <View className={`w-full h-16 px-4 border-2 rounded-full items-center flex-row ${outerInput}`}>
        <TextInput 
            className={`flex-1 font-semibold text-base ${inputStyles}`}
            value={value}
            placeholder={placeholder}
            placeholderTextColor="#d1d5db"
            onChangeText={handleChangeText}
            secureTextEntry= {title === 'Password' && !showPassword}
        />

        {title === 'Password' && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Image source = {!showPassword ? icons.eye : icons.eyeHide} className="w-6 h-6 " resizeMode='contain'/>
          </TouchableOpacity>
        )}
        {title === 'Confirm Password' && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Image source = {!showPassword ? icons.eye : icons.eyeHide} className="w-6 h-6 " resizeMode='contain'/>
          </TouchableOpacity>
        )}        

      </View>
    </View>
  )
  }

export default FormField