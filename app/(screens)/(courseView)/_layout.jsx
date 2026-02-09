import * as React from 'react';
import { Stack } from 'expo-router';

export default function CourseViewLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CourseDetails" />
      <Stack.Screen name="CurriculumView" />
      <Stack.Screen name="ContentView" />
      <Stack.Screen name="VideoPlayer" />
      <Stack.Screen name="QuizView" />
      <Stack.Screen name="LessonView" />
    </Stack>
  );
}
