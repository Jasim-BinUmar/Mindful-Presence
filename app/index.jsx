import { View, Text, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from "../constants"
import CustomSpinner from '../components/CustomSpinner'


import { router, Redirect } from "expo-router";

// sample checout
const Index = () => {
  const [isLoading, setIsLoading] = useState(true)

  
  useEffect(() =>   {
    // Show spinner for 2 seconds when component mounts
    
      const timer =   setTimeout(() => {
        setIsLoading(false)
        // router.push('/(auth)/userAuthScreen');
        router.replace('/(screens)/(courseView)/ContentView')
      }, 300)
      return () => clearTimeout(timer)
 
    // Cleanup timer on unmount
    
  }, [])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#6A3DE8' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, width: 141, height: 141, justifyContent: 'center', alignItems: 'center' }}>
          <Image 
            source={images.logo} 
            style={{ width: 120, height: 78 }}
            resizeMode="contain"
          />
        </View>
        <View style={{ marginTop: 20 }}>
          <Text style={{ textAlign: 'center', fontWeight: 'normal', color: '#FFFFFF', fontSize: 32 }}>
            MINDFUL{'\n'}           
            PRESENCE
          </Text>
        </View>
        {isLoading && (
          <View style={{ position: 'absolute', bottom: 150 }}>
            <CustomSpinner />
          </View>
          
        )}
        
      </View>
    </SafeAreaView>
  )
}

export default Index