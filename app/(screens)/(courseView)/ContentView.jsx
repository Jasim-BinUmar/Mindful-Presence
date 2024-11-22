import React, { useState, useEffect } from 'react';

import { View, Text, Image } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

const ContentView = () => {
  // Dummy data object for testing
  const data = {
    title: 'Getting Started with React Native',
    content: 'This video tutorial will guide you through setting up your development environment and creating your first React Native app.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    imageUrl: '' // Left empty for this example
  };

  const { title, imageUrl, videoUrl, content } = data;
  const videoPlayer = useVideoPlayer(videoUrl, player => {
    player.loop = true;
    player.pause();
  });

  return (
    <View className="flex-1 p-4 bg-white">
      {title && (
        <Text className="text-2xl font-bold mb-4">{title}</Text>
      )}

      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          className="w-full h-48 rounded-lg mb-4"
          resizeMode="cover"
        />
      )}

      {videoUrl && (
        <View className="w-full aspect-video mb-4">
          <VideoView
            style={{ width: '100%', height: '100%' }}
            //source={{ uri: videoUrl }}
            player={videoPlayer} allowsFullscreen allowsPictureInPicture />
        </View>
      )}

      {content && (
        <Text className="text-base leading-relaxed">
          {content}
        </Text>
      )}

      {!title && !imageUrl && !videoUrl && !content && (
        <Text className="text-lg text-gray-500 italic">
          No content available
        </Text>
      )}
    </View>
  );
};

export default ContentView;

