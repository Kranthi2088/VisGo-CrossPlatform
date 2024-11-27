import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import Checkbox from "expo-checkbox";
import { useRouter } from "expo-router";
import { auth } from "../../configs/FirebaseConfig";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { LogBox } from 'react-native';
LogBox.ignoreLogs([' @firebase/firestore: Firestore (10.14.1)']);

const SignIn = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Check for existing session on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If user is already signed in, navigate to the home screen
        router.push("../(tabs)/home");
      } else {
        // Allow login UI to render
        setIsCheckingSession(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const onSignIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        router.push("/(tabs)/home"); // Navigate to home on successful login
      })
      .catch((error) => {
        alert("Invalid email or password");
      });
  };

  if (isCheckingSession) {
    // Display a loading indicator while checking for existing session
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Go back button */}
      <TouchableOpacity
        style={styles.goBackButton}
        onPress={() => router.push("/")}
      >
        <Text style={styles.goBackButtonText}>Back</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  // Reuse your existing styles
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "center",
  },
  goBackButton: {
    position: "absolute",
    top: 20,
    left: 15,
    zIndex: 1,
    padding: 10,
  },
  goBackButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    color: "#000",
    marginBottom: 10,
  },
  subtitle: {
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
  },
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  rememberText: {
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
    color: "#fff",
    fontSize: 18,
  },
  linksContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  linkText: {
    color: "#000",
  },
  link: {
    color: "#000",
    fontWeight: "bold",
  },
});

export default SignIn;
