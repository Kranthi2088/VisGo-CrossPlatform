import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { auth, db } from "../../configs/FirebaseConfig";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"; 
import { MaterialCommunityIcons } from "@expo/vector-icons";
import MasonryList from "react-native-masonry-list";
import { RefreshControl } from "react-native";

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

  const [uploadedPhotos, setUploadedPhotos] = useState([]); // Store user's post images
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  
  const fetchUserData = async () => {
    if (user) {
      try {
        // Fetch user data from the 'users' collection
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data());
        } else {
          console.log("No user data found");
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
        // Query posts collection for posts created by the logged-in user
        const postsQuery = query(
          collection(db, "posts"),
          where("userId", "==", user.uid)
        );

        const querySnapshot = await getDocs(postsQuery);
        const photos = querySnapshot.docs.map((doc) => doc.data().imageUrl); // Extract image URLs

        setUploadedPhotos(photos);
      } catch (error) {
        console.error("Error fetching user posts:", error);
        Alert.alert("Error", "Failed to fetch user posts");
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchAllData = async () => {
    setLoading(true); // Show loading indicator during refresh
    setUploadedPhotos([]); // Clear previous photos to prevent stale data

    try {
      await fetchUserData();  // Fetch user data
      await fetchUserPosts(); // Fetch posts
    } catch (error) {
      console.error("Error refreshing data:", error);
      Alert.alert("Error", "Failed to refresh data");
    } finally {
      setLoading(false); // Stop loading indicator
      setRefreshing(false); // Stop refreshing if called by pull-to-refresh
    }
  };

  useEffect(() => {
    fetchAllData(); // Fetch data initially when component mounts
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true); // Start refreshing
    await fetchAllData(); // Re-fetch all data on pull down
  };
  
  return (
    <ScrollView
  style={styles.container}
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
>
      
      <StatusBar hidden />

      {/* Cover Photo */}
      <Image
        source={
          userData.coverPhoto
            ? { uri: userData.coverPhoto }
            : { uri: "https://picsum.photos/200/200" }
        }
        style={styles.coverPhoto}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image source={{ uri: userData.profilePhoto }} style={styles.profilePhoto} />
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>
              {userData.uploadedPhotos ? userData.uploadedPhotos.length : 0}
            </Text>
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
          images={uploadedPhotos.map((photo) => ({ uri: photo }))}
          columns={2} // Two columns for masonry layout
          spacing={2} // Adjust spacing between images
          imageContainerStyle={styles.photoContainer}
        />
      ) : (
        <Text style={styles.noPhotosText}>No photos to display</Text>
      )}

    </ScrollView>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  coverPhoto: {
    width,
    height: 200,
    resizeMode: "cover",
  },
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
    alignSelf: "flex-start",
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
  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: IMAGE_MARGIN,
  },
  photoContainer: {
    marginBottom: IMAGE_MARGIN,
    borderRadius: 5,
    overflow: "hidden",
    marginTop: 10
  },
  largePhoto: {
    width: width * 0.65 - IMAGE_MARGIN, // Larger photo for staggered layout
    height: 250,
  },
  smallPhoto: {
    width: width * 0.3 - IMAGE_MARGIN, // Smaller photo
    height: 150,
  },
  photo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  noPhotosText: {
    textAlign: "center",
    fontSize: 18,
    marginTop: 20,
    color: "#666",
  },

});

export default ProfileScreen;