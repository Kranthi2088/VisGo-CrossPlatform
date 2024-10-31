import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from "react-native";
import { db, auth } from "../configs/FirebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const SearchUsersScreen = () => {
  const [searchText, setSearchText] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search for users based on the username
  const searchUsers = async () => {
    if (searchText.trim() === "") {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", ">=", searchText), where("username", "<=", searchText + "\uf8ff"));
      const querySnapshot = await getDocs(q);

      const results = [];
      querySnapshot.forEach((doc) => {
        if (doc.id !== auth.currentUser.uid) { // Exclude the current user
          results.push({ id: doc.id, ...doc.data() });
        }
      });
      setUsers(results);
    } catch (error) {
      console.error("Error searching for users:", error);
    }
    setLoading(false);
  };

  // Follow user function
  const followUser = async (followedId) => {
    // Implement follow function here or reuse from previous setup
    console.log(`Follow user with ID: ${followedId}`);
  };

  useEffect(() => {
    const timer = setTimeout(searchUsers, 500); // Debounce search
    return () => clearTimeout(timer); // Clear the timer when searchText changes
  }, [searchText]);

  const renderItem = ({ item }) => (
    <View style={styles.userContainer}>
      <Image source={{ uri: item.profilePhoto || "https://picsum.photos/200" }} style={styles.profileImage} />
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.bio} numberOfLines={1}>{item.bio || "No bio available"}</Text>
      </View>
      <TouchableOpacity style={styles.followButton} onPress={() => followUser(item.id)}>
        <Text style={styles.followButtonText}>Follow</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={24} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for users..."
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
      {loading && <Text style={styles.loadingText}>Searching...</Text>}
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={!loading && searchText.length > 0 ? <Text style={styles.noResultsText}>No users found</Text> : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 100,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    marginHorizontal: 15,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
    color: "#333",
  },
  loadingText: {
    textAlign: "center",
    color: "#888",
    fontSize: 16,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    marginHorizontal: 15,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
    marginLeft: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  bio: {
    fontSize: 14,
    color: "#666",
  },
  followButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  followButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  noResultsText: {
    textAlign: "center",
    color: "#888",
    fontSize: 16,
    marginTop: 20,
  },
});

export default SearchUsersScreen;
