// PostDetails.js
import React from "react";
import { useRoute } from "@react-navigation/native";
import { View, StyleSheet } from "react-native";
import PostItem from "./PostItem"; // Adjust the path if needed

const PostDetails = () => {
  const route = useRoute();
  const { postId, username, profilePhoto, imageUrl, description } = route.params;

  return (
    <View style={styles.container}>
      <PostItem
        postId={postId}
        username={username}
        profilePhoto={profilePhoto}
        postData={{ imageUrl, description }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
});

export default PostDetails;
