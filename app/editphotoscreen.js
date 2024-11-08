import React, { useState, useRef } from "react";
import { View, Image, TouchableOpacity, Text, StyleSheet, TextInput, PanResponder, Animated, Alert } from "react-native";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useRoute } from "@react-navigation/native";
import { db, storage } from "../configs/FirebaseConfig";
import ViewShot from "react-native-view-shot";
import { auth } from "../configs/FirebaseConfig";
import * as ImageManipulator from "expo-image-manipulator";
import { router, useNavigation } from "expo-router";

export default function EditPhotoScreen({  }) {
  const route = useRoute();
  const { photoUri } = route.params;
  const [textInputs, setTextInputs] = useState([]);
  const [currentText, setCurrentText] = useState("");
  const [isPost, setIsPost] = useState(true);
  const viewShotRef = useRef();
  const navigation = useNavigation();

  const handleAddText = () => {
    if (currentText.trim()) {
      setTextInputs([...textInputs, { text: currentText, x: 50, y: 50 }]);
      setCurrentText("");
    }
  };

  const handleUpload = async () => {
    try {
      // Capture the view as an image with overlays
      const uri = await viewShotRef.current.capture();

      // Compress the image before uploading
      const compressedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }], // Resizes to 800px width, adjust if needed
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      const response = await fetch(compressedImage.uri);
      const blob = await response.blob();
      const fileRef = ref(storage, `uploads/${Date.now()}.jpg`);
      await uploadBytes(fileRef, blob);
      const downloadURL = await getDownloadURL(fileRef);

      // Save the post or story to Firestore
      const collectionName = isPost ? "posts" : "stories";
      const userId = auth.currentUser?.uid;
      await addDoc(collection(db, collectionName), {
        userId: userId,
        imageUrl: downloadURL,
        textInputs,
        timestamp: Timestamp.now(),
      });

      // Clear states and navigate back
      setTextInputs([]);
      router.push("/(tabs)/home");
      Alert.alert("Success", isPost ? "Post uploaded!" : "Story uploaded!");
    } catch (error) {
      console.error("Upload failed:", error);
      Alert.alert("Error", "Failed to upload. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <ViewShot ref={viewShotRef} style={styles.viewShot}>  
        <Image source={{ uri: photoUri }} style={styles.image} />
        {textInputs.map((input, index) => (
          <DraggableText 
            key={index} 
            text={input.text} 
            initialX={input.x} 
            initialY={input.y} 
            onDrag={(x, y) => {
              setTextInputs((prev) =>
                prev.map((item, i) => (i === index ? { ...item, x, y } : item))
              );
            }} 
          />
        ))}
      </ViewShot>

      <View style={styles.textOverlay}>
        <TextInput
          style={styles.textInput}
          placeholder="Tap to add text"
          placeholderTextColor="#888"
          value={currentText}
          onChangeText={setCurrentText}
          onSubmitEditing={handleAddText}
        />
        <TouchableOpacity style={styles.addTextButton} onPress={handleAddText}>
          <Text style={styles.addTextButtonText}>Add Text</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.uploadButton} onPress={() => setIsPost(true)}>
          <Text style={[styles.uploadText, isPost && styles.activeButton]}>Post</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.uploadButton} onPress={() => setIsPost(false)}>
          <Text style={[styles.uploadText, !isPost && styles.activeButton]}>Story</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.finalizeButton} onPress={handleUpload}>
          <Text style={styles.finalizeText}>Finalize & Upload</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const DraggableText = ({ text, initialX, initialY, onDrag }) => {
  const pan = useRef(new Animated.ValueXY({ x: initialX, y: initialY })).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
      },
      onPanResponderMove: Animated.event(
        [
          null,
          { dx: pan.x, dy: pan.y },
        ],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        onDrag(pan.x._value, pan.y._value);
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.draggableText,
        pan.getLayout(),
      ]}
      {...panResponder.panHandlers}
    >
      <Text style={styles.overlayText}>{text}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  image: { width: "100%", height: "75%", borderRadius: 8, marginTop: 100 },
  viewShot: {
    width: "100%",
    height: "75%",
    marginTop: 100,
  },
  textOverlay: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    position: "absolute", 
    top: 110, 
    left: 10, 
    right: 10 
  },
  textInput: {
    flex: 1,
    backgroundColor: "#000000aa",
    color: "#fff",
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
    marginRight: 10,
  },
  addTextButton: {
    backgroundColor: "#ff5252",
    padding: 10,
    borderRadius: 5,
  },
  addTextButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  overlayText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  draggableText: {
    position: "absolute",
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 5,
  },
  bottomContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#000",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  uploadButton: { padding: 10, bottom: 40 },
  uploadText: { color: "#888", fontSize: 16 },
  activeButton: { color: "#ff5252", fontWeight: "bold" },
  finalizeButton: {
    backgroundColor: "#ff5252",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    bottom: 40,
  },
  finalizeText: { color: "#fff", fontWeight: "bold" },
});
