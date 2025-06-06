// app/(tabs)/profile.tsx
import { View, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import SignOutButton from "@/components/SignOutButton";
import { useUser } from "@clerk/clerk-expo";

export default function Profile() {
  const { isLoaded, isSignedIn, user } = useUser();

  return (
    <SafeAreaView className="bg-primary flex-1">
      {/* Background image */}
      <Image
        source={images.bg}
        className="absolute w-full"
        resizeMode="cover"
      />

      <View className="flex-1 px-10">
        {/* Logo same as other screens */}
        <View className="mt-3 mb-5 items-center">
          <Image source={icons.logo} className="w-12 h-10" />
        </View>

        <View className="flex-1 justify-center items-center">
          {!isLoaded ? (
            <Text className="text-light-300">Loading…</Text>
          ) : !isSignedIn ? (
            <Text className="text-white text-lg">
              You are not signed in.
            </Text>
          ) : (
            <>
              <Text className="text-white text-xl font-bold mb-4">
                Welcome, {user?.firstName || "User"}!
              </Text>
              {/* Any other profile info goes here */}
            </>
          )}

          {/* Show SignIn/SignOut button appropriately */}
          <View className="mt-6">
            <SignOutButton />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
