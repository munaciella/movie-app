import { Link, useRouter } from "expo-router";
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
import { useAuth } from "@clerk/clerk-expo"

interface MovieCardProps {
  id: number;
  poster_path: string | null;
  title: string;
  vote_average: number;
  release_date: string;
  hideBookmark?: boolean;
}

const MovieCard = ({
  id,
  poster_path,
  title,
  vote_average,
  release_date,
  hideBookmark = false,
}: MovieCardProps) => {
  const { savedIds, addSaved } = useSaved();
  const isSaved = savedIds.has(id);
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {}, [savedIds]);

  const onPressSave = async () => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      Alert.alert(
        "Sign In Required",
        "You must be signed in to save movies.",
        [{ text: "Sign In", onPress: () => router.push("/(auth)/sign-in") }]
      );
      return;
    }

    try {
      if (!isSaved) {
        await addSaved({
          id,
          poster_path: poster_path || "",
          title,
          vote_average,
          release_date,
        } as any);
        Alert.alert("Saved!", `"${title}" has been added to your Saved list.`);
      } else {
        Alert.alert(
          "Already Saved",
          `"${title}" is already in your Saved list.`
        );
      }
    } catch (err) {
      console.error("Failed to save movie:", err);
      Alert.alert("Error", "Could not save. Please try again.");
    }
  };

  let uri: string;
  if (poster_path) {
    if (poster_path.startsWith("http")) {
      uri = poster_path;
    } else {
      uri = `https://image.tmdb.org/t/p/w500${poster_path}`;
    }
  } else {
    uri = "https://placehold.co/600x400/1a1a1a/FFFFFF.png";
  }

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
