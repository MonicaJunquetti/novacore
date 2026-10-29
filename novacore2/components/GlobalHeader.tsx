import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDashboard } from "@/context/DashboardContext";
import { usePathname } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NotificationModal from "./NotificationModal";
import ChatModal from "../components/ChatModal";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function GlobalHeader() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { plantaAtiva, setPlantaAtiva } = useDashboard();
  
  const [modalSeletorVisivel, setModalSeletorVisivel] = useState(false);
  const [modalNotificacaoVisivel, setModalNotificacaoVisivel] = useState(false);
  const [modalChatVisivel, setModalChatVisivel] = useState(false);
  const [dashboardsDisponiveis, setDashboardsDisponiveis] = useState([]);
  
  const [alertas, setAlertas] = useState([]);
  const [notificacoesNaoLidas, setNotificacoesNaoLidas] = useState(0);
  const ultimoIdAlerta = useRef<number | null>(null);

  const carregarDashboardsUsuario = async () => {
    try {
      const userSalvo = await AsyncStorage.getItem("usuario");
      if (userSalvo) {
        const usuario = JSON.parse(userSalvo);
        const res = await fetch(`${API_URL}/dashboards/usuario/${usuario.id_usuario}`);
        const data = await res.json();
        if (res.ok) setDashboardsDisponiveis(data);
      }
    } catch (error) {
      console.log("Erro ao buscar lista de dashboards:", error);
    }
  };

  const carregarCacheNotificacoes = async () => {
    try {
      const naoLidas = await AsyncStorage.getItem("notificacoesNaoLidas");
      if (naoLidas) setNotificacoesNaoLidas(Number(naoLidas));

      const ultimoId = await AsyncStorage.getItem("ultimoIdAlerta");
      if (ultimoId) ultimoIdAlerta.current = Number(ultimoId);
    } catch (error) {
      console.log("Erro ao carregar cache de notificações:", error);
    }
  };

  const buscarAlertas = async () => {
    if (!plantaAtiva?.id_dashboard) {
      setAlertas([]);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/alertas?dashboard_id=${plantaAtiva.id_dashboard}`);
      const data = await response.json();
      setAlertas(data);
      if (!data || data.length === 0) return;

      const maiorId = Math.max(...data.map((item: any) => item.id_alerta));

      if (ultimoIdAlerta.current === null) {
        ultimoIdAlerta.current = maiorId;
        await AsyncStorage.setItem("ultimoIdAlerta", maiorId.toString());
        return;
      }

      if (maiorId > ultimoIdAlerta.current) {
        setNotificacoesNaoLidas((prev) => {
          const novoValor = prev + 1;
          AsyncStorage.setItem("notificacoesNaoLidas", novoValor.toString());
          return novoValor;
        });
        ultimoIdAlerta.current = maiorId;
        await AsyncStorage.setItem("ultimoIdAlerta", maiorId.toString());
      }
    } catch (error) {
      console.log("Erro ao buscar alertas:", error);
    }
  };

  useEffect(() => {
    carregarCacheNotificacoes();
  }, []);

  useEffect(() => {
    if (!plantaAtiva) return;

    buscarAlertas();
    const intervalo = setInterval(buscarAlertas, 3000);
    return () => clearInterval(intervalo);
  }, [plantaAtiva]);

  const abrirSeletor = () => {
    carregarDashboardsUsuario();
    setModalSeletorVisivel(true);
  };

  const abrirNotificacoes = async () => {
    setModalNotificacaoVisivel(true);
    setNotificacoesNaoLidas(0);
    await AsyncStorage.setItem("notificacoesNaoLidas", "0");
  };

  const rotasSemHeader = [
    "/",
    "/login",
    "/cadastro",
    "/editarperfil",
    "/selecionar_dashboard",
    "/perfil",
    "/dashboard_admin",
  ];

  if (rotasSemHeader.includes(pathname)) {
    return null;
  }

  return (
    <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
      {/* CANTO ESQUERDO: SELETOR DE PLANTAS */}
      <TouchableOpacity style={styles.btnDropdown} onPress={abrirSeletor}>
        <MaterialIcons name="factory" size={20} color="#6C5DD2" />
        <Text style={styles.nomePlanta}>
          {plantaAtiva ? plantaAtiva.nome_dashboard : "Selecione uma Planta"}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={24} color="#94a3b8" />
      </TouchableOpacity>

      {/* CANTO DIREITO: ÍCONE DE CHAT E NOTIFICAÇÕES */}
      <View style={styles.containerAcoesDireita}>
        <TouchableOpacity
          style={styles.btnAcao}
          onPress={() => setModalChatVisivel(true)}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnAcao} onPress={abrirNotificacoes}>
          <MaterialIcons name="notifications" size={22} color="#fff" />
          {notificacoesNaoLidas > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notificacoesNaoLidas}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* MODAL DE SELEÇÃO DE PLANTA */}
      <Modal visible={modalSeletorVisivel} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setModalSeletorVisivel(false)}
        >
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownTitulo}>Selecione a Planta</Text>
            <FlatList
              data={dashboardsDisponiveis}
              keyExtractor={(item: any) => String(item.id_dashboard)}
              renderItem={({ item }: any) => (
                <TouchableOpacity
                  style={[
                    styles.itemDropdown,
                    plantaAtiva?.id_dashboard === item.id_dashboard && styles.itemSelecionado,
                  ]}
                  onPress={() => {
                    setPlantaAtiva(item);
                    setModalSeletorVisivel(false);
                  }}
                >
                  <MaterialIcons name="factory" size={18} color="#6C5DD2" />
                  <Text style={styles.textItem}>{item.nome_dashboard}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* MODAL DE ALERTAS E NOTIFICAÇÕES */}
      <NotificationModal
        visible={modalNotificacaoVisivel}
        onClose={() => setModalNotificacaoVisivel(false)}
        alertas={alertas}
      />

      {/* MODAL DO CHATBOT */}
      <ChatModal
        visible={modalChatVisivel}
        onClose={() => setModalChatVisivel(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#020617",
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  btnDropdown: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0C101A",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    gap: 8,
  },
  nomePlanta: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  containerAcoesDireita: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  btnAcao: {
    position: "relative",
    padding: 8,
    backgroundColor: "#0C101A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ef4444",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  dropdownContainer: { width: "85%", maxHeight: 300, backgroundColor: "#020617", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#334155" },
  dropdownTitulo: { color: "#94a3b8", fontSize: 13, fontWeight: "bold", marginBottom: 12 },
  itemDropdown: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 10, gap: 10, marginBottom: 4 },
  itemSelecionado: { backgroundColor: "rgba(108, 93, 210, 0.2)" },
  textItem: { color: "#fff", fontSize: 14, fontWeight: "500" },
});