import React, { useState, useEffect, useRef } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, Alert, Dimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import { db, auth } from "../configs/FirebaseConfig";
import { doc, collection, addDoc, deleteDoc, setDoc, onSnapshot, getDoc } from "firebase/firestore";
import { BottomSheetModal, BottomSheetModalProvider, BottomSheetBackdrop, BottomSheetFlatList } from "@gorhom/bottom-sheet";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const PostItem = ({ postData, username, profilePhoto, postId, onOpenComments}) => {
  const { textContent, imageUrl } = postData;
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const bottomSheetModalRef = useRef(null);
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

    return () => {
      unsubscribeLikes();
      unsubscribeComments();
    };
  }, [postId]);

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
      }
      setLiked(!liked);
    } catch (error) {
      console.error("Error toggling like:", error);
      Alert.alert("Error", "Failed to update like.");
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
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="bookmark" size={18} color="black" />
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
  commentsContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  commentItem: {
    marginBottom: 10,
  },
  commentUsername: {
    fontWeight: "bold",
    marginRight: 5,
  },
  commentText: {
    color: "#333",
  },
  addCommentContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#eaeaea",
    paddingVertical: 10,
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
