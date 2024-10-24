import React from "react";
import { View, Text } from "react-native";
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="discover" options={{ title: 'Discover' }} />
      <Tabs.Screen name="upload" options={{ title: 'Upload' }} />
      <Tabs.Screen name="likes" options={{ title: 'Likes' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}


