import { View, Text, StatusBar, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import api from '../../../services/api';
import { normalizeMediaUrl, getVideoSource } from '../../../utils/imageUtils';

const VideoPlayer = () => {
  const router = useRouter();
  const { lessonId, blockId, courseId } = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [block, setBlock] = useState(null);
  const [error, setError] = useState(null);
  const [videoStatus, setVideoStatus] = useState({});
  const videoRef = React.useRef(null);

  const fetchVideoContent = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.courses.getBlock(blockId);
      console.log('Video block data response:', response);
      
      // Handle different response structures
      let blockData = null;
      if (response?.success && response?.data) {
        blockData = response.data;
      } else if (response?.data) {
        blockData = response.data;
      } else if (response && typeof response === 'object' && !response.success) {
        blockData = response;
      }
      
      console.log('Extracted block data:', blockData);
      console.log('Block type:', blockData?.blockType);
      console.log('Block content:', blockData?.content);
      console.log('Video URL:', blockData?.content?.videoUrl || blockData?.content?.url);
      
      if (!blockData) {
        throw new Error('Block data not found in response');
      }
      
      setBlock(blockData);
    } catch (err) {
      console.error('Error fetching video:', err);
      setError(err.message || 'Failed to load video');
    } finally {
      setLoading(false);
    }
  }, [blockId]);

  useEffect(() => {
    if (blockId) {
      fetchVideoContent();
    }
  }, [blockId, fetchVideoContent]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <StatusBar backgroundColor="#000000" style="light" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#623AD9" />
          <Text className="text-white mt-4">Loading video...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !block) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <StatusBar backgroundColor="#000000" style="light" />
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-red-500 text-lg font-semibold mb-2">Error</Text>
          <Text className="text-white text-center mb-4">{error || 'Video not found'}</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-primary px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Try multiple possible locations for video URL
  const rawVideoUrl = block.content?.videoUrl || 
                      block.content?.url || 
                      block.content?.video?.url ||
                      block.videoUrl ||
                      block.url;
  
  // Normalize the video URL to handle uploads folder paths
  const videoUrl = normalizeMediaUrl(rawVideoUrl);
  
  const videoTitle = block.title || 
                     block.content?.title || 
                     block.content?.heading ||
                     'Video Lesson';
  
  const videoDescription = block.content?.description || block.description;
  const transcript = block.content?.transcript;
  
  console.log('Video Player - Final extracted data:', {
    videoUrl,
    videoTitle,
    hasDescription: !!videoDescription,
    hasTranscript: !!transcript,
    blockType: block.blockType
  });

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar backgroundColor="#000000" style="light" />
      
      <ScrollView className="flex-1">
        {/* Video Player */}
        <View className="bg-black">
          {videoUrl ? (
            <Video
              ref={videoRef}
              source={{ uri: videoUrl }}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              isLooping={false}
              onPlaybackStatusUpdate={status => setVideoStatus(() => status)}
              onError={(error) => {
                console.error('Error loading video:', videoUrl, error);
              }}
              style={{ width: '100%', height: 250 }}
            />
          ) : (
            <View className="w-full h-64 bg-gray-800 justify-center items-center">
              <Text className="text-white text-center px-4">
                Video URL not available
              </Text>
            </View>
          )}
        </View>

        {/* Video Info */}
        <View className="bg-white p-5">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mb-4"
          >
            <Text className="text-primary font-semibold">← Back to Course</Text>
          </TouchableOpacity>

          <Text className="text-gray-800 font-bold text-xl mb-3">
            {videoTitle}
          </Text>

          {videoDescription && (
            <View className="mb-4">
              <Text className="text-gray-700 text-base leading-6">
                {videoDescription}
              </Text>
            </View>
          )}

          {block.content?.duration && (
            <View className="bg-gray-100 px-3 py-2 rounded-lg self-start mb-4">
              <Text className="text-gray-700 text-sm">
                ⏱️ Duration: {Math.floor(block.content.duration / 60)}:{String(block.content.duration % 60).padStart(2, '0')}
              </Text>
            </View>
          )}

          {/* Transcript Section */}
          {transcript && (
            <View className="mt-4 border-t border-gray-200 pt-4">
              <Text className="text-gray-800 font-bold text-lg mb-3">
                📝 Transcript
              </Text>
              <Text className="text-gray-700 text-base leading-6">
                {transcript}
              </Text>
            </View>
          )}

          {/* Additional Resources */}
          {block.content?.resources && Array.isArray(block.content.resources) && block.content.resources.length > 0 && (
            <View className="mt-4 border-t border-gray-200 pt-4">
              <Text className="text-gray-800 font-bold text-lg mb-3">
                📚 Additional Resources
              </Text>
              {block.content.resources.map((resource, index) => (
                <View key={index} className="bg-gray-50 p-3 rounded-lg mb-2">
                  <Text className="text-gray-800 font-semibold">{resource.title}</Text>
                  {resource.description && (
                    <Text className="text-gray-600 text-sm mt-1">{resource.description}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VideoPlayer;

