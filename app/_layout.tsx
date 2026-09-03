import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  const DarkMode = true;
  const statusBarColor = DarkMode ? 'light' : 'dark';
  return <>
    {/* <StatusBar style={statusBarColor} /> */}
    <StatusBar style="dark" />
    <Stack screenOptions={{headerShown: false}}/>
  </>
}
