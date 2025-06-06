import { Slot } from "expo-router";
import "./globals.css";
import { StatusBar } from "react-native";
import { SavedProvider } from "@/context/SavedContext";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";

export default function RootLayout() {
  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
    >
      <SavedProvider>
        <StatusBar hidden={true} />
        <Slot />
      </SavedProvider>
    </ClerkProvider>
  );
}
