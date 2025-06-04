import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  Pressable,
  Alert,
  ScrollView
} from "react-native";
import { useEffect, useState } from "react";

import {
  getSavedMovies,
  type SavedMovie,
} from "@/services/appwrite";
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

  // 4) Show a full‐screen spinner while loading
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-primary">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  // 5) If there are no saved movies, show a friendly empty‐state
  if (!savedDocs || savedDocs.length === 0) {
    return (
      <View className="flex-1 bg-primary">
        {/* Background image (exactly like Home and normal Saved screen) */}
        <Image
          source={images.bg}
          className="absolute w-full z-0"
          resizeMode="cover"
        />

        {/* Use a ScrollView (or simple View) to position logo and message */}
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ minHeight: "100%", paddingBottom: 100 }}
        >
          {/* Logo (same placement as Home: mt-20, mb-5, centered) */}
          <Image
            source={icons.logo}
            className="w-12 h-10 mt-20 mb-5 mx-auto"
            resizeMode="contain"
          />

          {/* Centered “empty” message */}
          <View className="flex-1 justify-center items-center">
            <Text className="text-white text-lg">
              No saved movies yet.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  // 6) Otherwise, render the FlatList so that it matches Home’s layout exactly
  return (
    <View className="flex-1 bg-primary">
      {/* Background image (same as Home) */}
      <Image
        source={images.bg}
        className="absolute w-full z-0"
        resizeMode="cover"
      />

      <FlatList
        data={savedDocs}
        keyExtractor={(item) => item.$id}
        numColumns={3}
        // 7) columnWrapperStyle must match Home’s “Latest Movies” exactly:
        columnWrapperStyle={{
          justifyContent: "flex-start",
          gap: 20,          // same gap between posters
          paddingRight: 5,  // same right‐hand inset (20px)
          marginBottom: 10, // same bottom spacing
        }}
        // 8) contentContainerStyle includes bottom padding + horizontal padding
        contentContainerStyle={{
          paddingBottom: 100,       // leave space under the grid for the tab bar
          paddingHorizontal: 20,    // EXACTLY the same as Home’s `px-5`
        }}
        // 9) ListHeaderComponent to render Logo + “Saved Movies” header,
        //    placed at exactly the same vertical spot as on Home.
        ListHeaderComponent={() => (
          <View>
            {/* Logo + header all inside a px‐20 container, just like Home’s ScrollView had */}
            <View className="px-5">
              {/* Logo: 20px from top, 5px below, centered */}
              <View className="mt-20 mb-5 items-center">
                <Image
                  source={icons.logo}
                  className="w-12 h-10"
                />
              </View>

              {/* Heading text: same style + bottom margin as Home */}
              <Text className="text-lg text-white font-bold mb-6 -ml-5 mt-4">
                Saved Movies
              </Text>
            </View>
          </View>
        )}
        // 10) Render each SavedMovie exactly like Home’s “Latest Movies” cards,
        //     except hide the bookmark and show a “Remove” button under it.
        renderItem={({ item }) => (
          <View className="w-[30%] mb-6">
            {/* 
              MovieCard: 
              - poster_path is a full URL 
              - hideBookmark=true so the little save/bookmark icon is hidden 
              - For stars & date, either store them in Appwrite or pass dummy values. 
            */}
            <MovieCard
              id={item.movie_id}
              poster_path={item.poster_url}   // full TMDB URL stored in Appwrite
              title={item.title}
              vote_average={item.vote_average}       // <-- No rating saved, you’ll see “0”
              release_date={item.release_date}      // <-- No date saved, you’ll see blank
              hideBookmark={true}    // hides that top‐right bookmark icon
            />

            {/* 
              “Remove” button below each poster, styled exactly like Home’s button
              (same margin top, same px/py, same red background, same rounded corners). 
            */}
            <Pressable
              onPress={async () => {
                try {
                  await removeSaved(item.movie_id, item.$id);
                  Alert.alert(
                    "Removed",
                    `"${item.title}" has been removed from Saved.`
                  );
                  // once removeSaved updates the context, savedIds changes
                  // → this useEffect triggers loadSavedDocs() again → UI updates
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
