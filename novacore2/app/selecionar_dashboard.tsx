import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Dashboard = {
  id_dashboard: number;
  nome_dashboard: string;
  descricao: string;
  pode_editar: boolean;
};

export default function SelecionarDashboard() {
  const router = useRouter();
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDashboards();
  }, []);

  const carregarDashboards = async () => {
    try {
      const userSalvo = await AsyncStorage.getItem("usuario");
      if (userSalvo) {
        const usuario = JSON.parse(userSalvo);
        const res = await fetch(`${API_URL}/dashboards/usuario/${usuario.id_usuario}`);
        const data = await res.json();
        if (res.ok) {
          setDashboards(data);
        }
      }
    } catch (error) {
      console.log("Erro ao carregar dashboards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelecionarDashboard = async (dash: Dashboard) => {
    // Salva o dashboard selecionado globalmente
    await AsyncStorage.setItem("dashboardAtivo", JSON.stringify(dash));
    // Redireciona para os gráficos/dashboard
    router.push("/dashboard");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.titulo}>Selecione a Planta</Text>
          <Text style={styles.subtitulo}>
            Escolha qual unidade industrial deseja monitorar agora
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#6C5DD2" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={dashboards}
            keyExtractor={(item) => String(item.id_dashboard)}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => handleSelecionarDashboard(item)}
              >
                <View style={styles.iconBox}>
                  <MaterialIcons name="factory" size={28} color="#6C5DD2" />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitulo}>{item.nome_dashboard}</Text>
                  <Text style={styles.cardDesc}>
                    {item.descricao || "Sem descrição cadastrada"}
                  </Text>
                </View>

                <MaterialIcons name="chevron-right" size={24} color="#64748b" />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                Você ainda não possui acesso a nenhuma planta. Solicite permissão a um Gestor.
              </Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617" },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 30 },
  header: { marginBottom: 25 },
  titulo: { color: "#ffffff", fontSize: 24, fontWeight: "bold" },
  subtitulo: { color: "#94a3b8", fontSize: 14, marginTop: 4 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0C101A",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
    gap: 14,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(108, 93, 210, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitulo: { color: "#ffffff", fontSize: 16, fontWeight: "600" },
  cardDesc: { color: "#64748b", fontSize: 12, marginTop: 2 },
  emptyText: { color: "#64748b", textAlign: "center", marginTop: 40, fontSize: 14 },
});