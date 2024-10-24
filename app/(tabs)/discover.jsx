import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router"; // Import router for navigation
import { PEXELS_API_KEY } from "../../configs/ApiConfig";


import { useFonts, Poppins_400Regular, Poppins_700Bold } from "@expo-google-fonts/poppins";

const { width } = Dimensions.get("window");
const IMAGE_MARGIN = 5;

const DiscoverScreen = () => {
  const [images, setImages] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter(); // Initialize router

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  const fetchImages = async (searchQuery = "Street Photography") => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${searchQuery}&per_page=30`,
        {
          headers: {
            Authorization: PEXELS_API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch images.");
      }

      const data = await response.json();
      const photos = data.photos.map((photo) => ({
        uri: photo.src.large,
        id: photo.id.toString(),
        width: photo.width,
        height: photo.height,
        photographer: photo.photographer,
      }));
      setImages(photos);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch images. Please try again.");
      Alert.alert("Error", err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages(); // Fetch initial images on mount
  }, []);

  const handleSearch = () => {
    if (query.trim()) {
      fetchImages(query); // Perform search
    } else {
      Alert.alert("Invalid Input", "Please enter a search term.");
    }
  };

   const renderImage = ({ item }) => {
    const aspectRatio = item.width / item.height;
    return (
      <TouchableOpacity
  style={[styles.imageContainer, { aspectRatio }]}
  onPress={() =>
    router.push({
      pathname: "/ImageDetails", // Path to ImageDetails screen
      params: {
        id: item.id, // Pass the image ID correctly
      },
    })
  }
>
  <Image source={{ uri: item.uri }} style={styles.image} />
  <Text style={styles.imageText}>{item.photographer}</Text>
</TouchableOpacity>



    );
  };

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#000" />;
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          value={query}
          onChangeText={(text) => setQuery(text)}
          placeholder="Search images..."
          placeholderTextColor="#aaa"
          style={styles.searchInput}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity onPress={handleSearch}>
          <MaterialIcons name="search" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Masonry Layout */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#000" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={images}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={renderImage}
          contentContainerStyle={{ paddingBottom: 10 }}
          columnWrapperStyle={{ justifyContent: "space-between" }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginVertical: 20,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    color: "#000",
  },
  errorText: {
    textAlign: "center",
    color: "red",
    fontFamily: "Poppins_400Regular",
    marginBottom: 10,
  },
  imageContainer: {
    flex: 1,
    margin: IMAGE_MARGIN,
    borderRadius: 10,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#fff",
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 5,
    borderRadius: 5,
  },
});

export default DiscoverScreen;

