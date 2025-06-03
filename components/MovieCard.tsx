// import { Link } from "expo-router";
// import { Text, Image, TouchableOpacity, View, Pressable, Alert } from "react-native";
// import { saveMovie, getSavedMovies } from "@/services/appwrite";
// import { icons } from "@/constants/icons";
// import { useEffect, useState } from "react";

// const MovieCard = ({
//   id,
//   poster_path,
//   title,
//   vote_average,
//   release_date,
// }: Movie) => {

//   const [isSaved, setIsSaved] = useState(false);

//   useEffect(() => {
//     let cancelled = false;
//     async function checkIfSaved() {
//       try {
//         const savedList = await getSavedMovies(); // get all saved movies
//         if (cancelled) return;
//         if (
//           Array.isArray(savedList) &&
//           savedList.find((doc) => doc.movie_id === id) !== undefined
//         ) {
//           setIsSaved(true);
//         }
//       } catch (err) {
//         console.error("Failed to check saved state:", err);
//       }
//     }
//     checkIfSaved();
//     return () => {
//       cancelled = true;
//     };
//   }, [id]);

//   const onPressSave = async () => {
//     try {
//       if (!isSaved) {
//         const savedDoc = await saveMovie({
//           id,
//           poster_path,
//           title,
//           vote_average,
//           release_date,
//           adult: false,
//           backdrop_path: "",
//           genre_ids: [],
//           original_language: "",
//           original_title: "",
//           overview: "",
//           popularity: 0,
//           video: false,
//           vote_count: 0
//         });
//         if (savedDoc) {
//           setIsSaved(true);
//           Alert.alert("Saved!", `"${title}" has been added to your Saved list.`);
//         }
//       } else {
//         Alert.alert("Already Saved", `"${title}" is already in your Saved list.`);
//       }
//     } catch (err) {
//       console.error("Failed to save movie:", err);
//       Alert.alert("Error", "Could not save. Please try again.");
//     }
//   };

//   return (
//     <View className="w-[30%] mb-6">
//     <Link href={`/movies/${id}`} asChild>
//       <TouchableOpacity>
//         <Image
//           source={{
//             uri: poster_path
//               ? `https://image.tmdb.org/t/p/w500${poster_path}`
//               : "https://placehold.co/600x400/1a1a1a/FFFFFF.png",
//           }}
//           className="w-full h-52 rounded-lg"
//           resizeMode="cover"
//         />

//         <Text className="text-sm font-bold text-white mt-2" numberOfLines={1}>
//           {title}
//         </Text>

//         <View className="flex-row items-center justify-start gap-x-1">
//           <Image source={icons.star} className="size-4" />
//           <Text className="text-xs text-white font-bold uppercase">
//             {Math.round(vote_average / 2)}
//           </Text>
//         </View>

//         <View className="flex-row items-center justify-between">
//           <Text className="text-xs text-light-300 font-medium mt-1">
//             {release_date?.split("-")[0]}
//           </Text>
//           <Text className="text-xs font-medium text-light-300 uppercase">
//             Movie
//           </Text>
//         </View>
//       </TouchableOpacity>
//     </Link>

//     {/* ─── “Save” Button ─── */}
//       <Pressable
//         onPress={onPressSave}
//         className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full"
//       >
//         <Image
//           source={icons.save}
//           className="size-5"
//           tintColor={isSaved ? "#FFD700" : "#FFFFFF"}
//         />
//       </Pressable>
//     </View>
//   );
// };

// export default MovieCard;

// components/MovieCard.tsx

import { Link } from "expo-router";
import {
  Text,
  Image,
  TouchableOpacity,
  View,
  Pressable,
  Alert,
} from "react-native";
import { icons } from "@/constants/icons";
import { useSaved } from "@/context/SavedContext";

const MovieCard = ({
  id,
  poster_path,
  title,
  vote_average,
  release_date,
}: Movie) => {
  // Grab global savedIds and addSaved() from context
  const { savedIds, addSaved } = useSaved();
  const isSaved = savedIds.has(id);

  const onPressSave = async () => {
    try {
      if (!isSaved) {
        // Save the movie in Appwrite & update context
        await addSaved({ id, poster_path, title, vote_average, release_date } as Movie);
        Alert.alert("Saved!", `"${title}" has been added to your Saved list.`);
      } else {
        Alert.alert("Already Saved", `"${title}" is already in your Saved list.`);
      }
    } catch (err) {
      console.error("Failed to save movie:", err);
      Alert.alert("Error", "Could not save. Please try again.");
    }
  };

  return (
    <View className="w-[30%] mb-6">
      <Link href={`/movies/${id}`} asChild>
        <TouchableOpacity>
          <Image
            source={{
              uri: poster_path
                ? `https://image.tmdb.org/t/p/w500${poster_path}`
                : "https://placehold.co/600x400/1a1a1a/FFFFFF.png",
            }}
            className="w-full h-52 rounded-lg"
            resizeMode="cover"
          />

          <Text className="text-sm font-bold text-white mt-2" numberOfLines={1}>
            {title}
          </Text>

          <View className="flex-row items-center justify-start gap-x-1">
            <Image source={icons.star} className="size-4" />
            <Text className="text-xs text-white font-bold uppercase">
              {Math.round(vote_average / 2)}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-light-300 font-medium mt-1">
              {release_date?.split("-")[0]}
            </Text>
            <Text className="text-xs font-medium text-light-300 uppercase">
              Movie
            </Text>
          </View>
        </TouchableOpacity>
      </Link>

      {/* ── “Save” (Bookmark) Button ── */}
      <Pressable
        onPress={onPressSave}
        className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full"
      >
        <Image
          source={icons.save}
          className="size-5"
          tintColor={isSaved ? "#FFD700" : "#FFFFFF"}
        />
      </Pressable>
    </View>
  );
};

export default MovieCard;
