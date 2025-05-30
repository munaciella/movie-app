import { View, Text, Image, FlatList, ActivityIndicator } from "react-native";
import { images } from "@/constants/images";
import MovieCard from "@/components/MovieCard";
import useFetch from "@/services/useFetch";
import { fetchMovies } from "@/services/api";
import { icons } from "@/constants/icons";
import SearchBar from "@/components/SearchBar";
import { useEffect, useState } from "react";
import { updateSearchCount } from "@/services/appwrite";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: movies,
    loading: movieLoading,
    error: moviesError,
    refetch: loadMovies,
    reset,
  } = useFetch(
    () =>
      fetchMovies({
        query: searchQuery,
      }),
    false
  );

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim()) {
        await loadMovies();
      } else {
        reset();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    if (movies?.length! > 0 && movies?.[0]) {
          console.log("About to update search count for", searchQuery, movies[0]);
          updateSearchCount(searchQuery, movies[0]);
          console.log("Search count updated for", searchQuery, movies[0]);
        }
  }, [movies])

  // useEffect(() => {
  //   // every time searchQuery changes, wait 1s then run this
  //   const handler = setTimeout(async () => {
  //     const q = searchQuery.trim();

  //     if (!q) {
  //       // if they cleared the box, reset your UI and bail
  //       reset();
  //       return;
  //     }

  //     // 1️⃣ Update your UI
  //     await loadMovies();

  //     // 2️⃣ Hit Appwrite exactly once, using the same first result
  //     try {
  //       const results = await fetchMovies({ query: q });
  //       if (results.length > 0) {
  //         console.log("Updating search count for", q);
  //         await updateSearchCount(q, results[0]);
  //         console.log("✅ Search count updated for", q);
  //       }
  //     } catch (err) {
  //       console.error("❌ Failed to update search count:", err);
  //     }
  //   }, 1000);

  //   return () => clearTimeout(handler);
  //   // Only re-run this effect when the *text* changes, not on every render.
  //   // We deliberately omit loadMovies/reset from the deps so we don't retrigger.
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [searchQuery]);

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="absolute flex-1 w-full z-0"
        resizeMode="cover"
      />
      <FlatList
        data={movies}
        renderItem={({ item }) => <MovieCard {...item} />}
        keyExtractor={(item) => item.id.toString()}
        className="px-5"
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: "center",
          gap: 20,
          marginVertical: 6,
        }}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            <View className="w-full flex-row justify-center mt-20 items-center">
              <Image source={icons.logo} className="w-12 h-10" />
            </View>
            <View className="my-6">
              <SearchBar
                placeHolder="Search for a movie..."
                value={searchQuery}
                onChangeText={handleSearch}
                onPress={() => {
                  setSearchQuery(""); 
                  reset(); 
                }}
              />
            </View>
            {movieLoading && (
              <ActivityIndicator
                size="large"
                color="#0000ff"
                className="my-3"
              />
            )}
            {moviesError && (
              <Text className="text-red-500 px-5 my-3">
                Error: {moviesError?.message}
              </Text>
            )}
            {!movieLoading &&
              !moviesError &&
              searchQuery.trim() &&
              movies?.length! > 0 && (
                <Text className="text-xl text-white font-bold mb-2">
                  Search Results for{" "}
                  <Text className="text-accent">{searchQuery}</Text>
                </Text>
              )}
          </>
        }
        ListEmptyComponent={
          !movieLoading && !moviesError ? (
            <View className="mt-10 px-5">
              <Text className="text-center text-gray-500">
                {searchQuery.trim()
                  ? "No movies found"
                  : "Search for a movie to see results"}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default Search;
