import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
  Alert,
} from "react-native";
import Checkbox from "expo-checkbox"; // For Expo users
import { useRouter } from "expo-router";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import * as SplashScreen from "expo-splash-screen"; // Import SplashScreen
import { auth, db } from "../../configs/FirebaseConfig"; // Import Firebase configs
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; // Firestore functions

// Prevent the splash screen from auto-hiding until fonts are loaded
SplashScreen.preventAutoHideAsync();

const SignUp = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isReady, setIsReady] = useState(false); // Track if fonts are loaded

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  // Hide splash screen when fonts are loaded
  useEffect(() => {
    async function prepare() {
      if (fontsLoaded) {
        await SplashScreen.hideAsync();
        setIsReady(true); // Set the app as ready
      }
    }
    prepare();
  }, [fontsLoaded]);

  const onCreateAccount = async () => {
    if (!agreeTerms) {
      Alert.alert("Terms Required", "Please agree to the Terms and Conditions");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Save the user details to Firestore
      await setDoc(doc(db, "users", user.uid), {
        username: username,
        email: email,
        bio: "", // Optional empty fields for later updates
        profilePhoto: "",
        coverPhoto: "",
      });

      console.log("User registered and data saved!");
      router.push("/home"); // Navigate to home page
    } catch (error) {
      console.error("Error during sign-up:", error);
      Alert.alert("Sign Up Failed", error.message); // Display error message
    }
  };

  if (!isReady) {
    return null; // Render nothing until fonts are ready
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Go back button */}
      <TouchableOpacity
        style={styles.goBackButton}
        onPress={() => router.back()}
      >
        <Text style={styles.goBackButtonText}>Go Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Create Your Account</Text>
      <Text style={styles.subtitle}>Find your own community</Text>

      {/* Username Input */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Username"
          placeholderTextColor="#fff"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />
      </View>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Email Address"
          placeholderTextColor="#fff"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Password"
          placeholderTextColor="#fff"
          value={password}
          secureTextEntry
          onChangeText={setPassword}
          style={styles.input}
        />
      </View>

      {/* Agree Terms Checkbox */}
      <View style={styles.checkboxContainer}>
        <Checkbox
          value={agreeTerms}
          onValueChange={setAgreeTerms}
          color={agreeTerms ? "#4A4AFF" : undefined}
        />
        <Text style={styles.checkboxText}>
          I agree to the Terms and Conditions
        </Text>
      </View>

      {/* Create Account Button */}
      <TouchableOpacity
        style={styles.createAccountButton}
        onPress={onCreateAccount}
      >
        <Text style={styles.createAccountButtonText}>Create Account</Text>
      </TouchableOpacity>

      {/* Already have an account? Sign In */}
      <View style={styles.linksContainer}>
        <Text style={styles.linkText}>
          Already have an account?{" "}
          <Text
            style={styles.link}
            onPress={() => router.push("/auth/sign-in")}
          >
            Sign In
          </Text>
        </Text>
      </View>
    </View>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "center",
  },
  goBackButton: {
    position: "absolute",
    top: Platform.select({ ios: 40, android: 20 }),
    left: 15,
    zIndex: 1,
    padding: 10,
  },
  goBackButtonText: {
    color: "#000",
    fontFamily: "Poppins_700Bold",
    fontSize: 16,
  },
  title: {
    fontFamily: "Poppins_700Bold",
    fontSize: 28,
    color: "#000",
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },
  inputContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  input: {
    height: 50,
    color: "#fff",
    fontFamily: "Poppins_400Regular",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkboxText: {
    fontFamily: "Poppins_400Regular",
    color: "#000",
    marginLeft: 10,
  },
  createAccountButton: {
    backgroundColor: "#000",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 15,
  },
  createAccountButtonText: {
    fontFamily: "Poppins_700Bold",
    color: "#fff",
    fontSize: 18,
  },
  linksContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  linkText: {
    color: "#000",
    fontFamily: "Poppins_400Regular",
  },
  link: {
    color: "#000",
    fontFamily: "Poppins_700Bold",
  },
});

export default SignUp;
