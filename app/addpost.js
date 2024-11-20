import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db, auth } from "../configs/FirebaseConfig";



const CreatePost = ({ profileImage, onPost }) => {
  const router = useNavigation();
  const [postText, setPostText] = useState("");

  const handlePost = async () => {
    const trimmedText = postText.trim();
    if (trimmedText) {
      try {
        const post = {
          textContent: trimmedText,
          timestamp: Timestamp.now(),
          userId: auth.currentUser?.uid,
        };
        
        await addDoc(collection(db, "posts"), post);
        onPost(); // Trigger refresh in HomeScreen or wherever necessary
        setPostText(""); // Clear the input
      } catch (error) {
        console.error("Error posting:", error);
        Alert.alert("Error", "Failed to create post.");
      }
    } else {
      Alert.alert("Empty Post", "Please enter some text to post.");
    }
  };
  
  const handleSearchPress = () => {
    router.push("search");
  };

  const handleOpenCamera = () => {
    router.push("camerascreen"); // Make sure to register this screen in your navigator
  };

  return (
    <View style={styles.container}>
      {/* Profile Image and Input Field */}
      <View style={styles.inputContainer}>
        <Image
          source={{ uri: profileImage || "https://picsum.photos/200" }}
          style={styles.profileImage}
        />
        <TextInput
          style={styles.input}
          placeholder="Write something..."
          placeholderTextColor="#888"
          value={postText}
          onChangeText={setPostText}
        />
        {/* Search Icon */}
        <TouchableOpacity onPress={handleSearchPress} style={styles.searchIcon}>
          <Feather name="search" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Icons for image, video, location, and emoji */}
      <View style={styles.iconContainer}>
      <TouchableOpacity onPress={handleOpenCamera} style={styles.icon}>
          <Feather name="image" size={20} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Feather name="video" size={24} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Feather name="map-pin" size={24} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Feather name="smile" size={24} color="#888" />
        </TouchableOpacity>
        {/* Post Button */}
        <TouchableOpacity style={styles.postButton} onPress={handlePost}>
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#ffffff",
    borderRadius: 8,
  },
  inputContainer: {
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
  input: {
    flex: 1,
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#333",
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  searchIcon: {
    paddingLeft: 10,
  },
  postButton: {
    backgroundColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  postButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default CreatePost;
