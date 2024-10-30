import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { db, auth } from "../configs/FirebaseConfig";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

const { width } = Dimensions.get("window");

const PostDetails = ({ route = {} }) => {
  const { postData } = route.params || {};
  const post = postData ? JSON.parse(postData) : {};
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      if (!post.id) throw new Error("Post ID is missing.");
      const commentsQuery = query(
        collection(db, "comments"),
        where("postId", "==", post.id)
      );
      const querySnapshot = await getDocs(commentsQuery);
      const fetchedComments = querySnapshot.docs.map((doc) => doc.data());
      setComments(fetchedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      Alert.alert("Error", "Failed to load comments.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim() === "") return;
    try {
      if (!post.id) throw new Error("Post ID is missing.");
      const commentData = {
        text: newComment,
        userId: auth.currentUser.uid,
        postId: post.id,
        timestamp: new Date(),
      };
      await addDoc(collection(db, "comments"), commentData);
      setComments((prevComments) => [...prevComments, commentData]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert("Error", "Failed to post comment.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      {post.uri && (
        <Image source={{ uri: post.uri }} style={styles.postImage} />
      )}
      <View style={styles.actionsContainer}>
        <TouchableOpacity>
          <Feather name="heart" size={28} color="black" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Feather name="message-circle" size={28} color="black" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Feather name="share" size={28} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton}>
          <Feather name="bookmark" size={28} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.commentsContainer}>
        <Text style={styles.sectionTitle}>Comments</Text>
        {loading ? (
          <Text>Loading comments...</Text>
        ) : comments.length > 0 ? (
          comments.map((comment, index) => (
            <View key={index} style={styles.comment}>
              <Text style={styles.commentText}>{comment.text}</Text>
            </View>
          ))
        ) : (
          <Text>No comments yet.</Text>
        )}
      </View>
      <View style={styles.commentInputContainer}>
        <TextInput
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Add a comment..."
          style={styles.commentInput}
        />
        <TouchableOpacity onPress={handleAddComment} style={styles.sendButton}>
          <Feather name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  postImage: {
    width,
    height: width,
    resizeMode: "cover",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  saveButton: { marginLeft: "auto" },
  commentsContainer: {
    paddingHorizontal: 10,
    marginTop: 20,
  },
  sectionTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 18,
    marginBottom: 10,
  },
  comment: {
    flexDirection: "row",
    marginBottom: 10,
  },
  commentText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginVertical: 20,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 25,
  },
});

export default PostDetails;

