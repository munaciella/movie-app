// components/SignOutButton.tsx
import { useClerk, useUser } from "@clerk/clerk-expo";
import { TouchableOpacity, Text, Alert } from "react-native";
import { useRouter } from "expo-router";

export default function SignOutButton() {
  const { signOut } = useClerk();
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      // After sign‐out, navigate back to Sign In screen
      router.replace("/sign-in");
    } catch {
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };

  // Don’t render anything until Clerk is fully loaded
  if (!isLoaded) return null;

  // If user is not signed in, show a “Sign In” button
  if (!isSignedIn) {
    return (
      <TouchableOpacity
        onPress={() => router.push("/sign-in")}
        className="bg-accent px-4 py-2 rounded-full"
      >
        <Text className="text-black font-medium">Sign In</Text>
      </TouchableOpacity>
    );
  }

  // If user _is_ signed in, show a “Sign Out” button
  return (
    <TouchableOpacity
      onPress={handleSignOut}
      className="bg-red-500 px-4 py-2 rounded-full"
    >
      <Text className="text-white font-medium">Sign Out</Text>
    </TouchableOpacity>
  );
}
