import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function SplashScreenComponent() {
  const [showSlogan, setShowSlogan] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const sloganTimer = setTimeout(() => setShowSlogan(true), 200);
    const navTimer = setTimeout(() => {
      router.replace("/auth");
      SplashScreen.hideAsync();
    }, 3000);

    return () => {
      clearTimeout(sloganTimer);
      clearTimeout(navTimer);
    };
  }, [router]);

  return (
    <View style={styles.splashScreen}>
      <View style={styles.splashContent}>
        <Text style={styles.splashTitle}>HUBA AI</Text>
        {showSlogan && (
          <Text style={styles.splashSlogan}>THINK . TALK . SOLVE</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  splashScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#3b82f6",
  },
  splashContent: {
    alignItems: "center",
  },
  splashTitle: {
    fontSize: 48,
    fontWeight: "900",
    color: "#ffffff",
  },
  splashSlogan: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginTop: 10,
  },
});