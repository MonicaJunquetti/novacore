// BottomBar.tsx
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function BottomBar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>

      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push("/(tabs)/dashboard")}
      >
        <MaterialIcons name="dashboard" size={24} color="#fff" />
        <Text style={styles.text}>Dashboard</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item}>
        <MaterialIcons name="my-location" size={24} color="#fff" />
        <Text style={styles.text}>Motores</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item}>
        <MaterialIcons name="person" size={24} color="#fff" />
        <Text style={styles.text}>Perfil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#020617",
    padding: 15,
  },

  item: {
  alignItems: "center", // 👈 isso coloca ícone em cima e texto embaixo
},
  text: {
  color: "#fff",
  fontSize: 12,
  marginTop: 4, // espaço entre ícone e texto
},
});