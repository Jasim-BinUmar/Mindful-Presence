import { View, Text, ImageBackground, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';

const ContentCard = ({ image, customStyles, title, onPress, badge }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1"
    >
      <ImageBackground
        source={typeof image === 'string' ? { uri: image } : image}
        className="min-w-[250px] min-h-[250px] flex-grow mx-5 my-2"
        imageStyle={{ borderRadius: 12 }}
      >
        <LinearGradient
          colors={['#623AD9', '#1E1E2D', '#232533']}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: '100%',
            opacity: 0.4,
            borderRadius: 12,
          }}
        />
        {/* Badge for recommended courses */}
        {badge && (
          <View className="absolute top-3 right-3 bg-yellow-500 px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-bold">{badge}</Text>
          </View>
        )}
        <View className="rounded-b-xl absolute bottom-0 left-0 right-0 h-[35%] justify-start items-start">
          {/* Background View for blur and opacity */}
          <View className="bg-primary h-[100%] absolute bottom-0 left-0 right-0 opacity-55 rounded-b-xl"></View>
          {/* Text Content */}
          <Text className="text-secondary-100 font-bold text-lg mx-5 my-2">
            {title}
          </Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

export default ContentCard;
