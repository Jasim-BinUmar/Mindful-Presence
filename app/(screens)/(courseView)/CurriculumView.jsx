import { View, Text, ImageBackground, StatusBar, RefreshControl } from 'react-native';
import React, { useState, useCallback } from 'react';
import { ScrollView } from 'react-native';
import images from '../../../constants/images';
import { SafeAreaView } from 'react-native-safe-area-context';
import CourseContent from '../../../components/CourseContent';
import { useRouter } from 'expo-router';
import { setContent } from '../../../lib/globalContext';

const CurriculumView = () => {
  const router = useRouter();

  const handleSubmit = (id) => {
    setContent(id);
    router.push('/ContentView');
  };

  // Data array that holds all the information
  const data = [
    {
      title: "Be-Spoke For Muslim Women ",
      guideCards: [
        {
          title: "How Coping Techniques and Strategies Boost Your Well-being",
          buttonTitle: "Preview",
          handlePress: () => {
            handleSubmit('6741d662001089d62980');
          },
        },
        {
          title: "How To Use This App?",
          buttonTitle: "Preview",
          handlePress: () => {
            handleSubmit('6741d662001089d62980');
          },
        },
      ],
    },
    {
      title: "Daily Spiritual Visualisations",
      guideCards: [
        {
          title: "Visualise The Kaba",
          buttonTitle: "Start",
          handlePress: () => {
            handleSubmit('6742e3f900140a1d6f1b');
          },
        },
        {
          title: "Visualise Masjid Al Nabwi/Madinah ",
          buttonTitle: "Start",
          handlePress: () => {
            handleSubmit('6742e539001832a9c887');
          },
        },
      ],
    },
  ];

  // State for managing refresh
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    // Simulate fetching new data or performing some operation
    setTimeout(() => {
      setRefreshing(false);
    }, 2000); // Replace this with actual data-fetching logic
  }, []);

  return (
    <SafeAreaView className="h-full">
      <StatusBar backgroundColor="#161622" style="light" />
      <ScrollView
        className="flex-1 h-full"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View>
          <View className="mt-6 -mb-4">
            <Text className="font-bold text-2xl text-center mb-4">
              Understanding The Power Of Affirmations, Visualizations, And Meditation
            </Text>
          </View>
          <View>
            <ImageBackground
              source={images.fullGuide}
              className="min-w-[250px] min-h-[250px] flex-grow mx-5 my-2"
              imageStyle={{ borderRadius: 12 }}
            />
          </View>
          <View className="px-5 py-5 items-center justify-center">
            {data.map((content, index) => (
              <CourseContent
                key={index}
                title={content.title}
                guideCards={content.guideCards}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CurriculumView;
