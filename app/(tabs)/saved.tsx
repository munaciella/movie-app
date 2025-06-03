// import {
//   View,
//   Text,
//   FlatList,
//   ActivityIndicator,
//   Image,
//   Pressable,
//   Alert,
// } from "react-native";
// import { useEffect, useState } from "react";
// import {
//   getSavedMovies,
//   removeSavedMovie,
//   SavedMovie,
// } from "@/services/appwrite";

// export default function SavedScreen() {
//   const [saved, setSaved] = useState<SavedMovie[] | null>(null);
//   const [loading, setLoading] = useState(true);

//   const loadSaved = async () => {
//     setLoading(true);
//     try {
//       const list = await getSavedMovies();
//       setSaved(list || []);
//     } catch (err) {
//       console.error("Error loading saved movies:", err);
//       setSaved([]);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     loadSaved();
//   }, []);

//   if (loading) {
//     return (
//       <View className="flex-1 justify-center items-center bg-primary">
//         <ActivityIndicator size="large" color="#ffffff" />
//       </View>
//     );
//   }

//   if (!saved || saved.length === 0) {
//     return (
//       <View className="flex-1 justify-center items-center bg-primary">
//         <Text className="text-white">No saved movies yet.</Text>
//       </View>
//     );
//   }

//   return (
//     <View className="flex-1 bg-primary px-5 pt-5">
//       <FlatList
//         data={saved}
//         keyExtractor={(item) => item.$id}
//         numColumns={3}
//         columnWrapperStyle={{
//           justifyContent: "space-between",
//           marginBottom: 16,
//         }}
//         contentContainerStyle={{ paddingBottom: 100 }}
//         renderItem={({ item }) => (
//           <View style={{ width: "30%" }}>
//             <Image
//               source={{ uri: item.poster_url }}
//               className="w-full h-52 rounded-lg"
//               resizeMode="cover"
//             />
//             <Text className="text-sm font-bold text-white mt-2" numberOfLines={1}>
//               {item.title}
//             </Text>
//             <Pressable
//               onPress={async () => {
//                 try {
//                   await removeSavedMovie(item.$id);
//                   Alert.alert("Removed", `"${item.title}" removed from Saved.`);
//                   loadSaved();
//                 } catch (err) {
//                   console.error("Failed to remove saved movie:", err);
//                   Alert.alert("Error", "Could not remove movie. Please try again.");
//                 }
//               }}
//               className="mt-2 px-2 py-1 bg-red-500 rounded"
//             >
//               <Text className="text-xs text-white text-center">Remove</Text>
//             </Pressable>
//           </View>
//         )}
//       />
//     </View>
//   );
// }


// screens/SavedScreen.tsx

import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  Pressable,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import {
  getSavedMovies,
  type SavedMovie,
} from "@/services/appwrite";
import { useSaved } from "@/context/SavedContext";

export default function SavedScreen() {
  const [savedDocs, setSavedDocs] = useState<SavedMovie[] | null>(null);
  const [loading, setLoading] = useState(true);
  const { removeSaved, savedIds } = useSaved();

  // Load full documents on mount & whenever `savedIds` changes
  const loadSavedDocs = async () => {
    setLoading(true);
    try {
      const list = await getSavedMovies(); // returns SavedMovie[] | undefined
      setSavedDocs(list || []);
    } catch (err) {
      console.error("Error loading saved docs:", err);
      setSavedDocs([]);
    }
    setLoading(false);
  };

  // Whenever the context’s savedIds changes, re‐fetch the documents
  useEffect(() => {
    loadSavedDocs();
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
      <View className="flex-1 justify-center items-center bg-primary">
        <Text className="text-white">No saved movies yet.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary px-5 pt-5">
      <FlatList
        data={savedDocs}
        keyExtractor={(item) => item.$id}
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: "space-between",
          marginBottom: 16,
        }}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={{ width: "30%" }}>
            <Image
              source={{ uri: item.poster_url }}
              className="w-full h-52 rounded-lg"
              resizeMode="cover"
            />
            <Text
              className="text-sm font-bold text-white mt-2"
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Pressable
              onPress={async () => {
                try {
                  await removeSaved(item.movie_id, item.$id);
                  Alert.alert("Removed", `"${item.title}" removed from Saved.`);
                  // Note: `removeSaved(...)` already updated context.savedIds,
                  // which triggers this useEffect → loadSavedDocs( ) → re-render.
                } catch (err) {
                  console.error("Failed to remove saved movie:", err);
                  Alert.alert("Error", "Could not remove movie. Please try again.");
                }
              }}
              className="mt-2 px-2 py-1 bg-red-500 rounded"
            >
              <Text className="text-xs text-white text-center">Remove</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}
