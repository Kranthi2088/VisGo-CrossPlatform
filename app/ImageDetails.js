import React, { useState, useEffect } from "react";
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
import { useLocalSearchParams, useRouter } from "expo-router"; // Import router for navigation
import { MaterialIcons } from "@expo/vector-icons"; // For the back icon
import { PEXELS_API_KEY } from "../configs/ApiConfig"; // API Key
import { useFonts, Poppins_400Regular, Poppins_700Bold } from "@expo-google-fonts/poppins";

const { width } = Dimensions.get("window");

const ImageDetails = () => {
  const router = useRouter(); // Initialize router
  const { id } = useLocalSearchParams(); // Get the ID from route params
  const [imageData, setImageData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
      setImageData(data); // Store the fetched image data
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
      fetchImageDetails(id); // Fetch image details using the ID
    }
  }, [id]);

  if (isLoading) {
    return <ActivityIndicator size="large" color="#000" style={styles.loader} />;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  const openPhotographerLink = () => {
    const instagramURL = imageData.photographer_url;
    Linking.openURL(instagramURL); // Open the photographer's Instagram
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
              {/* Image with Original Dimensions and Rounded Corners */}
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
    borderRadius: 20, // Rounded corners
    marginBottom: 20,
    resizeMode: "contain", // Ensure original aspect ratio is maintained
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
    color: "#4A90E2", // Aesthetic blue hyperlink color
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
});

export default ImageDetails;
