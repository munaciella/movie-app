import { images } from "@/constants/images";
import { Image, Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 bg-primary">
      <Image 
      source={images.bg}
      className="absolute w-full z-0" 
      />
    </View>
  );
}
