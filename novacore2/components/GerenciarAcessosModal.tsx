import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

type NivelAcesso = "gestor" | "usuario" | "monitorador";

type Membro = {
  id_usuario: number;
  nome: string;
  email: string;
  nivel_acesso: NivelAcesso;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  dashboardId: number | null;
  dashboardNome: string;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function GerenciarAcessosModal({
  visible,
  onClose,
  dashboardId,
  dashboardNome,
}: Props) {
  const [emailBusca, setEmailBusca] = useState("");
  const [nivelNovo, setNivelNovo] = useState<NivelAcesso>("usuario");
  const [membros, setMembros] = useState<Membro[]>([]);
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);

  // Modal interno para editar cargo de membro da lista
  const [membroEditando, setMembroEditando] = useState<Membro | null>(null);
  const [nivelSelecionadoEdit, setNivelSelecionadoEdit] = useState<NivelAcesso>("usuario");

  useEffect(() => {
    if (visible && dashboardId) {
      carregarUsuarioELicenca();
    }
  }, [visible, dashboardId]);

  const carregarUsuarioELicenca = async () => {
    try {
      const userSalvo = await AsyncStorage.getItem("usuario");
      if (userSalvo) setUsuarioLogado(JSON.parse(userSalvo));
      carregarMembros();
    } catch (error) {
      console.log("Erro ao carregar usuário:", error);
    }
  };

  const carregarMembros = async () => {
    try {
      const res = await fetch(`${API_URL}/dashboards/${dashboardId}/membros`);
      const data = await res.json();
      if (res.ok) setMembros(data);
    } catch (error) {
      console.log("Erro ao carregar membros:", error);
    }
  };

  // ADICIONAR NOVO MEMBRO VIA EMAIL COM NIVEL DE ACESSO
  const handleAdicionarPessoa = async () => {
    if (!emailBusca.trim()) {
      Alert.alert("Atenção", "Digite o e-mail do usuário.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/dashboards/${dashboardId}/membros`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailBusca.trim(),
          nivel_acesso: nivelNovo,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Sucesso", "Acesso concedido!");
        setEmailBusca("");
        carregarMembros();
      } else {
        Alert.alert("Aviso", data.erro || data.message || "Usuário não encontrado.");
      }
    } catch (error) {
      Alert.alert("Erro", "Erro ao conectar com o servidor.");
    }
  };

  // SALVAR NOVO NÍVEL DE ACESSO DE UM MEMBRO EXISTENTE
  const handleSalvarNivel = async () => {
    if (!membroEditando || !usuarioLogado) return;

    try {
      const res = await fetch(
        `${API_URL}/dashboards/${dashboardId}/permissoes/${membroEditando.id_usuario}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idUsuarioLogado: usuarioLogado.id_usuario,
            nivel_acesso: nivelSelecionadoEdit,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Sucesso", "Permissão atualizada!");
        setMembroEditando(null);
        carregarMembros();
      } else {
        Alert.alert("Erro", data.erro || "Não foi possível alterar a permissão.");
      }
    } catch (error) {
      console.log("Erro ao alterar permissão:", error);
    }
  };

  // REMOVER MEMBRO OU SAIR SE FOR GESTOR
  const handleRemoverAcesso = async (membroTarget: Membro) => {
    if (!usuarioLogado) return;

    Alert.alert(
      "Remover Acesso",
      `Deseja remover ${membroTarget.nome} do dashboard?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(
                `${API_URL}/dashboards/${dashboardId}/membros/${membroTarget.id_usuario}`,
                {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ idUsuarioLogado: usuarioLogado.id_usuario }),
                }
              );

              const data = await res.json();
              if (res.ok) {
                carregarMembros();
              } else {
                Alert.alert("Atenção", data.erro || "Erro ao remover membro.");
              }
            } catch (error) {
              console.log("Erro ao remover acesso:", error);
            }
          },
        },
      ]
    );
  };

  const getLabelNivel = (nivel: NivelAcesso) => {
    switch (nivel) {
      case "gestor": return "Gestor";
      case "usuario": return "Usuário";
      case "monitorador": return "Monitorador";
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <TouchableOpacity style={styles.botaoFechar} onPress={onClose}>
            <MaterialIcons name="close" size={20} color="#94a3b8" />
          </TouchableOpacity>

          <Text style={styles.titulo}>Gerenciar Acessos</Text>
          <Text style={styles.subtitulo}>{dashboardNome}</Text>

          <View style={styles.divider} />

          {/* SESSÃO 1: CONVIDAR NOVO MEMBRO */}
          <Text style={styles.sectionHeader}>ADICIONAR NOVO MEMBRO</Text>
          <View style={styles.inputContainer}>
            <MaterialIcons name="email" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Digite o e-mail do usuário..."
              placeholderTextColor="#64748b"
              value={emailBusca}
              onChangeText={setEmailBusca}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* SELETOR DE PERFIL PARA NOVO MEMBRO */}
          <Text style={[styles.sectionHeader, { marginTop: 12 }]}>NÍVEL DE ACESSO</Text>
          <View style={styles.seletorNivelRow}>
            {(["usuario", "monitorador", "gestor"] as NivelAcesso[]).map((nivel) => (
              <TouchableOpacity
                key={nivel}
                style={[
                  styles.btnNivelOpcao,
                  nivelNovo === nivel && styles.btnNivelOpcaoAtivo,
                ]}
                onPress={() => setNivelNovo(nivel)}
              >
                <Text
                  style={[
                    styles.textNivelOpcao,
                    nivelNovo === nivel && styles.textNivelOpcaoAtivo,
                  ]}
                >
                  {getLabelNivel(nivel)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.btnAdicionar} onPress={handleAdicionarPessoa}>
            <MaterialIcons name="person-add" size={18} color="#fff" />
            <Text style={styles.btnTexto}>Conceder Acesso</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* SESSÃO 2: LISTAGEM DE MEMBROS */}
          <Text style={styles.sectionHeader}>MEMBROS ATUAIS COM ACESSO</Text>

          <FlatList
            data={membros}
            keyExtractor={(item) => String(item.id_usuario)}
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 220 }}
            renderItem={({ item }) => {
              const isEuMesmo = item.id_usuario === usuarioLogado?.id_usuario;

              return (
                <View style={styles.membroCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.membroNome}>
                      {item.nome} {isEuMesmo && "(Você)"}
                    </Text>
                    <Text style={styles.membroEmail}>{item.email}</Text>
                  </View>

                  {/* BADGE / BOTAO DE ALTERAR NIVEL DE ACESSO */}
                  <TouchableOpacity
                    disabled={isEuMesmo}
                    style={[
                      styles.badgePermissao,
                      item.nivel_acesso === "gestor"
                        ? styles.badgeGestor
                        : item.nivel_acesso === "usuario"
                        ? styles.badgeUsuario
                        : styles.badgeMonitorador,
                    ]}
                    onPress={() => {
                      setMembroEditando(item);
                      setNivelSelecionadoEdit(item.nivel_acesso || "usuario");
                    }}
                  >
                    <Text style={styles.badgeTexto}>
                      {getLabelNivel(item.nivel_acesso)}
                    </Text>
                    {!isEuMesmo && (
                      <MaterialIcons name="arrow-drop-down" size={16} color="#a5b4fc" />
                    )}
                  </TouchableOpacity>

                  {/* REMOVER MEMBRO */}
                  <TouchableOpacity
                    style={styles.btnRemover}
                    onPress={() => handleRemoverAcesso(item)}
                  >
                    <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        </View>

        {/* MODAL SECUNDÁRIO PARA EDITAR NÍVEL DE MEMBRO EXISTENTE */}
        <Modal visible={!!membroEditando} transparent animationType="fade">
          <View style={styles.overlay}>
            <View style={styles.modalBoxSub}>
              <Text style={styles.tituloSub}>
                Alterar Nível de {membroEditando?.nome}
              </Text>

              {(["gestor", "usuario", "monitorador"] as NivelAcesso[]).map((nivel) => (
                <TouchableOpacity
                  key={nivel}
                  style={[
                    styles.opcaoNivelCard,
                    nivelSelecionadoEdit === nivel && styles.opcaoNivelSelecionado,
                  ]}
                  onPress={() => setNivelSelecionadoEdit(nivel)}
                >
                  <MaterialIcons
                    name={
                      nivelSelecionadoEdit === nivel
                        ? "radio-button-checked"
                        : "radio-button-unchecked"
                    }
                    size={20}
                    color={nivelSelecionadoEdit === nivel ? "#6C5DD2" : "#64748b"}
                  />
                  <Text style={styles.opcaoLabel}>{getLabelNivel(nivel)}</Text>
                </TouchableOpacity>
              ))}

              <View style={styles.modalSubBotoes}>
                <TouchableOpacity
                  style={styles.btnCancelarSub}
                  onPress={() => setMembroEditando(null)}
                >
                  <Text style={{ color: "#fff" }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnSalvarSub} onPress={handleSalvarNivel}>
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "92%",
    maxHeight: "88%",
    backgroundColor: "#020617",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  botaoFechar: {
    position: "absolute",
    top: 18,
    right: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
    zIndex: 10,
  },
  titulo: { color: "#ffffff", fontSize: 20, fontWeight: "700" },
  subtitulo: { color: "#94a3b8", fontSize: 13, marginTop: 2 },
  divider: { height: 1, backgroundColor: "#1e293b", marginVertical: 16 },
  sectionHeader: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0C101A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: 12,
    height: 46,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, color: "#ffffff", fontSize: 14 },
  seletorNivelRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  btnNivelOpcao: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#0C101A",
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
  },
  btnNivelOpcaoAtivo: {
    backgroundColor: "#6C5DD2",
    borderColor: "#6C5DD2",
  },
  textNivelOpcao: { color: "#64748b", fontSize: 12, fontWeight: "600" },
  textNivelOpcaoAtivo: { color: "#ffffff" },
  btnAdicionar: {
    backgroundColor: "#6C5DD2",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  btnTexto: { color: "#ffffff", fontSize: 14, fontWeight: "600" },
  membroCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0C101A",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  membroNome: { color: "#ffffff", fontSize: 14, fontWeight: "600" },
  membroEmail: { color: "#64748b", fontSize: 12 },
  badgePermissao: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 8,
  },
  badgeGestor: { backgroundColor: "rgba(108, 93, 210, 0.25)" },
  badgeUsuario: { backgroundColor: "rgba(59, 130, 246, 0.2)" },
  badgeMonitorador: { backgroundColor: "rgba(100, 116, 139, 0.2)" },
  badgeTexto: { color: "#a5b4fc", fontSize: 11, fontWeight: "600" },
  btnRemover: { padding: 6 },
  
  // Modal Sub
  modalBoxSub: {
    width: "85%",
    backgroundColor: "#0C101A",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  tituloSub: { color: "#fff", fontSize: 15, fontWeight: "bold", marginBottom: 14 },
  opcaoNivelCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 8,
  },
  opcaoNivelSelecionado: {
    borderColor: "#6C5DD2",
    backgroundColor: "rgba(108, 93, 210, 0.15)",
  },
  opcaoLabel: { color: "#fff", marginLeft: 10, fontSize: 13, fontWeight: "600" },
  modalSubBotoes: { flexDirection: "row", gap: 10, marginTop: 16 },
  btnCancelarSub: {
    flex: 1,
    backgroundColor: "#334155",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  btnSalvarSub: {
    flex: 1,
    backgroundColor: "#6C5DD2",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});