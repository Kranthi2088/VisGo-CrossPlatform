import React, { useEffect, useState, useRef,useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, RefreshControl, Alert, FlatList} from "react-native";
import { db, auth } from "../../configs/FirebaseConfig";
import { collection, getDocs, query, where, orderBy, getDoc, doc, Timestamp } from "firebase/firestore";
import PostItem from "../PostItem";
import CreatePost from "../addpost";
import StoryBar from "../storybar";
import CommentsModal from "../Commentsmodal"; // Make sure to import CommentsModal here
import { BottomSheetBackdrop,bottomSheetModalRef } from "@gorhom/bottom-sheet";
const HomeScreen = () => {
  const [posts, setPosts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showComments, setShowComments] = useState({ show: false, tick: 0 });
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const commentsModalRef = useRef(null);

  // Fetch posts and user data
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserData();
    await fetchPosts();
    setRefreshing(false);
  }, []);

  const handleOpenComments = (postId) => {
    setSelectedPostId(postId);
    setIsModalVisible(true);
  };
  const handleCloseComments = () => {
    setIsModalVisible(false);
  };
  const renderItem = useCallback(({ item }) => (
    <PostItem
      postData={item}
      username={item.username}
      profilePhoto={item.profilePhoto}
      postId={item.id}
      onOpenComments={handleOpenComments}
    />
  ), [handleOpenComments]);

  const ListHeaderComponent = useCallback(() => (
    <>
      <StoryBar />
      <CreatePost profileImage={userData?.profilePhoto || "https://picsum.photos/200"} onPost={fetchPosts} />
    </>
  ), [userData, fetchPosts]);

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={<Text style={styles.noPostsText}>No posts found in the last 24 hours.</Text>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
      {showComments.show && (
        <CommentsModal
        ref={commentsModalRef}
        visible={isModalVisible}
        onClose={handleCloseComments}
        postId={selectedPostId}
      />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingBottom: 80, // Ensure content doesn’t get covered by bottom navigation
  },
  noPostsText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#888",
  },
});

export default HomeScreen;
