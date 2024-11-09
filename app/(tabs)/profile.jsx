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
import * as FileSystem from "expo-file-system"; // Import expo-file-system
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { useRouter } from "expo-router";
import { auth, db } from "../../configs/FirebaseConfig";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"; 
import { MaterialCommunityIcons } from "@expo/vector-icons";
import MasonryList from "react-native-masonry-list";

const IMAGE_MARGIN = 10;

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
    console.log("Navigating to post details with:", post);
    router.push({
      pathname: "../postdetails",
      params: {
        postId: post.id,
        username: userData.username,
        profilePhoto: userData.profilePhoto,
        imageUrl: post.cachedImageUrl,
        description: post.description, // Add other fields as needed
      },
    });
  };
  
  


  // Utility function to download and cache images locally
  const downloadAndCacheImage = async (url) => {
    try {
      const filename = url.split("/").pop(); // Extract the file name from the URL
      const path = `${FileSystem.cacheDirectory}${filename}`; // Set the cache path

      const fileInfo = await FileSystem.getInfoAsync(path);
      if (fileInfo.exists) {
        console.log("Using cached image:", path);
        return fileInfo.uri; // Return cached path if exists
      }

      console.log("Downloading image:", url);
      const { uri } = await FileSystem.downloadAsync(url, path); // Download and cache the image
      return uri; // Return the downloaded path
    } catch (error) {
      console.error("Error caching image:", error);
      return url; // Return original URL as fallback
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
      {/* Cover Photo */}
      <Image source={{ uri: userData.coverPhoto }} style={styles.coverPhoto} />
      {/* Profile Info */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image source={{ uri: userData.profilePhoto }} style={styles.profilePhoto} />
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
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          <Image
            source={
              userData.profilePhoto
                ? { uri: userData.profilePhoto }
                : { uri: "https://picsum.photos/200/200" }
            }
            style={styles.profileImage}
          />
          <View style={{ marginLeft: 25, flex: 1, marginTop: 10 }}>
            <Text style={styles.username}>{userData.username || "Username"}</Text>
            <Text style={styles.bio}>{userData.bio || "Bio goes here..."}</Text>
          </View>
        </View>
  
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="calendar" size={24} color="black" />
            <Text style={styles.infoText}>{userData.dateOfBirth || "Date of Birth"}</Text>
          </View>
  
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="map-marker" size={24} color="black" />
            <Text style={styles.infoText}>{userData.address || "Address"}</Text>
          </View>
        </View>
  
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push("../edit-profile")}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

      {/* Photos Grid Section */}
      {loading ? (
        <Text style={styles.noPhotosText}>Loading photos...</Text>
      ) : uploadedPhotos.length > 0 ? (
        <MasonryList
  images={uploadedPhotos.map((post) => ({
    uri: post.cachedImageUrl,
    data: post,
  }))}
  columns={2}
  spacing={0.5}
  imageContainerStyle={styles.photoContainer}
  onPressImage={(item) => navigateToPostDetails(item.data)}
/>
      ) : (
        <Text style={styles.noPhotosText}>No photos to display</Text>
      )}
    </ScrollView>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  coverPhoto: { width, height: 200, resizeMode: "cover" },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    marginHorizontal: 25,
  },
  stat: {
    alignItems: "center",
    justifyContent: "space-around",
    marginHorizontal: 15,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 90,
    borderWidth: 3,
    borderColor: "#fff",
    marginTop: -40,
    marginLeft: 20,
  },
  username: {
    fontFamily: "Poppins_700Bold",
    fontSize: 24,
    color: "#000",
    marginBottom: 5,
  },
  bio: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#666",
    marginBottom: -45,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "80%",
    marginLeft: 15,
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10, // Spacing between items
  },
  infoText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    color: "#000",
    marginLeft: 5, 
  },
  editButton: {
    backgroundColor: "#000",
    borderRadius: 10,
    paddingVertical: 15,
    marginHorizontal: 20,
    alignItems: "center",
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  statsContainer: { flexDirection: "row", marginVertical: 10 },
  stat: { alignItems: "center", marginHorizontal: 15 },
  noPhotosText: { textAlign: "center", marginTop: 20, fontSize: 18, color: "#666" },
  photoContainer: { marginBottom: IMAGE_MARGIN, overflow: "hidden", marginTop: 10 },
});

export default ProfileScreen;

