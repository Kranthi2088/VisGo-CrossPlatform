import React, { useEffect, useState } from "react";
import { View, ScrollView, Text, StyleSheet, RefreshControl, Alert } from "react-native";
import { db, auth } from "../../configs/FirebaseConfig";
import { collection, getDocs, query, where, orderBy, getDoc, doc, Timestamp } from "firebase/firestore";
import PostItem from "../PostItem";
import CreatePost from "../addpost";

const HomeScreen = () => {
  const [posts, setPosts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Function to handle posting
  const handlePost = (text) => {
    console.log("New post:", text);
    // Add logic to handle creating a new post and refreshing the feed
  };

  // Fetch posts from the last 24 hours
  const fetchPosts = async () => {
    try {
      const yesterdayTime = Timestamp.fromMillis(new Date().getTime() - 24 * 60 * 60 * 1000);
      const postsQuery = query(
        collection(db, "posts"),
        where("timestamp", ">=", yesterdayTime),
        orderBy("timestamp", "desc")
      );

      const postsSnapshot = await getDocs(postsQuery);
      const postList = [];

      for (const postDoc of postsSnapshot.docs) {
        const postData = postDoc.data();
        const userId = postData.userId;

        // Fetch user details for each post
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          postList.push({
            id: postDoc.id,
            ...postData,
            username: userData.username,
            profilePhoto: userData.profilePhoto,
          });
        } else {
          console.warn(`User with ID ${userId} not found`);
        }
      }

      setPosts(postList);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  // Fetch current user's data for the profile photo and other details
  const fetchUserData = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.warn("No authenticated user found");
        return;
      }

      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      } else {
        console.warn(`User with ID ${userId} not found`);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchPosts();
  }, []);

  // Refresh data on pull-to-refresh
  const fetchAllData = async () => {
    try {
      await fetchUserData();
      await fetchPosts();
    } catch (error) {
      console.error("Error refreshing data:", error);
      Alert.alert("Error", "Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
  };

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {/* Pass user data to CreatePost component */}
      <CreatePost
        profileImage={userData?.profilePhoto || "https://picsum.photos/200"}
        onPost={handlePost}
      />

      {posts.length > 0 ? (
        posts.map((post) => (
          <PostItem
            key={post.id}
            postData={post}
            username={post.username}
            profilePhoto={post.profilePhoto}
          />
        ))
      ) : (
        <Text style={styles.noPostsText}>No posts found in the last 24 hours.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  createPost: {
    backgroundColor: "#fff",
  },
  noPostsText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#888",
  },
});

export default HomeScreen;
