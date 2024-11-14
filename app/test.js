// import React, { useState, useEffect } from "react";
// import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from "react-native";
// import { Feather } from "@expo/vector-icons";
// import { db, auth } from "../configs/FirebaseConfig";
// import { doc, collection, addDoc, deleteDoc, setDoc, onSnapshot } from "firebase/firestore";
// import CommentsModal from "./Commentsmodal"; // Import the CommentsModal

// const PostItem = ({ postData, username, profilePhoto, postId }) => {
//   const { textContent, imageUrl } = postData;
//   const [liked, setLiked] = useState(false);
//   const [likesCount, setLikesCount] = useState(0);
//   const [commentsCount, setCommentsCount] = useState(0);
//   const [isCommentsModalVisible, setCommentsModalVisible] = useState(false);

//   const currentUser = auth.currentUser;

//   useEffect(() => {
//     if (!postId) return;

//     const likesRef = collection(db, "posts", postId, "likes");
//     const commentsRef = collection(db, "posts", postId, "comments");

//     const unsubscribeLikes = onSnapshot(likesRef, (snapshot) => {
//       setLikesCount(snapshot.size);
//       if (currentUser) {
//         setLiked(snapshot.docs.some((doc) => doc.id === currentUser.uid));
//       }
//     });

//     const unsubscribeComments = onSnapshot(commentsRef, (snapshot) => {
//       setCommentsCount(snapshot.size); // Track comments count
//     });

//     return () => {
//       unsubscribeLikes();
//       unsubscribeComments();
//     };
//   }, [postId]);

//   const handleLike = async () => {
//     if (!currentUser) {
//       Alert.alert("Error", "You must be logged in to like posts.");
//       return;
//     }

//     const likeRef = doc(db, "posts", postId, "likes", currentUser.uid);

//     try {
//       if (liked) {
//         await deleteDoc(likeRef);
//       } else {
//         await setDoc(likeRef, {
//           userId: currentUser.uid,
//           timestamp: new Date(),
//         });
//       }
//       setLiked(!liked);
//     } catch (error) {
//       console.error("Error toggling like:", error);
//       Alert.alert("Error", "Failed to update like.");
//     }
//   };

//   const openCommentsModal = () => {
//     setCommentsModalVisible(true);
//   };

//   const closeCommentsModal = () => {
//     setCommentsModalVisible(false);
//   };

//   return (
//     <View style={styles.postContainer}>
//       {/* Header with Profile Image and Username */}
//       <View style={styles.header}>
//         <Image source={{ uri: profilePhoto }} style={styles.profileImage} />
//         <View>
//           <Text style={styles.username}>{username}</Text>
//           <Text style={styles.timestamp}>2h</Text>
//         </View>
//       </View>

//       {/* Content Section */}
//       {textContent ? (
//         <Text style={styles.textContent}>{textContent}</Text>
//       ) : (
//         <Image source={{ uri: imageUrl }} style={styles.postImage} />
//       )}

//       {/* Actions */}
//       <View style={styles.actionsContainer}>
//         <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
//           <Feather name="heart" size={18} color={liked ? "red" : "black"} />
//           <Text style={styles.actionText}>{likesCount}</Text>
//         </TouchableOpacity>
//         <TouchableOpacity onPress={openCommentsModal} style={styles.actionButton}>
//           <Feather name="message-circle" size={18} color="black" />
//           <Text style={styles.actionText}>{commentsCount}</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.actionButton}>
//           <Feather name="share" size={18} color="black" />
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.actionButton}>
//           <Feather name="bookmark" size={18} color="black" />
//         </TouchableOpacity>
//       </View>

//       {/* Comments Modal */}
//       <CommentsModal
//         visible={isCommentsModalVisible}
//         onClose={closeCommentsModal}
//         postId={postId}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   postContainer: {
//     backgroundColor: "#fff",
//     padding: 15,
//     marginVertical: 8,
//     borderRadius: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     width: "95%",
//     alignSelf: "center",
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   profileImage: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     marginRight: 10,
//   },
//   username: {
//     fontWeight: "bold",
//     fontSize: 15,
//   },
//   timestamp: {
//     fontSize: 12,
//     color: "gray",
//   },
//   textContent: {
//     fontSize: 16,
//     color: "#333",
//     lineHeight: 24,
//     marginVertical: 10,
//   },
//   postImage: {
//     width: "100%",
//     height: 300,
//     borderRadius: 10,
//     marginVertical: 10,
//   },
//   actionsContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingTop: 10,
//     borderTopWidth: 1,
//     borderTopColor: "#eaeaea",
//     marginTop: 10,
//   },
//   actionButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 5,
//   },
//   actionText: {
//     fontSize: 14,
//     color: "gray",
//     marginLeft: 5,
//   },
// });

// export default PostItem;
