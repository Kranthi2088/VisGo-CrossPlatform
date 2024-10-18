import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StatusBar,
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen'; // Import SplashScreen
import { useFonts, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';

SplashScreen.preventAutoHideAsync(); // Keep the splash screen visible

const ProfilePage = () => {
  const [isReady, setIsReady] = useState(false); // Track whether fonts are loaded

  // Load the fonts
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      if (fontsLoaded) {
        await SplashScreen.hideAsync(); // Hide the splash screen once everything is ready
        setIsReady(true); // Set the state to ready
      }
    }
    prepare();
  }, [fontsLoaded]);

  if (!isReady) {
    // Return null while the splash screen is visible
    return null;
  }

  // Your UI code starts here
  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Image
        source={require('../../assets/images/splash.png')}
        style={styles.coverPhoto}
      />
      <View style={styles.profileContainer}>
        <Image
          source={require('../../assets/images/new.jpg')}
          style={styles.profilePhoto}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>Kranthi Kumar</Text>
          <Text style={styles.userHandle}>@kranthi._.</Text>
          <Text style={styles.userBio}>
            Photographer
          </Text>
        </View>
      </View>
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>404</Text>
          <Text style={styles.statLabel}>posts</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>1.6k</Text>
          <Text style={styles.statLabel}>likes</Text>
        </View>
        <TouchableOpacity style={styles.likeButton}>
          <Text style={styles.likeButtonText}>Like</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  coverPhoto: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginTop: -50,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  userInfo: {
    marginLeft: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userHandle: {
    fontSize: 16,
    color: 'gray',
  },
  userBio: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: 'gray',
  },
  likeButton: {
    backgroundColor: '#4A4AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  likeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ProfilePage;
