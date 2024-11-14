import React, { useState, useEffect, useRef } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, Alert, Dimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import { db, auth } from "../configs/FirebaseConfig";
import { doc, collection, addDoc, deleteDoc, setDoc, onSnapshot, getDoc } from "firebase/firestore";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const PostItem = ({ postData, username, profilePhoto, postId, onOpenComments }) => {
  const { textContent, imageUrl, postOwnerId } = postData;
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const currentUser = auth.currentUser;


  useEffect(() => {
    if (!postId) return;

    const likesRef = collection(db, "posts", postId, "likes");
    const commentsRef = collection(db, "posts", postId, "comments");

    const unsubscribeLikes = onSnapshot(likesRef, (snapshot) => {
      setLikesCount(snapshot.size);
      if (currentUser) {
        setLiked(snapshot.docs.some((doc) => doc.id === currentUser.uid));
      }
    });

    const unsubscribeComments = onSnapshot(commentsRef, (snapshot) => {
      const commentsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setComments(commentsData);
    });

    const checkIfSaved = async () => {
      if (currentUser) {
        const savedPostRef = doc(db, "users", currentUser.uid, "saved_posts", postId);
        const savedPostSnap = await getDoc(savedPostRef);
        setIsSaved(savedPostSnap.exists());
      }
    };

    checkIfSaved();

    return () => {
      unsubscribeLikes();
      unsubscribeComments();
    };
  }, [postId]);

  const handleSavePost = async () => {
    if (!currentUser) {
      Alert.alert("Error", "You must be logged in to save posts.");
      return;
    }

    const savedPostRef = doc(db, "users", currentUser.uid, "saved_posts", postId);

    try {
      if (isSaved) {
        // If already saved, remove it
        await deleteDoc(savedPostRef);
        setIsSaved(false);
      } else {
        // If not saved, add it
        await setDoc(savedPostRef, {
          postId: postId,
          postOwnerId: postOwnerId,
          timestamp: new Date(),
          // Optionally, include other relevant post data here (e.g., image URL, description)
        });
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error saving post:", error);
      Alert.alert("Error", "Failed to save post.");
    }
  };

  // Function to create a notification in the notifications collection
  const createNotification = async (type) => {
    try {
      if ( postOwnerId) { // Avoid notifying if the user is the post owner
        await addDoc(collection(db, "notifications"), {
          targetUserId: postOwnerId,
          actorUserId: currentUser.uid,
          postId: postId,
          type: type, // 'like' or 'comment'
          timestamp: new Date(),
          read: false,
        });
      }
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };

  const handleLike = async () => {
    if (!currentUser) {
      Alert.alert("Error", "You must be logged in to like posts.");
      return;
    }

    const likeRef = doc(db, "posts", postId, "likes", currentUser.uid);

    try {
      if (liked) {
        await deleteDoc(likeRef);
      } else {
        await setDoc(likeRef, {
          userId: currentUser.uid,
          timestamp: new Date(),
        });
        // Create a notification for like
        await createNotification("like");
      }
      setLiked(!liked);
    } catch (error) {
      console.error("Error toggling like:", error);
      Alert.alert("Error", "Failed to update like.");
    }
  };

  const handleAddComment = async () => {
    if (!currentUser) {
      Alert.alert("Error", "You must be logged in to comment.");
      return;
    }

    if (!newComment.trim()) return;

    try {
      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const commentsRef = collection(db, "posts", postId, "comments");

        await addDoc(commentsRef, {
          userId: currentUser.uid,
          username: userData.username || "Anonymous",
          text: newComment,
          timestamp: new Date(),
        });

        setNewComment(""); // Clear input after adding comment
        // Create a notification for comment
        await createNotification("comment");
      } else {
        Alert.alert("Error", "User data not found.");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert("Error", "Failed to add comment.");
    }
  };

  return (
    <View style={styles.postContainer}>
      {/* Header with Profile Image and Username */}
      <View style={styles.header}>
        <Image source={{ uri: profilePhoto }} style={styles.profileImage} />
        <View>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.timestamp}>2h</Text>
        </View>
      </View>

      {/* Content Section */}
      {textContent ? (
        <Text style={styles.textContent}>{textContent}</Text>
      ) : (
        <Image source={{ uri: imageUrl }} style={styles.postImage} />
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
          <Feather name="heart" size={18} color={liked ? "red" : "black"} />
          <Text style={styles.actionText}>{likesCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onOpenComments(postId)}>
          <Text>{comments.length} Comments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Feather name="share" size={18} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSavePost} style={styles.actionButton}>
        <Feather name="bookmark" size={18} color={isSaved ? "blue" : "black"} />
      </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  postContainer: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: "95%",
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontWeight: "bold",
    fontSize: 15,
  },
  timestamp: {
    fontSize: 12,
    color: "gray",
  },
  textContent: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    marginVertical: 10,
  },
  postImage: {
    width: "100%",
    height: 300,
    borderRadius: 10,
    marginVertical: 10,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eaeaea",
    marginTop: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    fontSize: 14,
    color: "gray",
    marginLeft: 5,
  },
});

export default PostItem;
