import React, { useEffect, useState,  } from "react";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { db, auth } from "../configs/FirebaseConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
const { width } = Dimensions.get("window");

const SavedPostsScreen = () => {
  const [savedPosts, setSavedPosts] = useState([]);
  const currentUser = auth.currentUser;
  const navigation = useNavigation();
  const router = useRouter();
  useEffect(() => {
    const fetchSavedPosts = async () => {
      if (!currentUser) return;

      try {
        const savedPostsRef = collection(db, "users", currentUser.uid, "saved_posts");
        const savedPostsSnapshot = await getDocs(savedPostsRef);

        const savedPostsList = await Promise.all(
          savedPostsSnapshot.docs.map(async (savedPostDoc) => {
            const { postId, postOwnerId, uri, photographer, source } = savedPostDoc.data();

            if (source === "pexels") {
              // If the post is from Pexels
              return {
                id: postId,
                imageUrl: uri,
                photographer: photographer || "Unknown",
                source: "pexels",
              };
            } else {
              // If the post is from Firebase
              const postRef = doc(db, "posts", postId);
              const postSnapshot = await getDoc(postRef);

              // Fetch the post owner's user data if available
              let username = "Unknown";
              let profilePhoto = "https://picsum.photos/200";
              if (postOwnerId) {
                const userRef = doc(db, "users", postOwnerId);
                const userSnapshot = await getDoc(userRef);
                if (userSnapshot.exists()) {
                  username = userSnapshot.data().username || "Unknown";
                  profilePhoto = userSnapshot.data().profilePhoto || "https://picsum.photos/200";
                }
              }

              if (postSnapshot.exists()) {
                const postData = postSnapshot.data();
                return {
                  id: postSnapshot.id,
                  ...postData,
                  username,
                  profilePhoto,
                  source: "firebase",
                };
              } else {
                console.warn("Post not found:", postId);
                return null;
              }
            }
          })
        );

        setSavedPosts(savedPostsList.filter((post) => post !== null));
      } catch (error) {
        console.error("Error fetching saved posts:", error);
      }
    };

    fetchSavedPosts();
  }, []);
  
  const renderSavedPost = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        if (item.source === "pexels") {
            router.push({
                pathname: "/ImageDetails", // Path to ImageDetails screen
                params: {
                  id: item.id, // Pass the image ID correctly
                },
          });
        } else {
          navigation.navigate("postdetails", {
            postdata: item,
            postId: item.id,
            username: item.username,
            profilePhoto: item.profilePhoto,
            description: item.description,
          });
        }
      }}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={{ marginTop: 80 }}>
      <TouchableOpacity
        style={{top: 27, left: 10, zIndex: 1}} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={24} color="black" />
      </TouchableOpacity>
        <Text style={styles.title}>Saved Posts</Text>
        <FlatList
          data={savedPosts}
          keyExtractor={(item) => item.id}
          renderItem={renderSavedPost}
          numColumns={3} // Display grid with 3 columns
          contentContainerStyle={styles.grid}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 50,
    width: "100%",
    textAlign: "center",
  },
  grid: {
    justifyContent: "space-between",
  },
  thumbnail: {
    width: width / 3 - 10,
    height: width / 3 - 10,
    margin: 5,
    borderRadius: 8,
  },
});

export default SavedPostsScreen;
