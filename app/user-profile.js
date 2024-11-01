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
} from "react-native";
import { auth, db } from "../configs/FirebaseConfig";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"; 
import MasonryList from "react-native-masonry-list";
import { useRoute } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";



const IMAGE_MARGIN = 10;

const OtherUserProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params; // Get userId of profile being viewed
  const currentUser = auth.currentUser;
  
  const [userData, setUserData] = useState({});
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch other user's data
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

  // Fetch user's posts (photos)
  const fetchUserPosts = async () => {
    try {
      const postsQuery = query(
        collection(db, "posts"),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(postsQuery);
      const photos = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        cachedImageUrl: doc.data().imageUrl,
      }));
      setUploadedPhotos(photos);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Check if current user is following this other user
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
        // Unfollow: Remove from following and followers lists
        await updateDoc(currentUserDocRef, {
          following: arrayRemove(userId),
        });
        await updateDoc(otherUserDocRef, {
          followers: arrayRemove(currentUser.uid),
        });
        setIsFollowing(false);
      } else {
        // Follow: Add to following and followers lists
        await updateDoc(currentUserDocRef, {
          following: arrayUnion(userId),
        });
        await updateDoc(otherUserDocRef, {
          followers: arrayUnion(currentUser.uid),
        });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Error updating follow status:", error);
      Alert.alert("Error", "Failed to update follow status");
    }
  };

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
        <Text style={styles.headerTitle}>Search Users</Text>
      </View>

      {/* Cover Photo */}
      <Image source={{ uri: "https://picsum.photos/200/200" }} style={styles.coverPhoto} />

      {/* Profile Info */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image source={{ uri: userData.profilePhoto }} style={styles.profilePhoto} />
        
        {/* Stats */}
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
      </View>

      {/* Username and Bio */}
      <View style={{ marginLeft: 25 }}>
        <Text style={styles.username}>{userData.username || "Username"}</Text>
        <Text style={styles.bio}>{userData.bio || "Bio goes here..."}</Text>
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

      {/* Follow Button */}
      <TouchableOpacity
        style={[styles.followButton, isFollowing ? styles.unfollowButton : styles.followButton]}
        onPress={handleFollowToggle}
      >
        <Text style={styles.followButtonText}>
          {isFollowing ? "Unfollow" : "Follow"}
        </Text>
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
          spacing={2}
          imageContainerStyle={styles.photoContainer}
          onPressImage={(item) => navigateToPostDetails(item.data)}
        />
      ) : (
        <Text style={styles.noPhotosText}>No photos yet</Text>
      )}
    </ScrollView>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50, // Adjust this value based on your status bar height
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
   coverPhoto:{
     width , height :200 , resizeMode :"cover"
   },
   profilePhoto:{
     width :120 , height :120 , borderRadius :90 , borderWidth :3 , borderColor :"#fff",
     marginTop :-40 , marginLeft :20 
   },
   statsContainer:{
     flexDirection :"row" , alignItems :"center",
     marginVertical :10 , marginHorizontal :25 
   },
   stat:{
     alignItems :"center" , justifyContent :"space-around",
     marginHorizontal :15 
   },
   statNumber:{
     fontSize :20 , fontWeight :"bold"
   },
   statLabel:{
     fontSize :14 , color:"#666"
   },
   username:{
     fontFamily :"Poppins_700Bold",
     fontSize :24 ,
     color:"#000",
     marginBottom :5 
   },
   bio:{
     fontFamily :"Poppins_400Regular",
     fontSize :14 ,
     color:"#666",
     marginBottom :-45 
   },
   infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "80%",
    top: 50,
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
   
   followButton:{
     backgroundColor :"#000",
     borderRadius :10 ,
     paddingVertical :15 ,
     alignItems :"center",
     marginHorizontal :width/25,
     marginTop :50,
   },
   
   unfollowButton:{
    backgroundColor :"#f44336",
    borderRadius :10 ,
     paddingVertical :15 ,
     alignItems :"center",
     marginTop :50
   },
   
   followButtonText:{
     color :"#fff",
     fontSize :18 
   },
   
   noPhotosText:{
     textAlign:"center",
     fontSize:18,
     color:"#666",
     marginTop:20
   },
   
   photoContainer:{
       marginBottom:IMAGE_MARGIN,
       overflow:"hidden",
       marginTop:10
   }
});

export default OtherUserProfileScreen;