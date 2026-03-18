import { View, Text, Switch } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import StandardHeader from '../../../components/StandardHeader';
import { useGlobalContext } from '../../../lib/globalContext';

export default function profileSettings() {
  const { showRecommendations, setShowRecommendations } = useGlobalContext();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StandardHeader title="Settings" />
      <View className="flex-1 p-4">
        <View className="flex-row items-center justify-between px-4 py-5 m-2 bg-gray-50 rounded-full border border-gray-100">
          <Text className="text-base font-medium flex-1 mr-4">
            Show personalized recommendations
          </Text>
          <Switch
            value={showRecommendations}
            onValueChange={setShowRecommendations}
            trackColor={{ false: '#d1d5db', true: '#623AD9' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
