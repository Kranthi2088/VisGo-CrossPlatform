import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { auth } from "../configs/FirebaseConfig";
import { ScrollView } from "react-native-gesture-handler";

const IndexScreen = () => {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });
  const [loading, setLoading] = useState(true); // Track loading state
  const [user, setUser] = useState(null); // Track authenticated user

  // Check user authentication state asynchronously
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        console.log("Authenticated user:", currentUser.email);
        setUser(currentUser);
        router.push("/tabs/home"); // Navigate to home tab if authenticated
      } else {
        setUser(null);
      }
      setLoading(false); // Stop loading once auth state is resolved
    });

    // Clean up the listener on unmount
    return () => unsubscribe();
  }, []);

  if (loading || !fontsLoaded) {
    // Show a loading spinner until Firebase resolves the auth state
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A4AFF" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
    <View style={styles.container}>
      <StatusBar hidden />
      <Image
        source={require("../assets/images/new.jpg")}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.title}>All thoughts.{"\n"}One place.</Text>
      <Text style={styles.subtitle}>
        Art is the only way to run away without leaving home.{"\n"}
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/auth/sign-in")}
      >
        <Text style={styles.buttonText}>→</Text>
      </TouchableOpacity>
    </View>
    </ScrollView>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 20,
  },
  image: {
    width: width * 0.6,
    height: width * 0.6,
    marginBottom: 30,
  },
  title: {
    fontFamily: "Poppins_700Bold",
    fontSize: 28,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 24,
    color: "white",
  },
});

export default IndexScreen;
