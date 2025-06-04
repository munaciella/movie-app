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
import { useEffect } from "react";

// 1) Add `hideBookmark?: boolean` to the props interface:
interface MovieCardProps {
  id: number;
  poster_path: string;     // either a TMDB path ("/abc.jpg") or a full URL ("https://…")
  title: string;
  vote_average: number;
  release_date: string;
  hideBookmark?: boolean;  // when true, do NOT render the little save/bookmark icon
}

const MovieCard = ({
  id,
  poster_path,
  title,
  vote_average,
  release_date,
  hideBookmark = false, // default = false (i.e. show bookmark by default)
}: MovieCardProps) => {
  // 2) Pull savedIds + addSaved() from context:
  const { savedIds, addSaved } = useSaved();
  const isSaved = savedIds.has(id);

  // Re‐run effect when savedIds changes (so tintColor updates instantly)
  useEffect(() => {
    // no‐op; this just causes a re‐render when savedIds changes
  }, [savedIds]);

  const onPressSave = async () => {
    try {
      if (!isSaved) {
        await addSaved({
          id,
          poster_path,   // NOTE: we pass exactly what was passed here
          title,
          vote_average,
          release_date,
        } as any);
        Alert.alert("Saved!", `"${title}" has been added to your Saved list.`);
      } else {
        Alert.alert("Already Saved", `"${title}" is already in your Saved list.`);
      }
    } catch (err) {
      console.error("Failed to save movie:", err);
      Alert.alert("Error", "Could not save. Please try again.");
    }
  };

  // 3) Determine the correct URI for the <Image>:
  const uri =
    poster_path.startsWith("http")
      ? poster_path
      : `https://image.tmdb.org/t/p/w500${poster_path}`;

  return (
    <View className="mb-6">
      <Link href={`/movies/${id}`} asChild>
        <TouchableOpacity>
          <Image
            source={{ uri }}
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

      {/* 4) Only render the “save/bookmark” button if hideBookmark===false */}
      {!hideBookmark && (
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
      )}
    </View>
  );
};

export default MovieCard;
