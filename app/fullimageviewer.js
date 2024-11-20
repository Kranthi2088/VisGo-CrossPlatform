import React from "react";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";

const FullImageViewer = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { imageUrl } = route.params; // Get the image URL from the route params

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Full-Screen Image */}
      <Image source={{ uri: imageUrl }} style={styles.fullImage} resizeMode="contain" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
});

export default FullImageViewer;
