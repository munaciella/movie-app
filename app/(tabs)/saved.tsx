import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  Pressable,
  Alert,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";

import { getSavedMovies, type SavedMovie } from "@/services/appwrite";
import { useSaved } from "@/context/SavedContext";
import { images } from "@/constants/images";
import { icons } from "@/constants/icons";
import MovieCard from "@/components/MovieCard";

export default function SavedScreen() {
  const [savedDocs, setSavedDocs] = useState<SavedMovie[] | null>(null);
  const [loading, setLoading] = useState(true);
  const { removeSaved, savedIds } = useSaved();

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!isMounted) return;
      setLoading(true);

      try {
        const list = await getSavedMovies();
        if (isMounted) {
          setSavedDocs(list || []);
        }
      } catch (err) {
        console.error("Error loading saved docs:", err);
        if (isMounted) {
          setSavedDocs([]);
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [savedIds]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-primary">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (!savedDocs || savedDocs.length === 0) {
    return (
      <View className="flex-1 bg-primary">
        <Image
          source={images.bg}
          className="absolute w-full z-0"
          resizeMode="cover"
        />

        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ minHeight: "100%", paddingBottom: 100 }}
        >
          <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto" />

          <View className="flex-1 justify-center items-center">
            <Text className="text-white text-lg">No saved movies yet.</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="absolute w-full z-0"
        resizeMode="cover"
      />

      <FlatList
        data={savedDocs}
        keyExtractor={(item) => item.$id}
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: "flex-start",
          gap: 20,
          paddingRight: 5,
          marginBottom: 10,
        }}
        contentContainerStyle={{
          paddingBottom: 100,
          paddingHorizontal: 20,
        }}
        ListHeaderComponent={() => (
          <View>
            <View className="px-5">
              <View className="mt-20 mb-5 items-center">
                <Image source={icons.logo} className="w-12 h-10" />
              </View>

              <Text className="text-lg text-white font-bold mb-6 -ml-5 mt-4">
                Saved Movies
              </Text>
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <View className="w-[30%] mb-6">
            <MovieCard
              id={item.movie_id}
              poster_path={item.poster_url}
              title={item.title}
              vote_average={item.vote_average}
              release_date={item.release_date}
              hideBookmark={true}
            />

            <Pressable
              onPress={async () => {
                try {
                  await removeSaved(item.movie_id, item.$id);
                  Alert.alert(
                    "Removed",
                    `"${item.title}" has been removed from Saved.`
                  );
                } catch (err) {
                  console.error("Failed to remove saved movie:", err);
                  Alert.alert(
                    "Error",
                    "Could not remove movie. Please try again."
                  );
                }
              }}
              className="px-3 py-2 bg-red-500 rounded"
            >
              <Text className="text-xs text-white text-center">Remove</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}
