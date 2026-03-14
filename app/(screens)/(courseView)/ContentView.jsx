import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../../services/api';
import { normalizeMediaUrl, getImageSource } from '../../../utils/imageUtils';
import MarkdownText from '../../../components/MarkdownText';

const ContentView = () => {
  const router = useRouter();
  const { lessonId, blockId, courseId } = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [block, setBlock] = useState(null);
  const [error, setError] = useState(null);

  const fetchContent = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.courses.getBlock(blockId);
      console.log('Content block data:', response);
      setBlock(response.data || response);
    } catch (err) {
      console.error('Error fetching content:', err);
      setError(err.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  }, [blockId]);

  useEffect(() => {
    if (blockId) {
      fetchContent();
    }
  }, [blockId, fetchContent]);

  const renderContent = () => {
    if (!block) return null;

    const { blockType, content } = block;

    switch (blockType) {
      case 'heading':
        return (
          <View className="mb-6">
            <Text className="text-gray-900 font-bold text-3xl">
              {content?.heading || content?.text || block.title}
            </Text>
          </View>
        );

      case 'subheading':
        return (
          <View className="mb-4">
            <Text className="text-gray-800 font-bold text-2xl">
              {content?.subheading || content?.text || block.title}
            </Text>
          </View>
        );

      case 'text':
        return (
          <View className="mb-4">
            {block.title && (
              <Text className="text-gray-800 font-bold text-xl mb-3">
                {block.title}
              </Text>
            )}
            <MarkdownText content={content?.text || content?.body || content?.description} />
          </View>
        );

      case 'image':
        return (
          <View className="mb-6">
            {(() => {
              const imageUrl = content?.imageUrl || content?.url;
              const normalizedUrl = normalizeMediaUrl(imageUrl);
              
              if (normalizedUrl) {
                return (
                  <View>
                    <Image
                      source={{ uri: normalizedUrl }}
                      className="w-full h-64 rounded-lg"
                      resizeMode="cover"
                      onError={(error) => {
                        console.error('Error loading image:', normalizedUrl, error);
                      }}
                    />
                    {(content?.caption || content?.alt) && (
                      <Text className="text-gray-600 text-sm mt-2 text-center italic">
                        {content.caption || content.alt}
                      </Text>
                    )}
                  </View>
                );
              } else {
                return (
                  <View className="w-full h-64 bg-gray-200 rounded-lg justify-center items-center">
                    <Text className="text-gray-500">Image not available</Text>
                  </View>
                );
              }
            })()}
          </View>
        );

      default:
        return (
          <View className="mb-4">
            {block.title && (
              <Text className="text-gray-800 font-bold text-xl mb-3">
                {block.title}
              </Text>
            )}
            {content?.text ? (
              <MarkdownText content={content.text} />
            ) : null}
            {content?.description ? (
              <MarkdownText content={content.description} />
            ) : null}
          </View>
        );
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar style="dark" translucent />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#623AD9" />
          <Text className="text-gray-600 mt-4">Loading content...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !block) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar style="dark" translucent />
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-red-500 text-lg font-semibold mb-2">Error</Text>
          <Text className="text-gray-600 text-center mb-4">{error || 'Content not found'}</Text>
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

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" translucent />

      {/* Header */}
      <View className="bg-primary p-5">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-white font-semibold mb-2">← Back to Course</Text>
        </TouchableOpacity>
        {block.title && (
          <Text className="text-white font-bold text-xl">
            {block.title}
          </Text>
        )}
      </View>

      <ScrollView className="flex-1 px-5 py-6">
        {renderContent()}

        {/* Additional Information */}
        {block.content?.notes && (
          <View className="mt-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <Text className="text-blue-900 font-semibold mb-2">📌 Note:</Text>
            <Text className="text-blue-800">{block.content.notes}</Text>
          </View>
        )}

        {block.content?.keyPoints && Array.isArray(block.content.keyPoints) && block.content.keyPoints.length > 0 && (
          <View className="mt-6">
            <Text className="text-gray-800 font-bold text-lg mb-3">
              🔑 Key Points
            </Text>
            {block.content.keyPoints.map((point, index) => (
              <View key={index} className="flex-row mb-2">
                <Text className="text-primary font-bold mr-2">•</Text>
                <Text className="text-gray-700 flex-1">{point}</Text>
              </View>
            ))}
          </View>
        )}

        {block.content?.resources && Array.isArray(block.content.resources) && block.content.resources.length > 0 && (
          <View className="mt-6">
            <Text className="text-gray-800 font-bold text-lg mb-3">
              📚 Additional Resources
            </Text>
            {block.content.resources.map((resource, index) => (
              <View key={index} className="bg-gray-50 p-4 rounded-lg mb-3">
                <Text className="text-gray-800 font-semibold mb-1">
                  {resource.title || resource.name}
                </Text>
                {resource.description && (
                  <Text className="text-gray-600 text-sm">{resource.description}</Text>
                )}
                {resource.url && (
                  <Text className="text-primary text-sm mt-1">{resource.url}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Navigation Footer */}
      <View className="p-5 border-t border-gray-200">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-primary py-4 rounded-lg items-center"
        >
          <Text className="text-white font-semibold">Continue to Next Lesson</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ContentView;
