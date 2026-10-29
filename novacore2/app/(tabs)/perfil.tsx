import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import BottomBar from "@/components/BottomBar";

export default function PerfilHubScreen() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<{ nome_usuario: string; email_usuario: string } | null>(null);

  useEffect(() => {
    carregarUsuario();
  }, []);

  const carregarUsuario = async () => {
    try {
      const usuarioSalvo = await AsyncStorage.getItem("usuario");
      if (usuarioSalvo) {
        setUsuario(JSON.parse(usuarioSalvo));
      }
    } catch (error) {
      console.log("Erro ao carregar dados do usuário:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("usuario");
      await AsyncStorage.removeItem("dashboardAtivo");
      router.replace("/login");
    } catch (error) {
      console.log("Erro ao fazer logout:", error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000510", "#000510", "#030033", "#4200e880"]}
        style={styles.mainContainer}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          {/* HEADER DO USUÁRIO */}
          <View style={styles.headerContainer}>
            <View style={styles.avatarCircle}>
              <MaterialIcons name="person" size={48} color="#6C5DD2" />
            </View>
            <Text style={styles.nomeUsuario}>
              {usuario?.nome_usuario || "Gestor Industrial"}
            </Text>
            <Text style={styles.emailUsuario}>
              {usuario?.email_usuario || "carregando..."}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* OPÇÕES DE NAVEGAÇÃO */}
          <View style={styles.menuContainer}>
            {/* BOTÃO 1: EDITAR INFORMAÇÕES PESSOAIS */}
            <TouchableOpacity
              style={styles.menuCard}
              onPress={() => router.push("/editarperfil")}
            >
              <View style={styles.iconBox}>
                <MaterialIcons name="manage-accounts" size={24} color="#6C5DD2" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuTitle}>Editar Perfil</Text>
                <Text style={styles.menuSubtitle}>
                  Altere seu nome, e-mail de acesso ou senha
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#64748b" />
            </TouchableOpacity>

            {/* BOTÃO 2: GERENCIAR DASHBOARDS / PLANTAS */}
            <TouchableOpacity
              style={styles.menuCard}
              onPress={() => router.push("/dashboard_admin")}
            >
              <View style={styles.iconBox}>
                <MaterialIcons name="dashboard-customize" size={24} color="#6C5DD2" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuTitle}>Gerenciar Dashboards</Text>
                <Text style={styles.menuSubtitle}>
                  Visualize plantas criadas por você ou compartilhadas
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* SAIR DA CONTA */}
          <View style={styles.logoutContainer}>
            <TouchableOpacity style={styles.btnLogout} onPress={handleLogout}>
              <MaterialIcons name="logout" size={20} color="#ffffff" />
              <Text style={styles.btnLogoutText}>Sair da Conta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>

      {Platform.OS !== "web" && <BottomBar />}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  headerContainer: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(108, 93, 210, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#6C5DD2",
    marginBottom: 12,
  },
  nomeUsuario: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  emailUsuario: { color: "#94a3b8", fontSize: 14, marginTop: 4 },
  divider: {
    height: 1,
    backgroundColor: "#334155",
    marginVertical: 20,
    width: "90%",
    alignSelf: "center",
  },
  menuContainer: { paddingHorizontal: 20, gap: 14 },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0C101A",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#334155",
    gap: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(108, 93, 210, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
  menuSubtitle: { color: "#64748b", fontSize: 12, marginTop: 2 },
  logoutContainer: { alignItems: "center", width: "100%", marginTop: 10 },
  btnLogout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "90%",
    height: 50,
    backgroundColor: "rgb(239, 68, 68)",
    borderWidth: 1,
    borderColor: "#ef4444",
    borderRadius: 15,
  },
  btnLogoutText: { color: "#fffafa", fontSize: 16, fontWeight: "bold" },
});