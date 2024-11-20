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
import { onAuthStateChanged } from "firebase/auth";

const IndexScreen = () => {
  const router = useRouter();
  const [authStateChecked, setAuthStateChecked] = useState(false); // Ensure auth is resolved
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  useEffect(() => {
    // Check if the user is authenticated
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log("User authenticated:", currentUser.email);
        router.replace("/(tabs)/home"); // Redirect to home
      } else {
        console.log("No authenticated user.");
        setAuthStateChecked(true); // Allow the login screen to render
      }
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, [router]);

  if (!authStateChecked || !fontsLoaded) {
    // Show a single loading screen until auth state is resolved
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A4AFF" />
      </View>
    );
  }

  return (
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
