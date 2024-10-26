import axios from 'axios';
import React, { useState } from 'react';
import { Alert, Button, PermissionsAndroid, Platform, TextInput, View } from 'react-native';
import RNFS from 'react-native-fs';

const VideoDownloader = () => {
  const [url, setUrl] = useState('');

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to your storage to download videos',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      return true;
    }
  };

  const getApiEndpoint = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return '/youtube';  // API endpoint for YouTube
    } else if (url.includes('twitter.com')) {
      return '/twitter';  // API endpoint for Twitter
    } else if (url.includes('facebook.com')) {
      return '/facebook';  // API endpoint for Facebook
    } else if (url.includes('instagram.com')) {
      return '/instagram';  // API endpoint for Instagram
    } else {
      return null;
    }
  };

  const downloadVideo = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'You need to allow storage permission to download videos.');
      return;
    }

    const endpoint = getApiEndpoint(url);

    if (!endpoint) {
      Alert.alert('Invalid URL', 'The URL is not recognized as a valid YouTube, Twitter, Facebook, or Instagram link.');
      return;
    }

    try {
      const response = await axios.post("https://zylalabs.com/api/3219/youtube+mp4+video+downloader+api/5880/get+mp4", {
        urls: url,
      });

      const videoData = response.data.urls[0];
      const downloadPath = `${Platform.OS === 'android' ? RNFS.ExternalDirectoryPath : RNFS.DocumentDirectoryPath}/video.mp4`;

      const fileResponse = await axios.get(videoData.url, {
        responseType: 'arraybuffer',
      });

      await RNFS.writeFile(downloadPath, fileResponse.data, 'utf8');
      Alert.alert('Download complete!', `Video saved to ${downloadPath}`);
    } catch (error) {
      Alert.alert('Download failed', error.message);
      console.log(error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        style={{ borderColor: 'gray', borderWidth: 1, marginBottom: 10, padding: 5 }}
        placeholder="Enter video URL"
        value={url}
        onChangeText={setUrl}
      />
      <Button title="Download Video" onPress={downloadVideo} />
    </View>
  );
};

export default VideoDownloader;
