import { View, Text, TextInput, Image } from 'react-native'
import React, { useState } from 'react'  
import { TouchableOpacity } from 'react-native';
import { icons } from '../constants';
const FormField = ({title, value, placeholder, handleChangeText, otherStyles, labelStyles, outerInput, inputStyles, secureTextEntry: _secureTextEntry, ...props}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = title === 'Password' || title === 'Confirm Password';
  const shouldMask = isPasswordField && !showPassword;
    return (
    <View  className={`space-y-2 ${otherStyles}`}>
      <Text className={`text-base ${labelStyles}`}>{title}</Text>
      <View className={`w-full h-16 px-4 border-2 rounded-full items-center flex-row ${outerInput}`}>
        <TextInput
            className={`flex-1 font-semibold text-base text-gray-900 ${inputStyles}`}
            value={value}
            placeholder={placeholder}
            placeholderTextColor="#d1d5db"
            onChangeText={handleChangeText}
            secureTextEntry={shouldMask}
            {...props}
        />

        {title === 'Password' && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={1}>
            <Image source={!showPassword ? icons.eye : icons.eyeHide} className="w-6 h-6" resizeMode="contain" tintColor="#374151" />
          </TouchableOpacity>
        )}
        {title === 'Confirm Password' && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={1}>
            <Image source={!showPassword ? icons.eye : icons.eyeHide} className="w-6 h-6" resizeMode="contain" tintColor="#374151" />
          </TouchableOpacity>
        )}        

      </View>
    </View>
  )
  }

export default FormField