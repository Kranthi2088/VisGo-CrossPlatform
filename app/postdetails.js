import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { doc, getDoc, collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db, auth } from "../configs/FirebaseConfig";
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import PostItem from "./PostItem"; // Assuming you have a PostItem component for displaying post details

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const PostDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { postId, username, profilePhoto } = route.params;
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch post details
    const fetchPost = async () => {
      try {
        const postDoc = await getDoc(doc(db, "posts", postId));
        if (postDoc.exists()) {
          setPost({ id: postDoc.id, ...postDoc.data() });
        } else {
          console.warn("No such document!");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch comments
    const fetchComments = () => {
      const commentsRef = collection(db, "posts", postId, "comments");
      const commentsQuery = query(commentsRef, orderBy("timestamp", "desc"));

      const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
        const commentsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setComments(commentsData);
      });

      return unsubscribe;
    };

    fetchPost();
    const unsubscribeComments = fetchComments();

    return () => unsubscribeComments();
  }, [postId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert("Error", "You must be logged in to comment.");
        return;
      }

      const userDocRef = doc(db, "users", currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        Alert.alert("Error", "User data not found.");
        return;
      }

      const userData = userDocSnap.data();

      await addDoc(collection(db, "posts", postId, "comments"), {
        text: newComment,
        userId: currentUser.uid,
        username: userData.username || "Anonymous",
        timestamp: new Date(),
      });

      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert("Error", "Failed to add comment. Please try again.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.goBackButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={24} color="black" />
      </TouchableOpacity>
      
      {/* Display the Post */}
      <View style={styles.incontainer}>
        {post ? (
          <PostItem
            postData={post}
            username={username}
            profilePhoto={profilePhoto}
            postId={post.id}
            onOpenComments={() => {}}
          />
        ) : (
          <Text>No post found.</Text>
        )}
      </View>

      {/* Display Comments */}
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.commentContainer}>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.comment}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={styles.commentsList}
      />

      {/* Input Section for Adding Comments */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a comment..."
          placeholderTextColor="black"
          
          value={newComment}
          onChangeText={setNewComment}
        />
        <TouchableOpacity onPress={handleAddComment}>
          <Feather name="send" size={20} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  incontainer: {
    backgroundColor: "#fff",
    marginTop: 60,
    paddingBottom: 20,
    paddingTop: 50, // Space above the comments
  },
  goBackButton: {
    position: "absolute",
    top: 40,
    left: 10,
    zIndex: 1,
    padding: 10,
    paddingBottom: 10,
  },
  commentsList: {
    paddingHorizontal: 10 // Space for input at bottom
  },
  commentContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  username: {
    fontWeight: "bold",
    marginRight: 5,
  },
  comment: {
    flex: 1,
    color: "#333",
  },
  inputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#eaeaea",
    backgroundColor: "#fff",
    marginVertical: 25,
  },
  input: {
    flex: 1,
    borderColor: "#eaeaea",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    color: "black",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PostDetails;
