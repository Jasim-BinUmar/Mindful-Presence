import React, { useState, useEffect } from 'react';
import { View, Text, StatusBar, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video } from 'expo-av';
// import * as FileSystem from 'expo-file-system';
// import * as Sharing from 'expo-sharing';
import VideoContent from '../../../components/VideoContent'
import { ChevronLeft } from 'lucide-react-native';

// Assuming you're using React Navigation
// import { useNavigation } from '@react-navigation/native';

// Text content component
const TextContent = ({ content }) => (
  <Text style={styles.contentText}>{content}</Text>
);

// Video content component
// const VideoContent = ({ videoUrl, content }) => (
//   <View>
//     <Video
//       source={{ uri: videoUrl }}
//       rate={1.0}
//       volume={1.0}
//       isMuted={false}
//       resizeMode="contain"
//       shouldPlay={false}
//       isLooping={false}
//       style={styles.video}
//       useNativeControls
//     />
//     <Text style={[styles.contentText, styles.videoText]}>{content}</Text>
//   </View>
// );

// PDF content component
const PDFContent = ({ pdfUrl, title }) => {
  const downloadPDF = async () => {
    //   try {
    //     const { uri } = await FileSystem.downloadAsync(
    //       pdfUrl,
    //       FileSystem.documentDirectory + 'document.pdf'
    //     );
    //     await Sharing.shareAsync(uri);
    //   } catch (error) {
    //     console.error('Error downloading PDF:', error);
    //   }
  };

  return (
    <TouchableOpacity onPress={downloadPDF} style={styles.pdfButton}>
      <Text style={styles.pdfButtonText}>Download {title}</Text>
    </TouchableOpacity>
  );
};

const ContentView = () => {
  const [contentData, setContentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const dummyData = [
    // {
    //   id: '1',
    //   type: 'text',
    //   title: 'Introduction to React Native',
    //   content: 'React Native is an open-source mobile application development framework created by Facebook. It is used to develop applications for Android, iOS, Web and UWP by enabling developers to use React along with native platform capabilities.'
    // },
    {
      id: '2',
      type: 'video',
      title: 'Getting Started with React Native',
      content: 'This video tutorial will guide you through setting up your development environment and creating your first React Native app.',
      videoUrl: 'https://example.com/react-native-tutorial.mp4'
    },
    // {
    //   id: '3',
    //   type: 'pdf',
    //   title: 'React Native Cheat Sheet',
    //   content: 'Download our comprehensive React Native cheat sheet for quick reference on components, APIs, and best practices.',
    //   pdfUrl: 'https://example.com/react-native-cheatsheet.pdf'
    // }
  ];

  // const navigation = useNavigation();

  useEffect(() => {
    setContentData(dummyData);

    const fetchContent = async () => {
      // try {
      //   // Replace with your actual API endpoint
      //   const response = await fetch('https://api.example.com/content');
      //   const data = await response.json();
      //   setContentData(data);
      // } catch (err) {
      //   setError('Failed to fetch content. Please try again later.');
      // } finally {
      //   setIsLoading(false);
      // }
    };

    // fetchContent();
  }, []);

  const goBack = () => {
    // navigation.navigate('CurriculumView');
  };

  // if (isLoading) {
  //   return (
  //     <SafeAreaView style={styles.loadingContainer}>
  //       <ActivityIndicator size="large" color="#0000ff" />
  //     </SafeAreaView>
  //   );
  // }

  // if (error) {
  //   return (
  //     <SafeAreaView style={styles.errorContainer}>
  //       <Text style={styles.errorText}>{error}</Text>
  //     </SafeAreaView>
  //   );
  // }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#161622" barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* {contentData && contentData.title && (
          <Text className="text-black text-2xl font-semibold ml-4">
            {contentData.title}
          </Text>
        )} */}
        {contentData && contentData.map((data) => (

          <View key={data.id}>
            <Text style={styles.title}>{data.title}</Text>

            {data.type === 'text' && <TextContent content={data.content} />}

            {data.type === 'video' && data.videoUrl && (
              <VideoContent videoUrl={data.videoUrl} content={data.content} />
            )}

            {data.type === 'pdf' && data.pdfUrl && (
              <PDFContent pdfUrl={data.pdfUrl} title={data.title} />
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  backButton: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black',
  },
  contentText: {
    fontSize: 16,
    color: 'black',
  },
  video: {
    width: 300,
    height: 200,
    alignSelf: 'center',
  },
  videoText: {
    marginTop: 10,
  },
  pdfButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  pdfButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
};

export default ContentView;