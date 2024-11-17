import React, { useState, useEffect } from 'react';
import { View, Text, StatusBar, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video } from 'expo-av';



const VideoContent = ({ videoUrl, content }) => (
    <View>
      <Video
        source={{ uri: videoUrl }}
        // rate={1.0}
        // volume={1.0}
        // isMuted={false}
        // resizeMode="contain"
        // shouldPlay={false}
        // isLooping={false}
        // style={styles.video}
        useNativeControls
      />
      <Text style={[styles.contentText, styles.videoText]}>{content}</Text>
    </View>
  );
export default VideoContent;