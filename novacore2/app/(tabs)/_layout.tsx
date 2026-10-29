import { Stack } from "expo-router";
import { DashboardProvider } from "../../context/DashboardContext";
import GlobalHeader from "../../components/GlobalHeader";
import { View } from "react-native";

export default function RootLayout() {
  return (
    <DashboardProvider>
      <View style={{ flex: 1, backgroundColor: "#020617" }}>
        <GlobalHeader />
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </DashboardProvider>
  );
}