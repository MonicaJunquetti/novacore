import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GerenciarAcessosModal from "../components/GerenciarAcessosModal";
import Sidebar from "../components/sidebar";
import BottomBar from "../components/BottomBar";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type NivelAcesso = "gestor" | "usuario" | "monitorador";

type Dashboard = {
  id_dashboard: number;
  nome_dashboard: string;
  descricao: string;
  nivel_acesso: NivelAcesso;
};

export default function AdminDashboards() {
  const insets = useSafeAreaInsets();
  const [usuario, setUsuario] = useState<any>(null);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);

  // Modais
  const [modalAcessosVisivel, setModalAcessosVisivel] = useState(false);
  const [modalNovoDashVisivel, setModalNovoDashVisivel] = useState(false);

  // Form Novo Dashboard
  const [novoNome, setNovoNome] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");

  useEffect(() => {
    carregarUsuario();
  }, []);

  const carregarUsuario = async () => {
    try {
      const userSalvo = await AsyncStorage.getItem("usuario");
      if (userSalvo) {
        const parsed = JSON.parse(userSalvo);
        setUsuario(parsed);
        carregarDashboards(parsed.id_usuario);
      }
    } catch (error) {
      console.log("Erro ao carregar usuário:", error);
    }
  };

  const carregarDashboards = async (idUsuario: number) => {
    try {
      const res = await fetch(`${API_URL}/dashboards/usuario/${idUsuario}`);
      const data = await res.json();
      if (res.ok) setDashboards(data);
    } catch (error) {
      console.log("Erro ao carregar dashboards:", error);
    }
  };

  const handleCriarDashboard = async () => {
    if (!novoNome.trim()) {
      Alert.alert("Atenção", "Informe o nome do dashboard.");
      return;
    }

    if (!usuario || !usuario.id_usuario) {
      Alert.alert("Erro", "Sessão do usuário não encontrada. Faça login novamente.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/dashboards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome_dashboard: novoNome.trim(),
          descricao: novaDescricao.trim(),
          fk_gestor: usuario.id_usuario,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Sucesso", "Nova planta/dashboard cadastrado!");
        setNovoNome("");
        setNovaDescricao("");
        setModalNovoDashVisivel(false);
        carregarDashboards(usuario.id_usuario);
      } else {
        Alert.alert("Erro", data.message || data.erro || "Não foi possível criar o dashboard.");
      }
    } catch (error) {
      console.log("Erro de requisição:", error);
      Alert.alert("Erro", "Erro ao conectar com o servidor.");
    }
  };

  const getLabelNivel = (nivel: NivelAcesso) => {
    switch (nivel) {
      case "gestor":
        return "Gestor";
      case "usuario":
        return "Usuário";
      case "monitorador":
        return "Monitorador";
      default:
        return "Sem Acesso";
    }
  };

  return (
    <View style={styles.container}>
      {Platform.OS === "web" && <Sidebar />}

      <View style={[styles.conteudo, { paddingTop: insets.top + 20 }]}>
        {/* CABEÇALHO */}
        <View style={styles.header}>
          <View>
            <Text style={styles.titulo}>Gerenciar dashboards</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.btnCriar}
          onPress={() => setModalNovoDashVisivel(true)}
        >
          <MaterialIcons name="add" size={20} color="#fff" />
          <Text style={styles.btnCriarText}>Nova Planta</Text>
        </TouchableOpacity>

        {/* LISTAGEM DE DASHBOARDS */}
        <FlatList
          data={dashboards}
          keyExtractor={(item) => String(item.id_dashboard)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => {
            const isGestor = item.nivel_acesso === "gestor";

            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconBox}>
                    <MaterialIcons name="factory" size={24} color="#6C5DD2" />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitulo}>{item.nome_dashboard}</Text>
                    <Text style={styles.cardDesc}>
                      {item.descricao || "Sem descrição definida"}
                    </Text>
                  </View>

                  {/* BADGE COM NÍVEL DE ACESSO */}
                  <View
                    style={[
                      styles.badgeRole,
                      isGestor
                        ? styles.badgeGestor
                        : item.nivel_acesso === "usuario"
                        ? styles.badgeUsuario
                        : styles.badgeMonitorador,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeRoleText,
                        isGestor
                          ? styles.badgeGestorText
                          : item.nivel_acesso === "usuario"
                          ? styles.badgeUsuarioText
                          : styles.badgeMonitoradorText,
                      ]}
                    >
                      {getLabelNivel(item.nivel_acesso)}
                    </Text>
                  </View>
                </View>

                {/* BOTÃO GERENCIAR USUÁRIOS (APENAS PARA GESTORES) */}
                {isGestor && (
                  <View style={styles.cardFooter}>
                    <TouchableOpacity
                      style={styles.btnAcao}
                      onPress={() => {
                        setSelectedDashboard(item);
                        setModalAcessosVisivel(true);
                      }}
                    >
                      <MaterialIcons name="group" size={18} color="#a5b4fc" />
                      <Text style={styles.btnAcaoText}>
                        Gerenciar Usuários & Permissões
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          }}
        />
      </View>

      {/* MODAL: GERENCIAR ACESSOS DA PLANTA */}
      {selectedDashboard && (
        <GerenciarAcessosModal
          visible={modalAcessosVisivel}
          onClose={() => {
            setModalAcessosVisivel(false);
            if (usuario) carregarDashboards(usuario.id_usuario);
          }}
          dashboardId={selectedDashboard.id_dashboard}
          dashboardNome={selectedDashboard.nome_dashboard}
        />
      )}

      {/* MODAL: CRIAR NOVO DASHBOARD */}
      <Modal visible={modalNovoDashVisivel} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <TouchableOpacity
              style={styles.botaoFechar}
              onPress={() => setModalNovoDashVisivel(false)}
            >
              <MaterialIcons name="close" size={20} color="#94a3b8" />
            </TouchableOpacity>

            <Text style={styles.modalTitulo}>Cadastrar Nova Planta</Text>

            <Text style={styles.label}>Nome da Planta / Dashboard</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Planta São Paulo - Setor B"
              placeholderTextColor="#64748b"
              value={novoNome}
              onChangeText={setNovoNome}
            />

            <Text style={styles.label}>Descrição (Opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Linha de montagem pesada"
              placeholderTextColor="#64748b"
              value={novaDescricao}
              onChangeText={setNovaDescricao}
            />

            <TouchableOpacity style={styles.btnSalvar} onPress={handleCriarDashboard}>
              <Text style={styles.btnSalvarText}>Salvar Planta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {Platform.OS !== "web" && <BottomBar />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: Platform.OS === "web" ? "row" : "column",
    backgroundColor: "#020617",
  },
  conteudo: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  titulo: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "bold",
  },
  btnCriar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6C5DD2",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 20,
    gap: 6,
  },
  btnCriarText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "#1e293b",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#0C101A",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(108, 93, 210, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitulo: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  cardDesc: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
  },
  badgeRole: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeGestor: { backgroundColor: "rgba(108, 93, 210, 0.2)" },
  badgeUsuario: { backgroundColor: "rgba(59, 130, 246, 0.15)" },
  badgeMonitorador: { backgroundColor: "rgba(100, 116, 139, 0.2)" },
  badgeRoleText: { fontSize: 11, fontWeight: "600" },
  badgeGestorText: { color: "#a78bfa" },
  badgeUsuarioText: { color: "#93c5fd" },
  badgeMonitoradorText: { color: "#94a3b8" },
  cardFooter: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
  },
  btnAcao: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
  },
  btnAcaoText: {
    color: "#a5b4fc",
    fontSize: 13,
    fontWeight: "500",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "90%",
    backgroundColor: "#020617",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  botaoFechar: { position: "absolute", top: 16, right: 16 },
  modalTitulo: { color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 16 },
  label: { color: "#cbd5e1", fontSize: 13, marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: "#0C101A",
    color: "#fff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  btnSalvar: {
    backgroundColor: "#6C5DD2",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  btnSalvarText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});