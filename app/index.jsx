import { View, Text, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from "../constants"
import CustomSpinner from '../components/CustomSpinner'
import { router, Redirect } from "expo-router";
import { useGlobalContext } from '../lib/globalContext';

const Index = () => {
  const [isLoading, setIsLoading] = useState(true)
  const { isAuthenticated, isLoading: authLoading } = useGlobalContext();

  
  useEffect(() => {
    // Wait for auth check to complete
    if (authLoading) {
      return;
    }

    // Show spinner briefly, then redirect based on auth status
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (isAuthenticated) {
        router.replace('/(screens)/(home)/Home');
      } else {
        router.replace('/(auth)/userAuthScreen');
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, authLoading])

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