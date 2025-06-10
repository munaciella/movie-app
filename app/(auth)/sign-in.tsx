import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { images } from "@/constants/images";
import { icons } from "@/constants/icons";
import React, { useState } from "react";

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSignInPress = async () => {
    if (!isLoaded) return;
    setErrorMessage(null);
    setLoading(true);

    try {
      const attempt = await signIn.create({
        identifier: emailAddress.trim(),
        password,
      });

      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.replace("/");
      } else {
        console.warn("SignIn not complete:", attempt);
      }
    } catch (err: any) {
      console.error("SignIn error:", err);
      const msg =
        err?.errors?.[0]?.message ||
        err?.message ||
        "Unable to sign in. Please check your credentials.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="absolute w-full h-full"
        resizeMode="cover"
      />

      <View className="flex-1 px-5">
        <View className="mt-20 mb-8 items-center">
          <Image source={icons.logo} className="w-12 h-10" resizeMode="contain" />
        </View>

        <View className="flex-1 justify-center">
          <Text className="text-2xl font-bold text-white mb-6 text-center">
            Sign In
          </Text>

          <View className="mb-4">
            <Text className="text-white mb-1">Email address</Text>
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              value={emailAddress}
              onChangeText={setEmailAddress}
              placeholder="you@example.com"
              placeholderTextColor="#a8b5db"
              className="bg-dark-200 rounded-full px-5 py-3 text-white"
            />
          </View>

          <View className="mb-6">
            <Text className="text-white mb-1">Password</Text>
            <TextInput
              secureTextEntry={true}
              value={password}
              onChangeText={setPassword}
              placeholder="Your password"
              placeholderTextColor="#a8b5db"
              className="bg-dark-200 rounded-full px-5 py-3 text-white"
            />
          </View>

          {errorMessage ? (
            <Text className="text-red-500 mb-4 text-center">
              {errorMessage}
            </Text>
          ) : null}

          <TouchableOpacity
            onPress={onSignInPress}
            disabled={loading}
            className="bg-accent px-6 py-3 rounded-full items-center"
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text className="text-black font-semibold text-lg">Continue</Text>
            )}
          </TouchableOpacity>

          <View className="mt-6 flex-row justify-center">
            <Text className="text-light-300">Don’t have an account? </Text>
            <Link href="/sign-up" className="text-accent font-medium">
              Sign up
            </Link>
          </View>
        </View>
      </View>
    </View>
  );
}
