import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { auth, db } from "../configs/FirebaseConfig";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
  addDoc,
} from "firebase/firestore";
import MasonryList from "react-native-masonry-list";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const OtherUserProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params; // The user ID of the profile being viewed
  const currentUser = auth.currentUser; // The logged-in user

  const [userData, setUserData] = useState({});
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [textPosts, setTextPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedView, setSelectedView] = useState("imagePosts"); // Toggle between image and text posts
  const [loading, setLoading] = useState(true);

  // Create a follow notification
  const createFollowNotification = async (targetUserId, actorUserId) => {
    try {
      await addDoc(collection(db, "notifications"), {
        type: "follow",
        targetUserId,
        actorUserId,
        timestamp: new Date(),
        read: false,
      });
    } catch (error) {
      console.error("Error creating follow notification:", error);
    }
  };

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        setUserData(userDocSnap.data());
        checkIfFollowing();
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to fetch user data");
    }
  };

  // Fetch user posts
  const fetchUserPosts = async () => {
    try {
      const postsQuery = query(
        collection(db, "posts"),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(postsQuery);
      const photos = [];
      const texts = [];
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.imageUrl) {
          photos.push({
            id: doc.id,
            ...data,
            cachedImageUrl: data.imageUrl,
          });
        } else {
          texts.push({
            id: doc.id,
            ...data,
          });
        }
      });
      setUploadedPhotos(photos);
      setTextPosts(texts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Check if the current user is following this profile
  const checkIfFollowing = async () => {
    try {
      const currentUserDocRef = doc(db, "users", currentUser.uid);
      const currentUserDocSnap = await getDoc(currentUserDocRef);
      if (currentUserDocSnap.exists()) {
        const currentUserData = currentUserDocSnap.data();
        setIsFollowing(currentUserData.following?.includes(userId));
      }
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  // Handle Follow/Unfollow
  const handleFollowToggle = async () => {
    try {
      const currentUserDocRef = doc(db, "users", currentUser.uid);
      const otherUserDocRef = doc(db, "users", userId);

      if (isFollowing) {
        // Unfollow logic
        await updateDoc(currentUserDocRef, {
          following: arrayRemove(userId),
        });
        await updateDoc(otherUserDocRef, {
          followers: arrayRemove(currentUser.uid),
        });
        setIsFollowing(false);
      } else {
        // Follow logic
        await updateDoc(currentUserDocRef, {
          following: arrayUnion(userId),
        });
        await updateDoc(otherUserDocRef, {
          followers: arrayUnion(currentUser.uid),
        });

        // Create follow notification
        await createFollowNotification(userId, currentUser.uid);

        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Error updating follow status:", error);
      Alert.alert("Error", "Failed to update follow status");
    }
  };

  // Navigate to post details with all required data
  const navigateToPostDetails = (post) => {
    navigation.navigate("postdetails", {
      postId: post.id,
      username: userData.username,
      profilePhoto: userData.profilePhoto,
      imageUrl: post.cachedImageUrl,
      description: post.description,
      postdata: post,
    });
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchUserData();
    fetchUserPosts();
  }, [userId]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{userData.username || "User Profile"}</Text>
      </View>

      {/* Cover Photo */}
      <Image source={{ uri: userData.coverPhoto || "https://picsum.photos/200/200" }} style={styles.coverPhoto} />

      {/* Profile Image and Stats */}
      <View style={styles.profileSection}>
        <Image source={{ uri: userData.profilePhoto || "https://picsum.photos/200" }} style={styles.profileImage} />
        <Text style={styles.username}>{userData.username || "Username"}</Text>
        <Text style={styles.bio}>{userData.bio || "Bio goes here..."}</Text>

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{uploadedPhotos.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{userData.followers?.length || 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{userData.following?.length || 0}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        {/* Follow and Message Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, isFollowing ? styles.unfollowButton : styles.followButton]}
            onPress={handleFollowToggle}
          >
            <Text style={styles.actionButtonText}>{isFollowing ? "Unfollow" : "Follow"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Message</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation between Image Posts and Text Posts */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity onPress={() => setSelectedView("imagePosts")}>
          <Text style={selectedView === "imagePosts" ? styles.activeTab : styles.inactiveTab}>Grid</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedView("textPosts")}>
          <Text style={selectedView === "textPosts" ? styles.activeTab : styles.inactiveTab}>Text Posts</Text>
        </TouchableOpacity>
      </View>

      {/* Posts Section */}
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
              <Text>{post.textContent}</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  coverPhoto: { width, height: 200, resizeMode: "cover" },
  profileSection: {
    alignItems: "center",
    marginTop: -40,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "#fff",
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginTop: 10,
  },
  bio: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginVertical: 5,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
    marginTop: 15,
  },
  stat: { alignItems: "center" },
  statNumber: { fontSize: 18, fontWeight: "bold" },
  statLabel: { fontSize: 12, color: "#666" },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
    margin: 20,
  },
  actionButton: {
    backgroundColor: "#000",
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  followButton: {
    backgroundColor: "#000",
  },
  unfollowButton: {
    backgroundColor: "#f44336",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    borderTopWidth: 1,
    borderColor: "#eee",
    paddingVertical: 15,
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
    marginBottom: 10,
    borderRadius: 8,
  },
  noPhotosText: {
    textAlign: "center",
    fontSize: 18,
    color: "#666",
    marginTop: 20,
  },
});

export default OtherUserProfileScreen;
