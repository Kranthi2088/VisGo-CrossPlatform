import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { useRouter } from "expo-router";
import { auth, db, storage } from "../configs/FirebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const EditProfile = () => {
  const router = useRouter();
  const user = auth.currentUser;
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    bio: "",
    profilePhoto: "",
    coverPhoto: "",
    dateOfBirth: "",
    gender: "",
    address: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      }
    };
    fetchUserData();
  }, [user]);

  const pickImage = async (setImage, type) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const resizedUri = await resizeImage(result.assets[0].uri);
        const uploadedUrl = await uploadImageToStorage(resizedUri, type);
        setImage(uploadedUrl);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick an image. Please try again.");
    }
  };

  const resizeImage = async (uri) => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      return manipResult.uri;
    } catch (error) {
      console.error("Error resizing image:", error);
      throw new Error("Image resizing failed");
    }
  };

  const uploadImageToStorage = async (uri, type) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const storageRef = ref(storage, `users/${user.uid}/uploads/${type}.jpg`);
      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      throw new Error(`Failed to upload ${type}`);
    }
  };

  const handleSave = async () => {
    try {
      if (!user) {
        Alert.alert("Error", "User not authenticated");
        return;
      }

      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, userData);

      Alert.alert("Success", "Profile updated successfully!");
      router.push("/(tabs)/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile.");
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      Alert.alert("Signed Out", "You have been signed out successfully.");
      router.replace("/auth/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        onPress={() =>
          pickImage((uri) => setUserData({ ...userData, profilePhoto: uri }), "profilePhoto")
        }
      >
        <Image
          source={
            userData.profilePhoto
              ? { uri: userData.profilePhoto }
              : { uri: "https://picsum.photos/200/200" }
          }
          style={styles.image}
        />
        <Text style={styles.text}>Select Profile Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          pickImage((uri) => setUserData({ ...userData, coverPhoto: uri }), "coverPhoto")
        }
      >
        <Image
          source={
            userData.coverPhoto
              ? { uri: userData.coverPhoto }
              : { uri: "https://picsum.photos/300/150" }
          }
          style={styles.coverImage}
        />
        <Text style={styles.text}>Select Cover Photo</Text>
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <Text style={styles.inputHeader}>Username</Text>
        <TextInput
          value={userData.username}
          onChangeText={(text) => setUserData({ ...userData, username: text })}
          style={styles.input}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputHeader}>Email</Text>
        <TextInput
          value={userData.email}
          onChangeText={(text) => setUserData({ ...userData, email: text })}
          style={styles.input}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputHeader}>Bio</Text>
        <TextInput
          value={userData.bio}
          onChangeText={(text) => setUserData({ ...userData, bio: text })}
          placeholder="Bio"
          multiline={true}
          numberOfLines={4}
          style={styles.para_input}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputHeader}>Date of Birth</Text>
        <TextInput
          value={userData.dateOfBirth}
          onChangeText={(text) =>
            setUserData({ ...userData, dateOfBirth: text })
          }
          style={styles.input}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputHeader}>Gender</Text>
        <TextInput
          value={userData.gender}
          onChangeText={(text) => setUserData({ ...userData, gender: text })}
          style={styles.input}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputHeader}>Address</Text>
        <TextInput
          value={userData.address}
          onChangeText={(text) => setUserData({ ...userData, address: text })}
          style={styles.para_input}
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 30,
    marginBottom: 10,
  },
  coverImage: {
    width: width - 40,
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 15,
  },
  inputHeader: {
    fontSize: 16,
    color: "#000",
    marginBottom: 5,
  },
  input: {
    height: 50,
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    paddingHorizontal: 10,
    color: "#fff",
  },
  para_input: {
    height: 120,
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    paddingHorizontal: 10,
    color: "#fff",
  },
  saveButton: {
    backgroundColor: "#000",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
  },
  signOutButton: {
    backgroundColor: "#f44336",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    width: "100%",
  },
  signOutButtonText: {
    color: "#fff",
    fontSize: 18,
  },
});

export default EditProfile;
