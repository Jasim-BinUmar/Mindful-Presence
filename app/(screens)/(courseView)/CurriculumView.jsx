import { View, Text, Image, ImageBackground, StatusBar } from 'react-native';
import React from 'react';
import { ScrollView } from 'react-native';
import images from '../../../constants/images';
import { SafeAreaView } from 'react-native-safe-area-context';
import CourseContent from '../../../components/CourseContent';
import { router } from 'expo-router';


// router.replace('/(auth)/userAuthScreen'); 

const CurriculumView = () => {
  // Data array that holds all the information
  const data = [
    {
      title: "Daily Quizzes",
      guideCards: [
        { title: "Daily Introspection - Journaling - Achievements", buttonTitle: "Start", handlePress: () => {router.push('/ContentView')} },
        { title: "Daily 5 Sense Quiz (Daily Journaling)", buttonTitle: "Start", handlePress: () => console.log("Guide 2 pressed") },
        { title: "Daily Forgiveness Quiz", buttonTitle: "Start", handlePress: () => console.log("Guide 3 pressed") },
        { title: "My Expression Corner", buttonTitle: "Start", handlePress: () => console.log("Guide 4 pressed") }
      ]
    },
  ];

  return (
    <SafeAreaView className='h-full'>
      <StatusBar backgroundColor="#161622" style="light" />
      <ScrollView className="flex-1 h-full">
        <View >
          <View className="mt-6 -mb-4 ">
            <Text className='font-bold text-2xl text-center mb-4'>Understanding The Power Of Affirmations, Visualizations, And Meditation</Text>
          </View>
          <View>
            <ImageBackground
              source={images.fullGuide}
              className="min-w-[250px] min-h-[250px] flex-grow mx-5 my-2 "
              imageStyle={{ borderRadius: 12 }}
            ></ImageBackground>
          </View>
          <View className='px-5 py-5 items-center justify-center'>
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
}

export default CurriculumView;
