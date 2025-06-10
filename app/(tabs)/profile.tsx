import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import SignOutButton from "@/components/SignOutButton";
import { useUser } from "@clerk/clerk-expo";
import { getSavedMovies, type SavedMovie } from "@/services/appwrite";
import { Link, useRouter } from "expo-router";

export default function Profile() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [recent, setRecent] = useState<SavedMovie[] | null>(null);
  const [loadingRecents, setLoadingRecents] = useState(false);

  useEffect(() => {
    let active = true;
    const loadRecents = async () => {
      if (!isSignedIn) return;
      setLoadingRecents(true);
      try {
        const docs = await getSavedMovies();
        if (active) {
          setRecent(docs?.slice(0, 5) || []);
        }
      } catch (err) {
        console.error("Failed to fetch recents:", err);
      }
      if (active) {
        setLoadingRecents(false);
      }
    };
    loadRecents();
    return () => {
      active = false;
    };
  }, [isSignedIn]);

  const avatarUri = isSignedIn ? user.imageUrl : undefined;

  return (
    <SafeAreaView className="bg-primary flex-1">
      <Image
        source={images.bg}
        className="absolute w-full"
        resizeMode="cover"
      />

      <View className="flex-1 px-10">
        {/* Logo */}
        <View className="mt-3 mb-5 items-center">
          <Image source={icons.logo} className="w-12 h-10" />
        </View>

        {/* Main content */}
        <View className="flex-1 justify-center">
          {!isLoaded ? (
            <View className="justify-center items-center">
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          ) : !isSignedIn ? (
            <View className="justify-center items-center">
              <Text className="text-white text-lg mb-4">
                You are not signed in.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/sign-in")}
                className="bg-accent px-6 py-3 rounded-full"
              >
                <Text className="text-black font-semibold">Sign In</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              {/* User Profile Section */}
              <View className="items-center">
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    className="w-16 h-16 rounded-full mb-4"
                    resizeMode="cover"
                  />
                ) : (
                  <Image
                    source={icons.person}
                    tintColor="#fff"
                    className="w-16 h-16 mb-4"
                  />
                )}

                <Text className="text-white text-2xl font-bold mb-1">
                  {user.firstName || user.username || "User"}
                </Text>
                <Text className="text-light-300 mb-6">
                  {user.primaryEmailAddress?.emailAddress}
                </Text>

                <Text className="text-white text-lg font-semibold mb-2">
                  Recently Saved
                </Text>
              </View>

              {/* Recent Movies Section */}
              <View className="h-40">
                {loadingRecents ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : recent && recent.length > 0 ? (
                  <FlatList
                    data={recent}
                    keyExtractor={(i) => i.$id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 10 }}
                    ItemSeparatorComponent={() => <View className="w-4" />}
                    renderItem={({ item }) => (
                      <Link href={`/movies/${item.movie_id}`} asChild>
          <TouchableOpacity>
                      <Image
                        source={{ uri: item.poster_url }}
                        className="w-24 h-32 rounded-lg"
                        resizeMode="cover"
                      />
                      </TouchableOpacity>
                    </Link>
                    )}
                  />
                ) : (
                  <Text className="text-gray-400">No recent saves.</Text>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Sign Out Button - Always at bottom */}
        <View className="items-center justify-center mb-36">
          <View className="w-32">
          <SignOutButton />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}