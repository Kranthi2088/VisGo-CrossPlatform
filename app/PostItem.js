import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { db } from "../configs/FirebaseConfig";
import { doc, updateDoc, arrayUnion, increment } from "firebase/firestore";

const PostItem = ({ postData, username, profilePhoto, postId }) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(postData.likes || 0);
  const [comments, setComments] = useState(postData.comments || []);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    setLikes(postData.likes || 0);
    setComments(postData.comments || []);
  }, [postData]);

  const handleLike = async () => {
    const newLikedStatus = !liked;
    setLiked(newLikedStatus);

    try {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        likes: increment(newLikedStatus ? 1 : -1), // Increment or decrement likes
      });
      setLikes(newLikedStatus ? likes + 1 : likes - 1);
    } catch (error) {
      console.error("Error updating likes:", error);
      Alert.alert("Error", "Failed to update like status.");
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim() === "") return;

    const commentData = {
      text: newComment,
      username: "YourUsername", // replace with actual user's username if available
    };

    try {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        comments: arrayUnion(commentData),
      });
      setComments((prevComments) => [...prevComments, commentData]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert("Error", "Failed to add comment.");
    }
  };

  return (
    <View style={styles.postContainer}>
      {/* Post Header with Username and Profile Picture */}
      <View style={styles.header}>
        <Image source={{ uri: profilePhoto }} style={styles.profileImage} />
        <Text style={styles.username}>{username}</Text>
      </View>

      {/* Post Image */}
      {postData.textContent ? (
        <Text style={styles.textContent}>{postData.textContent}</Text>
      ) : (
        <Image source={{ uri: postData.imageUrl }} style={styles.postImage} />
      )}

      {/* Post Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity onPress={handleLike}>
          <Feather
            name="heart"
            size={24}
            color={liked ? "red" : "black"}
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Feather name="message-circle" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Feather name="share" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton}>
          <Feather name="bookmark" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Likes and Description */}
      <View style={styles.postDetails}>
        <Text style={styles.likesText}>{likes} likes</Text>
        <Text style={styles.description}>
          <Text style={styles.username}>{username} </Text>
          {postData.description}
        </Text>
      </View>

      {/* Comments */}
      {comments.length > 0 ? (
        <View style={styles.commentsContainer}>
          {comments.map((comment, index) => (
            <Text key={index} style={styles.comment}>
              <Text style={styles.username}>{comment.username} </Text>
              {comment.text}
            </Text>
          ))}
        </View>
      ) : (
        <Text style={styles.noCommentsText}>No comments yet</Text>
      )}

      {/* Add Comment Section */}
      <View style={styles.addCommentContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment..."
          placeholderTextColor="#888"
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
  postContainer: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontWeight: "bold",
    fontSize: 16,
  },
  postImage: {
    width: "100%",
    height: 600,
    resizeMode: "cover",
  },
  postText: {
    fontSize: 16,
    color: "#333",
    marginVertical: 10,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 15,
  },
  saveButton: {
    marginLeft: "auto",
  },
  postDetails: {
    paddingHorizontal: 10,
  },
  likesText: {
    fontWeight: "bold",
    marginVertical: 5,
  },
  description: {
    marginBottom: 10,
  },
  commentsContainer: {
    paddingHorizontal: 10,
    marginTop: 10,
  },
  comment: {
    marginBottom: 5,
  },
  noCommentsText: {
    color: "#888",
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  addCommentContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#eaeaea",
  },
  commentInput: {
    flex: 1,
    borderColor: "#eaeaea",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    color: "black",
  },
});

export default PostItem;
