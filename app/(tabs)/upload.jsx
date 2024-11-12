import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { useRouter } from "expo-router";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, doc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { storage, db, auth } from "../../configs/FirebaseConfig";
import { useFonts, Poppins_400Regular, Poppins_700Bold } from "@expo-google-fonts/poppins";

const { width } = Dimensions.get("window");

const UploadScreen = () => {
  const router = useRouter();
  const user = auth.currentUser;

  const [imageUri, setImageUri] = useState(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 1, height: 1 });

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  // Image Picker function
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        const { uri, width, height } = result.assets[0];

        // Compress the image
        const compressedImage = await ImageManipulator.manipulateAsync(
          uri,
          [],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        setImageDimensions({ width: width || 1, height: height || 1 });
        setImageUri(compressedImage.uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image.");
    }
  };

  // Image Upload function
  const uploadImage = async () => {
    if (!imageUri) {
      Alert.alert("No Image Selected", "Please select an image to upload.");
      return;
    }

    try {
      setIsUploading(true);
      const filename = imageUri.split("/").pop();
      const storageRef = ref(storage, `users/${user.uid}/uploads/${filename}`);

      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Upload the image to Firebase storage
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      // Generate a new post ID
      const postId = doc(collection(db, "posts")).id;

      // Prepare post data with description, location, and image URL
      const postData = {
        imageUrl: downloadURL,
        description: description,
        location: location,
        userId: user.uid,
        timestamp: new Date(),
      };

      // Save the post to Firestore
      const postRef = doc(db, "posts", postId);
      await setDoc(postRef, postData);

      // Update the user's document to include the new postId
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        postIds: arrayUnion(postId),
      });

      Alert.alert("Success", "Image uploaded and post created successfully!");
      setImageUri(null);
      setDescription("");
      setLocation("");
      router.replace("/(tabs)/profile");
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Upload Failed", "Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#000" />;
  }

  return (
    <ScrollView >
    <View style={styles.container}>
      <Text style={styles.title}>Upload Your Photo</Text>

      {/* Image Preview */}
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={[
            styles.imagePreview,
            {
              aspectRatio:
                imageDimensions.width / imageDimensions.height || 1, // Ensure valid aspect ratio
            },
          ]}
        />
      ) : (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>No Image Selected</Text>
        </View>
      )}

      {/* Description Input */}
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Add a description..."
        placeholderTextColor="#aaa"
        style={styles.input}
      />

      {/* Location Input */}
      <TextInput
        value={location}
        onChangeText={setLocation}
        placeholder="Add a location..."
        placeholderTextColor="#aaa"
        style={styles.input}
      />

      {/* Pick Image Button */}
      <TouchableOpacity style={styles.pickButton} onPress={pickImage}>
        <Text style={styles.buttonText}>Pick an Image</Text>
      </TouchableOpacity>

      {/* Upload Button */}
      <TouchableOpacity
        style={[
          styles.uploadButton,
          { backgroundColor: imageUri ? "#000" : "#aaa" },
        ]}
        onPress={uploadImage}
        disabled={!imageUri || isUploading}
      >
        {isUploading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Upload Image</Text>
        )}
      </TouchableOpacity>
    </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    bottom: 80
  },
  title: {
    fontFamily: "Poppins_700Bold",
    fontSize: 24,
    color: "#000",
    marginBottom: 30,
  },
  placeholderContainer: {
    width: width - 40,
    height: 300,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 20,
  },
  placeholderText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    color: "#666",
  },
  imagePreview: {
    width: width-50 ,
    borderRadius: 10,
    marginBottom: 20,
    resizeMode: "contain",
  },
  input: {
    width: width - 40,
    height: 50,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginVertical: 10,
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
  },
  pickButton: {
    backgroundColor: "#000",
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginBottom: 15,
  },
  uploadButton: {
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  buttonText: {
    fontFamily: "Poppins_700Bold",
    color: "#fff",
    fontSize: 18,
  },
});

export default UploadScreen;
