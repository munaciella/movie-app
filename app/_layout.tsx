import { Stack } from "expo-router";
import "./globals.css";
import { StatusBar } from "react-native";
import { SavedProvider } from "@/context/SavedContext";

export default function RootLayout() {
  return (
    <SavedProvider>
      <StatusBar hidden={true} />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="movies/[id]" options={{ headerShown: false }} />
      </Stack>
    </SavedProvider>
  );
}
