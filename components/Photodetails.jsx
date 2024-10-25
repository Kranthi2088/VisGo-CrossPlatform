import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router"; // For route params
import { useFonts, Poppins_400Regular, Poppins_700Bold } from "@expo-google-fonts/poppins";

const { width, height } = Dimensions.get("window");

const PhotoDetails = () => {
  const { uri, caption, photographer } = useLocalSearchParams();
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  const handleLike = () => {
    setIsLiked((prev) => !prev);
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleAddComment = () => {
    if (comment.trim()) {
      setComments([...comments, comment]);
      setComment(""); // Clear input after adding
    }
  };

  if (!fontsLoaded) return null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView>
        {/* Image Section */}
        <Image source={{ uri }} style={styles.image} />

        {/* Details Section */}
        <View style={styles.detailsContainer}>
          <Text style={styles.caption}>{caption || "No Caption"}</Text>
          <Text style={styles.photographer}>By {photographer}</Text>

          {/* Likes and Comments Icons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
              <FontAwesome
                name={isLiked ? "heart" : "heart-o"}
                size={28}
                color={isLiked ? "red" : "#000"}
              />
              <Text style={styles.actionText}>{likes} Likes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="chat-bubble-outline" size={28} color="#000" />
              <Text style={styles.actionText}>{comments.length} Comments</Text>
            </TouchableOpacity>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsContainer}>
            <Text style={styles.commentsHeader}>Comments</Text>
            {comments.length > 0 ? (
              <FlatList
                data={comments}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <Text style={styles.commentItem}>{item}</Text>
                )}
              />
            ) : (
              <Text style={styles.noCommentsText}>No comments yet.</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Comment Input */}
      <View style={styles.commentInputContainer}>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Add a comment..."
          placeholderTextColor="#aaa"
          style={styles.commentInput}
        />
        <TouchableOpacity onPress={handleAddComment} style={styles.sendButton}>
          <MaterialIcons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  image: {
    width: width,
    height: height * 0.5,
    resizeMode: "cover",
  },
  detailsContainer: {
    padding: 16,
  },
  caption: {
    fontFamily: "Poppins_700Bold",
    fontSize: 20,
    color: "#000",
    marginBottom: 8,
  },
  photographer: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    marginLeft: 8,
  },
  commentsContainer: {
    marginTop: 16,
  },
  commentsHeader: {
    fontFamily: "Poppins_700Bold",
    fontSize: 18,
    marginBottom: 8,
  },
  commentItem: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    marginBottom: 4,
  },
  noCommentsText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    color: "#aaa",
    textAlign: "center",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  commentInput: {
    flex: 1,
    height: 40,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 12,
    fontFamily: "Poppins_400Regular",
  },
  sendButton: {
    backgroundColor: "#000",
    borderRadius: 20,
    padding: 10,
    marginLeft: 8,
  },
});

export default PhotoDetails;
