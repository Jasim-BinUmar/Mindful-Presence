import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, ActivityIndicator, ScrollView, StatusBar, RefreshControl } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { getContent } from '../../../lib/appWrite'; // Adjust the import path as needed
import { getContentId } from '../../../lib/globalContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const ContentView = () => {
  const id = getContentId;
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [VideoUrl, setVideoUrl] = useState('');
  const [refreshing, setRefreshing] = useState(false); // For refresh control

  // Initialize the video player hook unconditionally
  const videoPlayer = useVideoPlayer(VideoUrl || '', (player) => {
    player.loop = true;
    player.pause();
  });

  const fetchContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedContent = await getContent(id);
      setContent(fetchedContent);
      setVideoUrl(fetchedContent?.videoUrl || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Refresh handler for pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchContent();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchContent();
  }, []);

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-red-500 text-lg">Error: {error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar backgroundColor="#161622" style="dark" />
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex-1 p-4 bg-white">
          {content?.title && (
            <Text className="text-xl font-bold mb-4">{content.title}</Text>
          )}

          {content?.imageUrl && (
            <Image
              source={{ uri: content.imageUrl }}
              className="w-full h-48 rounded-lg mb-4"
              resizeMode="cover"
            />
          )}

          {VideoUrl && (
            <View className="w-full aspect-video mb-4">
              <VideoView
                style={{ width: '100%', height: '100%' }}
                player={videoPlayer}
                allowsFullscreen
                allowsPictureInPicture
              />
            </View>
          )}

          {content?.content && (
            <Text className="text-base leading-6">{content.content}</Text>
          )}

          {!content && (
            <Text className="text-gray-500 italic">No content available</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ContentView;
