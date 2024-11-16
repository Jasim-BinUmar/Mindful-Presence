import { View, Text } from 'react-native';
import React from 'react';
import GuideCard from '../components/GuideCard';

const CourseContent = ({ title, guideCards }) => {
  return (
    <View className='bg-secondary-100 flex-1 items-center justify-start w-full min-h-60 border-2 border-gray-300 rounded-2xl pb-3 mt-3'>
      {/* Main Title */}
      <Text className='mt-5 mb-5 font-semibold text-xl'>{title}</Text>
      <View className='mx-4'>
        {guideCards && guideCards.map((guide, index) => (
          <GuideCard
            key={index} // Unique key for each GuideCard
            title={guide.title}
            buttonTitle={guide.buttonTitle}
            handlePress={guide.handlePress}
          />
        ))}
      </View>
    </View>
  );
}

export default CourseContent;
