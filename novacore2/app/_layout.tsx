// app/_layout.tsx
import { Stack } from "expo-router";
import { DashboardProvider } from "@/context/DashboardContext";

export default function RootLayout() {
  return (
    <DashboardProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Rota pública de login */}
        <Stack.Screen name="login" />
        
        {/* Grupo ou telas autenticadas */}
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="dashboard_admin" />
        
        <Stack.Screen name="selecionar_dashboard" />

      </Stack>
    </DashboardProvider>
  );
}

