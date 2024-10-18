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
  ToastAndroid,
} from "react-native";
import Checkbox from "expo-checkbox";
import { useRouter } from "expo-router";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import * as SplashScreen from "expo-splash-screen"; // Import SplashScreen
import { auth } from "../../configs/FirebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

// Prevent the splash screen from auto-hiding until fonts are loaded
SplashScreen.preventAutoHideAsync();

const SignIn = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isReady, setIsReady] = useState(false); // Track if the app is ready

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  // Hide the splash screen when fonts are loaded
  useEffect(() => {
    async function prepare() {
      if (fontsLoaded) {
        await SplashScreen.hideAsync(); // Hide the splash screen
        setIsReady(true); // Set the app as ready
      }
    }
    prepare();
  }, [fontsLoaded]);

  const onSignIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log(user);
        router.push("/home"); // Navigate to home
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
        if (errorCode === "auth/invalid-credential") {
            alert("Invalid email or password");
        }
      });
  };

  if (!isReady) {
    return null; // Display nothing until the app is ready
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Go back button */}
      <TouchableOpacity
        style={styles.goBackButton}
        onPress={() => router.back()}
      >
        <Text style={styles.goBackButtonText}> Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Welcome!</Text>
      <Text style={styles.subtitle}>Sign into your account.</Text>

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

      {/* Remember Me Checkbox */}
      <View style={styles.rememberContainer}>
        <Checkbox
          value={rememberMe}
          onValueChange={setRememberMe}
          color={rememberMe ? "#000" : undefined}
        />
        <Text style={styles.rememberText}>Remember Me</Text>
      </View>

      {/* Sign In Button */}
      <TouchableOpacity onPress={onSignIn} style={styles.signInButton}>
        <Text style={styles.signInButtonText}>Sign In</Text>
      </TouchableOpacity>

      {/* Sign Up & Forgot Password */}
      <View style={styles.linksContainer}>
        <Text style={styles.linkText}>
          Don't have an account?{" "}
          <Text
            style={styles.link}
            onPress={() => router.push("/auth/sign-up")}
          >
            Sign Up
          </Text>
        </Text>
        <TouchableOpacity onPress={() => router.push("/auth/forgot-password")}>
          <Text style={styles.link}>Forgot Password</Text>
        </TouchableOpacity>
      </View>

      {/* Separator */}
      <View style={styles.separatorContainer}>
        <View style={styles.separator} />
        <Text style={styles.orText}>OR</Text>
        <View style={styles.separator} />
      </View>

      {/* Sign in with Google */}
      <TouchableOpacity style={styles.googleButton}>
        <Text style={styles.googleButtonText}>Sign In With Google</Text>
      </TouchableOpacity>
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
    color: "white",
    fontFamily: "Poppins_400Regular",
  },
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  rememberText: {
    fontFamily: "Poppins_400Regular",
    color: "#000",
    marginLeft: 10,
  },
  signInButton: {
    backgroundColor: "#000",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 15,
  },
  signInButtonText: {
    fontFamily: "Poppins_700Bold",
    color: "#fff",
    fontSize: 18,
  },
  linksContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  linkText: {
    color: "#000",
    fontFamily: "Poppins_400Regular",
  },
  link: {
    color: "#000",
    fontFamily: "Poppins_700Bold",
  },
  forgotPassword: {
    color: "#000",
    marginTop: 5,
    fontFamily: "Poppins_400Regular",
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: "#333",
  },
  orText: {
    fontFamily: "Poppins_400Regular",
    color: "#666",
    marginHorizontal: 10,
  },
  googleButton: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
  },
  googleButtonText: {
    fontFamily: "Poppins_700Bold",
    color: "#000",
    fontSize: 16,
  },
});

export default SignIn;
