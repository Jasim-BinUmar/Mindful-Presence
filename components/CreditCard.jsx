import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const CreditCard = ({ cardHolder, lastFour , expiry}) => {
  return (
    <LinearGradient
      colors={['#9368DD', '#483AAF']}
      start={[0, 0]}
      end={[1, 1]}
      className='w-72 h-44 rounded-lg p-4 justify-between'
    >
      {/* Card Top Row */}
      <View className='flex-row justify-between'>
        <Text className='text-white font-bold text-lg'>
          VISA
        </Text>
      </View>

      {/* Card Number */}
      <View className='flex-row justify-between items-center'>
        <Text className='text-white text-3xl font-semibold'>
          •••• •••• ••••
        </Text>
        <Text className='text-white text-2xl font-semibold'>
          {lastFour}
        </Text>
      </View>

      {/* Card Holder and Expiry Date */}
      <View className='flex-row justify-between items-center mt-4'>
        <View>
          <Text className='text-white text-xs'>CARD HOLDER</Text>
          <Text className='text-white font-bold text-sm'>{cardHolder}</Text>
        </View>
        <View>
          <Text className='text-white text-xs'>EXPIRES</Text>
          <Text className='text-white font-bold text-sm'>{expiry}</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

export default CreditCard;
