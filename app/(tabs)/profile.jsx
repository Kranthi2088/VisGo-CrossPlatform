import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  Image,
  ActivityIndicator,
  ScrollView,
  RefreshControl
} from "react-native";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { auth, db } from "../../configs/FirebaseConfig";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import MasonryList from "react-native-masonry-list";
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['VirtualizedLists should never be nested']);

const ProfileScreen = () => {
  const router = useRouter();
  const user = auth.currentUser;

  const [userData, setUserData] = useState({
    username: "",
    bio: "",
    profilePhoto: "",
    coverPhoto: "",
    followers: 0,
    following: 0,
  });

  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [textPosts, setTextPosts] = useState([]);
  const [selectedView, setSelectedView] = useState("imagePosts");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const navigateToPostDetails = (post) => {
    router.push({
      pathname: "../postdetails",
      params: {
        postId: post.id,
        username: userData.username,
        profilePhoto: userData.profilePhoto,
        textContent: post.textContent,
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

  const fetchUserData = async () => {
    if (user) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          const profilePhoto = await downloadAndCacheImage(data.profilePhoto);
          const coverPhoto = await downloadAndCacheImage(data.coverPhoto);

          setUserData({
            username: data.username || "Username",
            bio: data.bio || "No bio available",
            profilePhoto,
            coverPhoto,
            followers: data.followers ? data.followers.length : 0,
            following: data.following ? data.following.length : 0,
          });
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
        const postsQuery = query(
          collection(db, "posts"),
          where("userId", "==", user.uid)
        );

        const querySnapshot = await getDocs(postsQuery);
        const photos = [];
        const textOnly = [];
        
        await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const data = doc.data();
            if (data.imageUrl) {
              const cachedImageUrl = await downloadAndCacheImage(data.imageUrl);
              photos.push({
                id: doc.id,
                ...data,
                cachedImageUrl,
              });
            } else {
              textOnly.push({
                id: doc.id,
                ...data,
              });
            }
          })
        );

        setUploadedPhotos(photos);
        setTextPosts(textOnly);
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
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllData()
      .then(() => {
        setRefreshing(false);
      })
      .catch((error) => {
        console.error("Error refreshing data:", error);
        Alert.alert("Error", "Failed to refresh data");
        setRefreshing(false);
      });
  }

  return (
    <ScrollView style={styles.container}
    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <StatusBar hidden />

      {/* Cover Photo */}
      <Image source={{ uri: userData.coverPhoto }} style={styles.coverPhoto} />
      
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image source={{ uri: userData.profilePhoto }} style={styles.profileImage} />
        <View style={styles.infoSection}>
          <Text style={styles.username}>{userData.username}</Text>
          <Text style={styles.bio}>{userData.bio}</Text>
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{userData.followers ?? 0}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.stat}>
        <Text style={styles.statNumber}>{userData.following ?? 0}</Text>
        <Text style={styles.statLabel}>Following</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{uploadedPhotos.length}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.editButton}
          onPress={() => router.push("edit-profile")}>
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editButton}
          onPress={() => router.push("savedposts") }>
          <Text style={styles.buttonText}>Saved</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity onPress={() => setSelectedView("imagePosts")}>
          <Text style={selectedView === "imagePosts" ? styles.activeTab : styles.inactiveTab}>Grid</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedView("textPosts")}>
          <Text style={selectedView === "textPosts" ? styles.activeTab : styles.inactiveTab}>Text Posts</Text>
        </TouchableOpacity>
      </View>

      {/* Posts Content */}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : selectedView === "imagePosts" ? (
        <MasonryList
          images={uploadedPhotos.map((post) => ({
            uri: post.cachedImageUrl,
            data: post,
          }))}
          columns={3}
          spacing={1}
          imageContainerStyle={styles.photoContainer}
          onPressImage={(item) => navigateToPostDetails(item.data)}
        />
      ) : textPosts.length > 0 ? (
        textPosts.map((post) => (
          <TouchableOpacity key={post.id} onPress={() => navigateToPostDetails(post)}>
            <View style={styles.textPostContainer}>
              <Text style={styles.textPostContent}>{post.textContent}</Text>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.noPhotosText}>No text posts to display</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  coverPhoto: { width: "100%", height: 150, resizeMode: "cover" },
  profileSection: {
    alignItems: "center",
    marginTop: -45,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "#fff",
  },
  infoSection: {
    alignItems: "center",
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  bio: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginVertical: 10,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
 

  stat: { alignItems: "center" },
  statNumber: { fontSize: 18, fontWeight: "bold" },
  statLabel: { fontSize: 12, color: "#666" },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  buttonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 14,
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    borderTopWidth: 1,
    borderColor: "#eee",
    paddingVertical: 10,
    marginBottom: 10,
  },
  activeTab: {
    fontSize: 16,
    color: "#000",
    fontWeight: "bold",
    marginHorizontal: 20,
  },
  inactiveTab: {
    fontSize: 16,
    color: "#888",
    marginHorizontal: 20,
  },
  textPostContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  photoContainer: {
    borderRadius: 8,
  },
  noPhotosText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginTop: 20,
  },
});

export default ProfileScreen;
