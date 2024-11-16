import React from 'react';
import { View, Text, Image, Pressable, ImageBackground, FlatList, SafeAreaView, ScrollView } from 'react-native';
import images from '../../../constants/images';
import { icons } from '../../../constants';
import CustomButton from '../../../components/CustomButton';
import ContentCard from '../../../components/ContentCard';
import { router, useRouter } from 'expo-router';

export default function Component() {
  const router = useRouter(); // Get router instance

  const contentCardData = [
    { id: '1', image: images.contentCard1, title: 'Daily Meditative Practices Morning or Evening' },
    { id: '2', image: images.contentCard1, title: 'Daily Meditative Practices Morning or Evening' },
    { id: '3', image: images.contentCard1, title: 'Daily Meditative Practices Morning or Evening' },
    { id: '4', image: images.contentCard1, title: 'Daily Meditative Practices Morning or Evening' },
    { id: '5', image: images.contentCard1, title: 'Additional Card 1' },
    { id: '6', image: images.contentCard1, title: 'Additional Card 2' },
  ];

  const renderContentCard = ({ item }) => (
    <ContentCard
      image={item.image}
      customStyles=""
      title={item.title}
    />
  );

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1">
        <View className="flex-1">
          <ImageBackground
            source={images.mainBg}
            className="min-h-[320px] items-center justify-center pb-5"
          >
            <View className="flex flex-row m-4 w-full justify-end mt-5">
              <Pressable onPress={() => {router.push('../(profile)/profile')}}>
                <Image source={icons.profile} className="w-6 h-6 mr-6" resizeMode="contain" />
              </Pressable>
            </View>

            <View className="w-full flex flex-col items-center justify-center mt-5">
              <Text className="text-secondary-100 min-w-[350px] text-2xl text-center font-medium">
                Understanding The Power Of Well-being Tools, Techniques & Strategies in your daily life
              </Text>
              <CustomButton
                title="Full Guide"
                handlePress={() => { router.push('../(guide)/FullGuide') }}
                containerStyles="bg-primary min-w-[350px] rounded-full mt-5 border-2 border-gray-500"
                textStyles="text-lg font-bold text-secondary"
              />
            </View>
          </ImageBackground>

          <View className="flex-1 bg-secondary rounded-t-3xl pt-8 -mt-5">
            <Text className="text-lg font-semibold ml-5 mb-4">Mindfulness Resources</Text>

            <FlatList
              data={contentCardData}
              renderItem={renderContentCard}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 20 }}
              scrollEnabled={false}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}