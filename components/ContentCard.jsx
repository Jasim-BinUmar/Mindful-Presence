import { View, Text, ImageBackground, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { icons } from '../constants';
import { Heart } from 'lucide-react-native';

const ContentCard = ({ image, customStyles, title, onPress, badge, price, isFavorite, onFavoritePress }) => {
  const handleImageError = (error) => {
    if (__DEV__) {
      console.error('❌ ContentCard image load error:', {
        image,
        error: error.nativeEvent?.error || error,
        imageType: typeof image,
        isUri: typeof image === 'object' && image?.uri
      });
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1"
      activeOpacity={0.9}
    >
      <ImageBackground
        source={typeof image === 'string' ? { uri: image } : image}
        className="min-w-[250px] min-h-[250px] flex-grow mx-5 my-2 overflow-hidden shadow-lg"
        imageStyle={{ borderRadius: 24 }}
        onError={handleImageError}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '60%',
            borderRadius: 24,
          }}
        />

        {/* Favorite/Heart Icon - Top Right */}
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            if (onFavoritePress) onFavoritePress();
          }}
          className="absolute top-4 right-4 z-10 p-2 bg-black/20 rounded-full border border-white/20 backdrop-blur-md"
        >
          <Heart
            size={20}
            color={isFavorite ? "#FF4B4B" : "#FFFFFF"}
            fill={isFavorite ? "#FF4B4B" : "transparent"}
          />
        </TouchableOpacity>

        {/* Badge for recommended courses */}
        {badge && (
          <View className="absolute top-4 left-4 bg-primary/90 px-3 py-1 rounded-full shadow-sm">
            <Text className="text-white text-[10px] font-black uppercase tracking-widest">{badge}</Text>
          </View>
        )}

        {/* Price Tag */}
        <View className={`absolute bottom-16 right-4 px-3 py-1 rounded-full border border-white/20 ${price === 'ENROLLED' ? 'bg-green-500/80' : 'bg-black/60'}`}>
          <Text className="text-white text-[10px] font-black uppercase tracking-wider">
            {price === 'ENROLLED' ? 'ENROLLED' : (typeof price === 'string' ? price : (price > 0 ? `$${price}` : 'FREE'))}
          </Text>
        </View>

        <View className="absolute bottom-0 left-0 right-0 p-5">
          <Text className="text-white font-black text-xl mb-1 shadow-sm" numberOfLines={2}>
            {title}
          </Text>
          <View className="flex-row items-center">
            <View className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2" />
            <Text className="text-white/70 text-xs font-bold uppercase tracking-widest">Active Course</Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

export default ContentCard;
