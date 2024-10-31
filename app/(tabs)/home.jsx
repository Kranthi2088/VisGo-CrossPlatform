import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const HomeScreen = () => {
  const router = useRouter();

  // Navigate to the Search Users screen
  const goToSearch = () => {
    router.push("../search"); // Make sure the path matches your routing structure
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Page</Text>

      {/* Search Button */}
      <TouchableOpacity style={styles.searchButton} onPress={goToSearch}>
        <MaterialCommunityIcons name="account-search" size={28} color="#000" />
        <Text style={styles.searchText}>Search for People</Text>
      </TouchableOpacity>

      {/* Other Home Content Here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  searchText: {
    fontSize: 16,
    marginLeft: 8,
    color: "#333",
  },
});

export default HomeScreen;
