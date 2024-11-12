import React, { useEffect, useState } from "react";
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { collection, getDocs, getDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "../configs/FirebaseConfig";
import { useNavigation } from "@react-navigation/native";

const StoryBar = () => {
  const [stories, setStories] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const storiesQuery = query(collection(db, "stories"), orderBy("timestamp", "desc"));
        const storiesSnapshot = await getDocs(storiesQuery);

        const storiesData = await Promise.all(
          storiesSnapshot.docs.map(async (storyDoc) => {
            const storyData = storyDoc.data();
            const userId = storyData.userId;

            const userDoc = await getDoc(doc(db, "users", userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              return {
                id: storyDoc.id,
                ...storyData,
                username: userData.username,
                profilePhoto: userData.profilePhoto,
              };
            } else {
              console.warn(`User with ID ${userId} not found`);
              return null;
            }
          })
        );

        setStories(storiesData.filter((story) => story !== null));
      } catch (error) {
        console.error("Error fetching stories:", error);
      }
    };

    fetchStories();
  }, []);

  const openStoryViewer = (story) => {
    navigation.navigate("Storyviewer", { story });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.storyItem} onPress={() => openStoryViewer(item)}>
      <Image source={{ uri: item.profilePhoto }} style={styles.storyImage} />
      <Text style={styles.storyUsername} numberOfLines={1}>{item.username}</Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={stories}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.storyBar}
    />
  );
};

const styles = StyleSheet.create({
  storyBar: {
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  storyItem: {
    alignItems: "center",
    marginHorizontal: 8,
  },
  storyImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#ff5252",
  },
  storyUsername: {
    marginTop: 5,
    fontSize: 12,
    color: "#333",
    width: 60,
    textAlign: "center",
  },
});

export default StoryBar;
