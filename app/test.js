// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
//   StatusBar,
//   Alert,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { auth, db } from "../../configs/FirebaseConfig";
// import { doc, getDoc } from "firebase/firestore";
// import MasonryList from "react-native-masonry-list"; // Make sure it's installed
// import { MaterialCommunityIcons } from "@expo/vector-icons";

// const { width } = Dimensions.get("window");

// const ProfileScreen = () => {
//   const router = useRouter();
//   const user = auth.currentUser;
//   const [userData, setUserData] = useState({
//     username: "",
//     email: "",
//     bio: "",
//     profilePhoto: "",
//     coverPhoto: "",
//     uploadedPhotos: [],
//   });

//   useEffect(() => {
//     const fetchUserData = async () => {
//       if (user) {
//         try {
//           const docRef = doc(db, "users", user.uid);
//           const docSnap = await getDoc(docRef);

//           if (docSnap.exists()) {
//             const data = docSnap.data();
//             setUserData((prevState) => ({
//               ...prevState,
//               ...data,
//               uploadedPhotos: data.uploadedPhotos || [],
//             }));
//           } else {
//             console.log("No user data found");
//           }
//         } catch (error) {
//           console.error("Error fetching user data:", error);
//           Alert.alert("Error", "Failed to fetch user data");
//         }
//       }
//     };

//     fetchUserData();
//   }, [user]);

//   return (
//     <View style={styles.container}>
//       <StatusBar hidden />

//       {/* Cover Photo */}
//       <Image
//         source={
//           userData.coverPhoto
//             ? { uri: userData.coverPhoto }
//             : { uri: "https://picsum.photos/200/200" }
//         }
//         style={styles.coverPhoto}
//       />
//       <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//         <Image source={{ uri: userData.profilePhoto }} style={styles.profilePhoto} />
//         <View style={styles.statsContainer}>
//           <View style={styles.stat}>
//             <Text style={styles.statNumber}>
//               {userData.uploadedPhotos.length}
//             </Text>
//             <Text style={styles.statLabel}>Posts</Text>
//           </View>
//           <View style={styles.stat}>
//             <Text style={styles.statNumber}>100</Text>
//             <Text style={styles.statLabel}>Followers</Text>
//           </View>
//           <View style={styles.stat}>
//             <Text style={styles.statNumber}>100</Text>
//             <Text style={styles.statLabel}>Following</Text>
//           </View>
//         </View>
//       </View>

//       <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
//         <Image
//           source={
//             userData.profilePhoto
//               ? { uri: userData.profilePhoto }
//               : { uri: "https://picsum.photos/200/200" }
//           }
//           style={styles.profileImage}
//         />
//         <View style={{ marginLeft: 25, flex: 1, marginTop: 10 }}>
//           <Text style={styles.username}>{userData.username || "Username"}</Text>
//           <Text style={styles.bio}>{userData.bio || "Bio goes here..."}</Text>
//         </View>
//       </View>

//       <View style={styles.infoContainer}>
//         <View style={styles.infoItem}>
//           <MaterialCommunityIcons name="calendar" size={24} color="black" />
//           <Text style={styles.infoText}>{userData.dateOfBirth || "Date of Birth"}</Text>
//         </View>

//         <View style={styles.infoItem}>
//           <MaterialCommunityIcons name="map-marker" size={24} color="black" />
//           <Text style={styles.infoText}>{userData.address || "Address"}</Text>
//         </View>
//       </View>

//       <TouchableOpacity
//         style={styles.editButton}
//         onPress={() => router.push("../edit-profile")}
//       >
//         <Text style={styles.editButtonText}>Edit Profile</Text>
//       </TouchableOpacity>

//       {userData.uploadedPhotos.length > 0 ? (
//         <MasonryList
//           images={userData.uploadedPhotos.map((photo) => ({
//             uri: photo,
//           }))}
//           columns={2} // Two columns for masonry layout
//           spacing={2} // Adjust spacing between images
//           imageContainerStyle={styles.photoContainer}
//         />
//       ) : (
//         <Text style={styles.noPhotosText}>No photos to display</Text>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   coverPhoto: {
//     width,
//     height: 200,
//     resizeMode: "cover",
//   },
//   profilePhoto: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     borderWidth: 3,
//     borderColor: "#fff",
//     alignSelf: "flex-start",
//     marginTop: -40,
//     marginLeft: 20,
//   },
//   statsContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginVertical: 10,
//     marginHorizontal: 25,
//   },
//   stat: {
//     alignItems: "center",
//     justifyContent: "space-around",
//     marginHorizontal: 15,
//   },
//   statNumber: {
//     fontSize: 20,
//     fontWeight: "bold",
//   },
//   statLabel: {
//     fontSize: 14,
//     color: "#666",
//   },
//   infoContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     width: "80%",
//     marginLeft: 15,
//     marginBottom: 10,
//   },
//   infoItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginHorizontal: 10,
//   },
//   infoText: {
//     fontFamily: "Poppins_400Regular",
//     fontSize: 16,
//     color: "#000",
//     marginLeft: 5,
//   },
//   editButton: {
//     backgroundColor: "#000",
//     borderRadius: 10,
//     paddingVertical: 15,
//     marginHorizontal: 20,
//     alignItems: "center",
//     marginTop: 10,
//   },
//   editButtonText: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 18,
//   },
//   photoContainer: {
//     borderRadius: 10,
//     overflow: "hidden",
//   },
//   noPhotosText: {
//     textAlign: "center",
//     fontSize: 18,
//     marginTop: 20,
//     color: "#666",
//   },
// });

// export default ProfileScreen;
