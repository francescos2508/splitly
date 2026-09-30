import { colors } from "@/src/constants/constants";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  const DarkMode = false;
  return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar 
          barStyle={DarkMode ? "light-content" : "dark-content"}
          backgroundColor={colors.background}
        />
        <Stack screenOptions={{headerShown: false}}/>
      </GestureHandlerRootView>
  )
}
