import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { db, auth } from "../configs/FirebaseConfig";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { useRoute } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const PostDetails = () => {
  const route = useRoute();
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
      if (!post.id) {
        console.log("Post ID is missing, unable to fetch comments");
        return;
      }
      const commentsQuery = query(
        collection(db, "comments"),
        where("postId", "==", post.id)
      );
      const querySnapshot = await getDocs(commentsQuery);
      const fetchedComments = querySnapshot.docs.map((doc) => doc.data());
      setComments(fetchedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim() === "") return;
    try {
      if (!post.id) {
        console.log("Post ID is missing, unable to add comment");
        return;
      }
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
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Image source={{ uri: post.profilePhoto }} style={styles.profileImage} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.username}>{post.username}</Text>
          <Text style={styles.timestamp}>3 days ago</Text>
        </View>
      </View>

      {/* Post Image */}
      {post.cachedImageUrl && (
        <Image source={{ uri: post.cachedImageUrl }} style={styles.postImage} />
      )}

      {/* Action Icons and Counts */}
      <View style={styles.actionsContainer}>
        <View style={styles.iconWithCount}>
          <TouchableOpacity>
            <Feather name="heart" size={20} color="red" />
          </TouchableOpacity>
          <Text style={styles.countText}>99</Text>
        </View>
        <View style={styles.iconWithCount}>
          <TouchableOpacity>
            <Feather name="message-circle" size={20} color="black" />
          </TouchableOpacity>
          <Text style={styles.countText}>{comments.length}</Text>
        </View>
        <View style={styles.iconWithCount}>
          <TouchableOpacity>
            <Feather name="share" size={20} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Description */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.username}>{post.username}</Text>
        <Text style={styles.descriptionText}>{post.description}</Text>
      </View>

      {/* Comments Section */}
      <View style={styles.commentsContainer}>
        <Text style={styles.sectionTitle}>Comments</Text>
        {loading ? (
          <Text>Loading comments...</Text>
        ) : comments.length > 0 ? (
          comments.map((comment, index) => (
            <View key={index} style={styles.comment}>
              <Text style={styles.commentUsername}>User{index + 1}</Text>
              <Text style={styles.commentText}>{comment.text}</Text>
            </View>
          ))
        ) : (
          <Text>No comments yet.</Text>
        )}
      </View>

      {/* Add Comment Input */}
      <View style={styles.commentInputContainer}>
        <TextInput
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Add a comment..."
          style={styles.commentInput}
        />
        <TouchableOpacity onPress={handleAddComment} style={styles.sendButton}>
          <Feather name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerTextContainer: {
    marginLeft: 10,
  },
  username: {
    fontFamily: "Poppins_700Bold",
    fontSize: 16,
    color: "#000",
  },
  timestamp: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#888",
  },
  postImage: {
    width: "100%",
    height: width,
    resizeMode: "cover",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
  },
  iconWithCount: {
    flexDirection: "row",
    alignItems: "center",
  },
  countText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#333",
    marginLeft: 5,
  },
  descriptionContainer: {
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  descriptionText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#333",
    marginLeft: 5,
  },
  commentsContainer: {
    paddingHorizontal: 15,
    marginTop: 20,
  },
  sectionTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 18,
    marginBottom: 10,
  },
  comment: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  commentUsername: {
    fontFamily: "Poppins_700Bold",
    fontSize: 14,
    marginRight: 5,
  },
  commentText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#333",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginVertical: 20,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    fontFamily: "Poppins_400Regular",
  },
  sendButton: {
    backgroundColor: "#3498db",
    padding: 10,
    borderRadius: 25,
  },
});

export default PostDetails;
