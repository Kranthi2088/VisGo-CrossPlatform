import React, { useState, useRef, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Text, Alert } from "react-native";
import { Camera } from "expo-camera/legacy";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const cameraRef = useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setIsCameraActive(true); // Activate camera when the screen is focused
      return () => {
        setIsCameraActive(false); // Deactivate camera when screen is blurred
      };
    }, [])
  );

  const takePicture = async () => {
    if (cameraRef.current && isCameraReady) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo.uri) {
          console.log("Photo taken:", photo.uri);
          setIsCameraActive(false); // Stop the camera
          navigation.navigate("editphotoscreen", { photoUri: photo.uri });
        } else {
          console.warn("Failed to capture photo");
          Alert.alert("Error", "Failed to capture photo.");
        }
      } catch (error) {
        console.error("Error taking picture:", error);
        Alert.alert("Error", "Failed to take picture.");
      }
    }
  };

  if (hasPermission === null) return <View />;
  if (hasPermission === false) return <Text>No access to camera</Text>;

  return (
    <View style={styles.container}>
      {isCameraActive && (
        <Camera
          style={styles.camera}
          ref={cameraRef}
          onCameraReady={() => setIsCameraReady(true)}
          autoFocus={Camera.Constants.AutoFocus.on}
        />
      )}
      <View style={styles.backButton}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
          <Feather name="camera" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  overlay: { position: "absolute", bottom: 20, width: "100%", alignItems: "center" },
  captureButton: { backgroundColor: "#ff5252", padding: 20, borderRadius: 40 },
  backButton: { position: "absolute", top: 40, left: 20, zIndex: 10 },
});
