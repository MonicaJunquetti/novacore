import { View, TouchableOpacity, StyleSheet, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type Props = {
  telaAtiva?: string;
};

export default function Sidebar({ telaAtiva }: Props) {
  const router = useRouter(); // 👈 Movido para dentro do componente

  return (
    <View style={styles.sidebar}>
      <View style={styles.top}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
        />

        {/* DASHBOARD */}
        <TouchableOpacity
          style={[styles.item, telaAtiva === "dashboard" && styles.itemAtivo]}
          onPress={() => router.push("/dashboard")}
        >
          <MaterialIcons name="dashboard" size={24} color="#fff" />
        </TouchableOpacity>

        {/* MOTORES */}
        <TouchableOpacity
          style={[styles.item, telaAtiva === "motores" && styles.itemAtivo]}
          onPress={() => router.push("/motores")}
        >
          <MaterialIcons name="my-location" size={24} color="#fff" />
        </TouchableOpacity>

        {/* PERFIL */}
        <TouchableOpacity
          style={[styles.item, telaAtiva === "perfil" && styles.itemAtivo]}
          onPress={() => router.push("/perfil")}
        >
          <MaterialIcons name="person" size={24} color="#fff" />
        </TouchableOpacity>

        {/* PAINEL ADMIN / GESTÃO DE PLANTAS */}
        <TouchableOpacity
          style={[styles.item, telaAtiva === "admin" && styles.itemAtivo]}
          onPress={() => router.push("/dashboard_admin")}
        >
          <MaterialIcons name="admin-panel-settings" size={24} color="#6C5DD2" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 90,
    backgroundColor: "#020617",
    paddingVertical: 20,
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#1e293b",
    justifyContent: "space-between",
  },
  top: {
    alignItems: "center",
    width: "100%",
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: "contain",
    marginBottom: 40,
    alignSelf: "center",
  },
  item: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  itemAtivo: {
    backgroundColor: "rgba(108, 93, 210, 0.2)",
    borderWidth: 1,
    borderColor: "#6C5DD2",
  },
});