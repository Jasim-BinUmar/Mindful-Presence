import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

const QuestionOption = ({ title, isSelected, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`py-4 px-6 mb-4 rounded-full border-2 ${
        isSelected
          ? 'bg-white border-primary'
          : 'bg-white border-gray-300'
      }`}
      activeOpacity={0.7}
    >
      <Text
        className={`text-center text-lg font-semibold ${
          isSelected ? 'text-primary' : 'text-gray-600'
        }`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default QuestionOption;

