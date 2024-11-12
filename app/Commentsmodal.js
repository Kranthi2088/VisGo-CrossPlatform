import React, { useEffect, useState, useCallback, forwardRef } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, Dimensions, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { db, auth } from "../configs/FirebaseConfig";
import { collection, addDoc, onSnapshot, doc, getDoc, query, orderBy, limit } from "firebase/firestore";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Wrap CommentsModal with forwardRef
const CommentsModal = forwardRef(({ visible, onClose, postId }, ref) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (visible) {
      ref?.current?.present();
    } else {
      ref?.current?.dismiss();
    }
  }, [visible]);

  useEffect(() => {
    const commentsRef = collection(db, "posts", postId, "comments");
    const commentsQuery = query(commentsRef, orderBy("timestamp", "desc"), limit(20));

    const unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
      const commentsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setComments(commentsData);
    });

    return () => unsubscribeComments();
  }, [postId]);

  const handleAddComment = useCallback(async () => {
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
  }, [newComment, postId]);

  return (
    <BottomSheetModal
      ref={ref}  // Use the forwarded ref here
      index={0}
      snapPoints={["50%", "75%", "90%"]}
      backdropComponent={(props) => <BottomSheetBackdrop {...props} />}
      onDismiss={onClose}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Comments</Text>

        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.commentContainer}>
              <Text style={styles.username}>{item.username}</Text>
              <Text style={styles.comment}>{item.text}</Text>
            </View>
          )}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add a comment..."
            value={newComment}
            onChangeText={setNewComment}
          />
          <TouchableOpacity onPress={handleAddComment}>
            <Feather name="send" size={20} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  commentContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
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
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#eaeaea",
    paddingVertical: 10,
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
});

export default CommentsModal;