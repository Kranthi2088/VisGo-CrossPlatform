import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Alert,
  Linking,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { PEXELS_API_KEY } from "../configs/ApiConfig";
import { useFonts, Poppins_400Regular, Poppins_700Bold } from "@expo-google-fonts/poppins";
import { db, auth } from "../configs/FirebaseConfig";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";

const { width } = Dimensions.get("window");

const ImageDetails = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [imageData, setImageData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false); // New state to track if image is saved

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  const fetchImageDetails = async (imageId) => {
    try {
      const response = await fetch(
        `https://api.pexels.com/v1/photos/${imageId}`,
        {
          headers: {
            Authorization: PEXELS_API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch image details.");
      }

      const data = await response.json();
      setImageData(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load image details.");
      Alert.alert("Error", err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchImageDetails(id);
    }
  }, [id]);

  // Check if the image is already saved
  useEffect(() => {
    const checkIfSaved = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser || !id) return;

      const savedPostRef = doc(db, "users", currentUser.uid, "saved_posts", id.toString());
      const savedPostSnap = await getDoc(savedPostRef);
      setIsSaved(savedPostSnap.exists());
    };

    checkIfSaved();
  }, [id]);

  const toggleSaveImage = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser || !imageData) {
      Alert.alert("Error", "You must be logged in to save images.");
      return;
    }

    const savedPostRef = doc(db, "users", currentUser.uid, "saved_posts", imageData.id.toString());

    try {
      if (isSaved) {
        // If already saved, delete it
        await deleteDoc(savedPostRef);
        setIsSaved(false);
        Alert.alert("Success", "Image removed from your collection!");
      } else {
        // If not saved, add it
        await setDoc(savedPostRef, {
          postId: imageData.id.toString(),
          uri: imageData.src.large,
          photographer: imageData.photographer,
          source: "pexels", // Label as coming from Pexels
          timestamp: new Date(),
        });
        setIsSaved(true);
        Alert.alert("Success", "Image saved to your collection!");
      }
    } catch (error) {
      console.error("Error toggling image save state:", error);
      Alert.alert("Error", "Failed to update save state.");
    }
  };

  if (isLoading) {
    return <ActivityIndicator size="large" color="#000" style={styles.loader} />;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  const openPhotographerLink = () => {
    const instagramURL = imageData.photographer_url;
    Linking.openURL(instagramURL);
  };

  return (
    <View style={styles.container_out}>
      <StatusBar hidden />

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={28} color="#000" />
      </TouchableOpacity>

      <ScrollView>
        <View style={styles.container}>
          {imageData && (
            <>
              <Image
                source={{ uri: imageData.src.large }}
                style={[
                  styles.image,
                  { aspectRatio: imageData.width / imageData.height },
                ]}
              />

              <View style={styles.detailsContainer}>
                <Text style={styles.photographerLabel}>Photographer:</Text>
                <TouchableOpacity onPress={openPhotographerLink}>
                  <Text style={styles.photographerLink}>
                    {imageData.photographer}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.info}>
                  Dimensions: {imageData.width} x {imageData.height}
                </Text>
              </View>

              {/* Save/Unsave Button */}
              <TouchableOpacity style={styles.saveButton} onPress={toggleSaveImage}>
                <Text style={styles.saveButtonText}>
                  {isSaved ? "Unsave from Collection" : "Save to Collection"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container_out: {
    flexGrow: 1,
    backgroundColor: "#fff",
  },
  container: {
    backgroundColor: "#fff",
    alignItems: "center",
    padding: 20,
    justifyContent: "center",
    marginTop: 120, 
  },
  backButton: {
    position: "absolute",
    top: 75,
    left: 20,
    zIndex: 10,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  image: {
    width: width - 40,
    borderRadius: 20,
    marginBottom: 20,
    resizeMode: "contain",
  },
  detailsContainer: {
    width: "100%",
    alignItems: "center",
  },
  photographerLabel: {
    fontFamily: "Poppins_700Bold",
    fontSize: 18,
    marginBottom: 5,
    color: "#333",
  },
  photographerLink: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    color: "#4A90E2",
    textDecorationLine: "underline",
    marginBottom: 10,
  },
  info: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#666",
  },
  errorText: {
    color: "red",
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    marginTop: 20,
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: "#4A90E2",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  saveButtonText: {
    fontFamily: "Poppins_700Bold",
    color: "#fff",
    fontSize: 16,
  },
});

export default ImageDetails;
