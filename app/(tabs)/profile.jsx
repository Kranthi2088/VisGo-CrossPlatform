import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ScrollView,
  Alert,
  RefreshControl,
  Image,
} from "react-native";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { auth, db } from "../../configs/FirebaseConfig";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import MasonryList from "react-native-masonry-list";

const IMAGE_MARGIN = 10;
const { width } = Dimensions.get("window");

const ProfileScreen = () => {
  const router = useRouter();
  const user = auth.currentUser;

  const [userData, setUserData] = useState({
    username: "",
    email: "",
    bio: "",
    profilePhoto: "",
    coverPhoto: "",
  });

  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const navigateToPostDetails = (post) => {
    router.push({
      pathname: "../postdetails",
      params: {
        postId: post.id,
        username: userData.username,
        profilePhoto: userData.profilePhoto,
        imageUrl: post.cachedImageUrl,
        description: post.description,
        postdata: post,
      },
    });
  };

  const downloadAndCacheImage = async (url) => {
    try {
      const filename = url.split("/").pop();
      const path = `${FileSystem.cacheDirectory}${filename}`;

      const fileInfo = await FileSystem.getInfoAsync(path);
      if (fileInfo.exists) {
        return fileInfo.uri;
      }

      const { uri } = await FileSystem.downloadAsync(url, path);
      return uri;
    } catch (error) {
      console.error("Error caching image:", error);
      return url;
    }
  };

  const storeData = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error storing data:", error);
    }
  };

  const getData = async (key) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Error retrieving data:", error);
    }
  };

  const fetchUserData = async () => {
    if (user) {
      try {
        const cachedUserData = await getData("userData");
        if (cachedUserData) setUserData(cachedUserData);

        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          const profilePhoto = await downloadAndCacheImage(data.profilePhoto);
          const coverPhoto = await downloadAndCacheImage(data.coverPhoto);

          const updatedData = {
            ...data,
            profilePhoto,
            coverPhoto,
          };

          setUserData(updatedData);
          await storeData("userData", updatedData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "Failed to fetch user data");
      }
    }
  };

  const fetchUserPosts = async () => {
    if (user) {
      try {
        const cachedPhotos = await getData("userPosts");
        if (cachedPhotos) setUploadedPhotos(cachedPhotos);
  
        const postsQuery = query(
          collection(db, "posts"),
          where("userId", "==", user.uid)
        );
  
        const querySnapshot = await getDocs(postsQuery);
        const photos = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const data = doc.data();
            const cachedImageUrl = await downloadAndCacheImage(data.imageUrl);
            return {
              id: doc.id,
              ...data,
              cachedImageUrl,
            };
          })
        );
  
        setUploadedPhotos(photos);
        await storeData("userPosts", photos);
      } catch (error) {
        console.error("Error fetching user posts:", error);
        Alert.alert("Error", "Failed to fetch user posts");
      }
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await fetchUserData();
      await fetchUserPosts();
    } catch (error) {
      console.error("Error refreshing data:", error);
      Alert.alert("Error", "Failed to refresh data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <StatusBar hidden />
      <Image source={{ uri: userData.coverPhoto }} style={styles.coverPhoto} />
      <View style={styles.profileSection}>
        <Image source={{ uri: userData.profilePhoto }} style={styles.profileImage} />
        <View style={styles.infoSection}>
          <Text style={styles.username}>{userData.username || "Username"}</Text>
          <Text style={styles.bio}>{userData.bio || "Bio goes here..."}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{uploadedPhotos.length}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>100</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>100</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
      </View>

      <View style={styles.buttonsContainer}>
      <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push("../edit-profile")}
        >
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push("../savedposts")}
        >
          <Text style={styles.buttonText}> Saved</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.noPhotosText}>Loading photos...</Text>
      ) : uploadedPhotos.length > 0 ? (
        <MasonryList
          images={uploadedPhotos.map((post) => ({
            uri: post.cachedImageUrl,
            data: post,
          }))}
          columns={2}
          spacing={1}
          imageContainerStyle={styles.photoContainer}
          onPressImage={(item) => navigateToPostDetails(item.data)}
        />
      ) : (
        <Text style={styles.noPhotosText}>No photos to display</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  coverPhoto: { width: "100%", height: 200, resizeMode: "cover" },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -50,
    paddingHorizontal: 20,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "#fff",
  },
  infoSection: { marginLeft: 20, flex: 1 },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  bio: {
    fontSize: 14,
    color: "#666",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 15,
  },
  stat: { alignItems: "center" },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  savedPostsButton: {
    backgroundColor: "#1DA1F2",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  noPhotosText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 18,
    color: "#666",
  },
  photoContainer: {
    marginBottom: IMAGE_MARGIN,
    borderRadius: 8,
  },
});

export default ProfileScreen;
