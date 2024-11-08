import React, { useEffect, useRef } from "react";
import { View, Text, Image, StyleSheet, Animated } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { PanGestureHandler } from "react-native-gesture-handler";

const StoryViewer = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { story } = route.params;

  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: false,
    }).start();

    const timer = setTimeout(() => {
      navigation.goBack();
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigation, progress]);

  const progressBarWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const onSwipeDown = () => {
    navigation.goBack();
  };

  return (
    <PanGestureHandler onGestureEvent={({ nativeEvent }) => {
      if (nativeEvent.translationY > 100) onSwipeDown();
    }}>
      <View style={styles.container}>
        <Animated.View style={[styles.progressBar, { width: progressBarWidth }]} />
        <Text style={styles.username}>{story.username}</Text>
        <Image source={{ uri: story.imageUrl }} style={styles.storyImage} />
      </View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  progressBar: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 3,
    backgroundColor: "#ff5252",
  },
  username: {
    position: "absolute",
    top: 50,
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  storyImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});

export default StoryViewer;
