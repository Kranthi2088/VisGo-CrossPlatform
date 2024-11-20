import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
} from "react-native";
import { db, auth } from "../configs/FirebaseConfig";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { useRoute } from "@react-navigation/native";

const CommentsScreen = () => {
  const { postId } = useRoute().params; // Get postId from navigation params
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // Fetch comments in real-time
  useEffect(() => {
    const commentsRef = collection(db, "posts", postId, "comments");
    const commentsQuery = query(commentsRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const fetchedComments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(fetchedComments);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [postId]);

  // Handle adding a new comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const user = auth.currentUser;
      const commentData = {
        text: newComment,
        userId: user.uid,
        username: user.displayName || "Anonymous",
        userPhoto: user.photoURL || "https://via.placeholder.com/40", // Fallback profile photo
        timestamp: new Date(),
      };

      await addDoc(collection(db, "posts", postId, "comments"), commentData);
      setNewComment(""); // Clear input
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Comments</Text>
      </View>

      {/* Comments List */}
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.commentItem}>
            <Image
              source={{ uri: item.userPhoto }}
              style={styles.profileImage}
            />
            <View style={styles.commentContent}>
              <Text style={styles.username}>{item.username}</Text>
              <Text style={styles.commentText}>{item.text}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.commentsList}
      />

      {/* Input for Adding a Comment */}
      <View style={styles.inputContainer}>
        <Image
          source={{
            uri: auth.currentUser?.photoURL || "https://via.placeholder.com/40",
          }}
          style={styles.profileImage}
        />
        <TextInput
          style={styles.input}
          placeholder="Add a comment..."
          value={newComment}
          onChangeText={setNewComment}
          placeholderTextColor="#888"
        />
        <TouchableOpacity onPress={handleAddComment} style={styles.postButton}>
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
    backgroundColor: "#f9f9f9",
  },
  backButton: {
    marginRight: 10,
  },
  backText: {
    fontSize: 18,
    color: "#007aff",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  commentsList: {
    paddingHorizontal: 15,
  },
  commentItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    padding: 10,
    borderRadius: 15,
  },
  username: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 5,
    color: "#333",
  },
  commentText: {
    fontSize: 14,
    color: "#555",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#eaeaea",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: "#f9f9f9",
  },
  postButton: {
    backgroundColor: "#1e90ff",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  postButtonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
});

export default CommentsScreen;
