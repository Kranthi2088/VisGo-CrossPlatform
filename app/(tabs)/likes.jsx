import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from "react-native";
import { db, auth } from "../../configs/FirebaseConfig";
import { collection, query, where, onSnapshot, orderBy, getDoc, doc } from "firebase/firestore";
import moment from "moment";

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState({ new: [], yesterday: [], lastWeek: [] });

  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchNotifications = () => {
      if (!currentUser) return; // Ensure user is logged in

      const notificationsRef = collection(db, "notifications");
      const notificationsQuery = query(
        notificationsRef,
        where("targetUserId", "==", currentUser.uid),
        orderBy("timestamp", "desc")
      );

      const unsubscribe = onSnapshot(notificationsQuery, async (snapshot) => {
        const today = moment();
        const groupedNotifications = { new: [], yesterday: [], lastWeek: [] };

        for (const notificationDoc of snapshot.docs) {
          const notification = notificationDoc.data();
          const timestamp = moment(notification.timestamp.toDate());

          // Fetch additional user data only if userId exists
          let userData = {};
          if (notification.actorUserId) {
            const userDocRef = doc(db, "users", notification.actorUserId);
            const userDocSnap = await getDoc(userDocRef);
            userData = userDocSnap.exists() ? userDocSnap.data() : {};
          }

          const formattedNotification = {
            id: notificationDoc.id,
            ...notification,
            username: userData.username || "Unknown",
            profilePhoto: userData.profilePhoto || "https://picsum.photos/200",
            timestamp: timestamp,
          };

          const timeDiff = today.diff(timestamp, "days");
          if (timeDiff < 1) {
            groupedNotifications.new.push(formattedNotification);
          } else if (timeDiff === 1) {
            groupedNotifications.yesterday.push(formattedNotification);
          } else if (timeDiff <= 7) {
            groupedNotifications.lastWeek.push(formattedNotification);
          }
        }

        setNotifications(groupedNotifications);
      });

      return () => unsubscribe();
    };

    fetchNotifications();
  }, []);

  const renderNotification = ({ item }) => (
    <View style={styles.notificationContainer}>
      <Image source={{ uri: item.profilePhoto }} style={styles.profileImage} />
      <View style={styles.notificationTextContainer}>
        <Text style={styles.notificationText}>
          <Text style={styles.username}>{item.username}</Text> {item.type === "like" ? "liked your post" : item.type === "comment" ? "commented on your post" : "started following you"}
        </Text>
        <Text style={styles.timestamp}>{moment(item.timestamp).fromNow()}</Text>
      </View>
      {item.type === "follow" && (
        <TouchableOpacity style={styles.followButton}>
          <Text style={styles.followButtonText}>Follow</Text>
        </TouchableOpacity>
      )}
      {item.postId && item.type !== "follow" && item.postThumbnail && (
        <Image source={{ uri: item.postThumbnail }} style={styles.postThumbnail} />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>New</Text>
      <FlatList
        data={notifications.new}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
      />
      {/* <Text style={styles.sectionTitle}>Yesterday</Text>
      <FlatList
        data={notifications.yesterday}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
      /> */}
      <Text style={styles.sectionTitle}>Last 7 days</Text>
      <FlatList
        data={notifications.lastWeek}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    padding: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 10,
  },
  notificationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  notificationTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  notificationText: {
    fontSize: 15,
    color: "#333",
  },
  username: {
    fontWeight: "bold",
  },
  timestamp: {
    fontSize: 12,
    color: "gray",
    marginTop: 2,
  },
  followButton: {
    backgroundColor: "#1DA1F2",
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  followButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  postThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginLeft: 10,
  },
});

export default NotificationsScreen;
