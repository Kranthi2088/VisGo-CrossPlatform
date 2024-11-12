import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { db, auth } from "../configs/FirebaseConfig";
import { doc, collection, addDoc, deleteDoc, setDoc, onSnapshot, getDoc } from "firebase/firestore";
 
const PostItem = ({ postData, username, profilePhoto, postId }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
 
  const currentUser = auth.currentUser;
 
  useEffect(() => {
    if (!postId) return;
 
    const likesRef = collection(db, "posts", postId, "likes");
    const commentsRef = collection(db, "posts", postId, "comments");
 
    // Add error handling to each listener
    const unsubscribeLikes = onSnapshot(
      likesRef,
      (snapshot) => {
        setLikesCount(snapshot.size);
        if (currentUser) {
          setLiked(snapshot.docs.some((doc) => doc.id === currentUser.uid));
        }
      },
      (error) => {
        console.error("Error fetching likes snapshot:", error);
        Alert.alert("Error", "Failed to fetch likes.");
      }
    );
 
    const unsubscribeComments = onSnapshot(
      commentsRef,
      (snapshot) => {
        const commentsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setComments(commentsData);
      },
      (error) => {
        console.error("Error fetching comments snapshot:", error);
        Alert.alert("Error", "Failed to fetch comments.");
      }
    );
 
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
        // Unlike
        await deleteDoc(likeRef);
      } else {
        // Like
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
 
  const handleAddComment = async () => {
    if (!currentUser) {
      Alert.alert("Error", "You must be logged in to comment.");
      return;
    }
  
    if (!newComment.trim()) return;
  
    try {
      // Fetch the current user's username from Firestore
      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
  
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const commentsRef = collection(db, "posts", postId, "comments");
  
        await addDoc(commentsRef, {
          userId: currentUser.uid,
          username: userData.username || "Anonymous", // Use the fetched username
          text: newComment,
          timestamp: new Date(),
        });
  
        setNewComment(""); // Clear input after adding comment
      } else {
        Alert.alert("Error", "User data not found.");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert("Error", "Failed to add comment.");
    }
  };
  
 
  const handleDeleteComment = async (commentId) => {
    if (!currentUser) {
      Alert.alert("Error", "You must be logged in to delete comments.");
      return;
    }
 
    try {
      const commentRef = doc(db, "posts", postId, "comments", commentId);
      await deleteDoc(commentRef);
    } catch (error) {
      console.error("Error deleting comment:", error);
      Alert.alert("Error", "Failed to delete comment.");
    }
  };
 
  return (
    <View style={styles.postContainer}>
      {/* Post Header */}
      <View style={styles.header}>
        <Image source={{ uri: profilePhoto }} style={styles.profileImage} />
        <Text style={styles.username}>{username}</Text>
      </View>
 
      {/* Post Image */}
      <Image source={{ uri: postData.imageUrl }} style={styles.postImage} />
 
      {/* Post Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity onPress={handleLike}>
          <View style={styles.likeContainer}>
          <Feather style={styles.likeButton} name="heart" size={24} color={liked ? "red" : "black"} />
          <Text style={styles.likeCount}>{likesCount} likes</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity>
          <Feather style={styles.messageButton} name="message-circle" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Feather style={styles.shareButton} name="share" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton}>
          <Feather name="bookmark" size={24} color="black" />
        </TouchableOpacity>
      </View>
 
      {/* Likes and Description */}
      <View style={styles.postDetails}>
        <Text style={styles.description}>
          <Text style={styles.username}>{username} </Text>
          {postData.description}
        </Text>
      </View>
 
      {/* Comments */}
      {comments.length > 0 && (
        <View style={styles.commentsContainer}>
          {comments.map((comment) => (
            <View key={comment.id} style={styles.commentContainer}>
              <Text style={styles.comment}>
                <Text style={styles.username}>{comment.username} </Text>
                {comment.text}
              </Text>
              {comment.userId === currentUser?.uid && (
                <TouchableOpacity onPress={() => handleDeleteComment(comment.id)}>
                  <Feather name="trash-2" size={16} color="red" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
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
    height: 400,
    resizeMode: "cover",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal:50
   },
   likeButton:{
     marginLeft :"auto"
   },
   messageButton:{
     marginLeft :20,
   },
   shareButton:{
     marginLeft :20,
     },
   saveButton:{
     marginLeft :20,
   },
   likeContainer:{
     flexDirection :"row",
     alignItems :"center",
     gap :5,
   },
   likeCount:{
     textweight :"bold",
   },
   description:{
     marginBottom :10,
     left :10
   },
   commentsContainer:{
     paddingHorizontal :10 ,
     marginTop :10
   },
   commentContainer:{
     flexDirection :"row",
     justifyContent :"space-between",
     alignItems :"center",
     marginBottom :5
   },
   comment:{
     flex :1 ,
     fontSize :14 ,
     color:"#333"
   },
   addCommentContainer:{
     flexDirection :"row",
     alignItems :"center",
     paddingHorizontal :10 ,
     paddingVertical :10 ,
     borderTopWidth :1 ,
     borderColor :"#eaeaea"
   },
   commentInput:{
     flex :1 ,
     borderColor :"#eaeaea",
     borderWidth :1 ,
     borderRadius :20 ,
     paddingHorizontal :15 ,
     paddingVertical :8 ,
     marginRight :10 ,
     color:"black"
   }
});
 
export default PostItem;