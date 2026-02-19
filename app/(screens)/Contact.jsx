import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import StandardHeader from '../../components/StandardHeader'
import { Mail, Phone, MessageCircle } from 'lucide-react-native'

const Contact = () => {
  const contactOptions = [
    { icon: Phone, title: 'Call Us', detail: '+1 (234) 567-890', action: () => Linking.openURL('tel:+1234567890') },
    { icon: Mail, title: 'Email Us', detail: 'support@mindfulpresence.com', action: () => Linking.openURL('mailto:support@mindfulpresence.com') },
    { icon: MessageCircle, title: 'WhatsApp', detail: 'Chat with our team', action: () => Linking.openURL('whatsapp://send?phone=1234567890') },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StandardHeader title="Contact Us" centeredTitle={true} />
      <ScrollView className="flex-1 px-6 pt-8">
        <Text className="text-3xl font-black text-black-200 mb-2">Get in Touch</Text>
        <Text className="text-gray-500 text-base mb-8">
          We're here to help you on your journey. Reach out to us through any of these channels.
        </Text>

        {contactOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            onPress={option.action}
            className="flex-row items-center bg-gray-50 p-5 rounded-2xl mb-4 border border-gray-100"
          >
            <View className="bg-primary/10 p-3 rounded-xl mr-4">
              <option.icon size={24} color="#623AD9" />
            </View>
            <View>
              <Text className="text-sm text-gray-500 font-medium">{option.title}</Text>
              <Text className="text-base font-bold text-black-200">{option.detail}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View className="mt-8 p-6 bg-primary rounded-3xl items-center">
          <Text className="text-white text-xl font-bold mb-2">Need immediate help?</Text>
          <Text className="text-white/80 text-center text-sm mb-4">
            Our support team is available 24/7 for urgent consultations.
          </Text>
          <TouchableOpacity
            className="bg-white px-8 py-3 rounded-full"
            onPress={() => Linking.openURL('tel:+1234567890')}
          >
            <Text className="text-primary font-black">Call Support Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Contact