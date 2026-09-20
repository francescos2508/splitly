import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  const DarkMode = false;
  const statusBarColor = DarkMode ? 'light' : 'dark';
  return (
      <GestureHandlerRootView>
        <StatusBar style={DarkMode ? 'light' : 'dark'} />
        <Stack screenOptions={{headerShown: false}}/>
      </GestureHandlerRootView>
  )
}
