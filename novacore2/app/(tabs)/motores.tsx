import { View, Text, StyleSheet, FlatList, Platform, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import MotorCard from "../../components/MotorCard";
import SearchBar from "../../components/SearchBar";
import AddMotorButton from "../../components/AddMotorButton";
import AddMotorModal from "../../components/AddMotorModal";
import MotorDetailsModal from "../../components/MotorDetailsModal";
import Sidebar from "../../components/sidebar";
import BottomBar from "../../components/BottomBar";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDashboard } from "@/context/DashboardContext";
import { useRouter } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Motor = {
  id_motor: number;
  nome_motor: string;
  localizacao: string;
  numero_polos: number;
  rpm_nominal: number;
  potencia_motor: number;
  status: "ok" | "alerta" | "erro";
  classe_isolamento?: string;
  voltagem_nominal?: number;
  corrente_nominal?: number;
  fator_potencia?: number;
  rendimento?: number;
  espessura_carcaca?: number;
  area_conducao?: number;
  condutividade_metal?: number;
  raio_interno_carcaca?: number;
  raio_externo_estator?: number;
  comprimento_estator?: number;
};

export default function Motores() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { plantaAtiva } = useDashboard();

  const [motores, setMotores] = useState<Motor[]>([]);
  const [podeEditar, setPodeEditar] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [motorSelecionado, setMotorSelecionado] = useState<Motor | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [motorParaDetalhes, setMotorParaDetalhes] = useState<Motor | null>(null);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    if (plantaAtiva) {
      setPodeEditar(Boolean(plantaAtiva.pode_editar ?? true));
    }
  }, [plantaAtiva]);

  useEffect(() => {
    if (!plantaAtiva?.id_dashboard) {
      setMotores([]);
      return;
    }

    buscarMotores();
    const intervalo = setInterval(() => {
      buscarMotores();
    }, 2000);

    return () => clearInterval(intervalo);
  }, [plantaAtiva]);

  const buscarMotores = async () => {
    if (!plantaAtiva?.id_dashboard) return;

    try {
      const response = await fetch(`${API_URL}/motores/dashboard/${plantaAtiva.id_dashboard}`);
      const data = await response.json();
      if (response.ok) setMotores(data);
    } catch (error) {
      console.log("Erro ao buscar motores:", error);
    }
  };

  const motoresFiltrados = motores.filter((motor) =>
    motor.nome_motor.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {Platform.OS === "web" && <Sidebar />}

      <View style={[styles.conteudo, { paddingTop: insets.top + 20 }]}>
        {!plantaAtiva ? (
          /* ESTADO VAZIO: NENHUM DASHBOARD SELECIONADO */
          <View style={styles.emptyWrapper}>
            <View style={styles.emptyContainer}>
              <MaterialIcons name="dashboard-customize" size={64} color="#6C5DD2" />
              <Text style={styles.emptyTitle}>Nenhum Dashboard Selecionado</Text>
              <Text style={styles.emptySubtitle}>
                Você ainda não possui nenhum dashboard para visualizar ou adicionar motores.
              </Text>

              <TouchableOpacity
                style={styles.btnCriarDashboard}
                onPress={() => router.push("/dashboard_admin")}
              >
                <MaterialIcons name="add" size={20} color="#fff" />
                <Text style={styles.btnCriarText}>Criar dashboard</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* CONTEÚDO NORMAL DE MOTORES */
          <>
            <View style={styles.topBar}>
              <SearchBar valor={busca} onChange={setBusca} />

              {podeEditar && (
                <AddMotorButton
                  onPress={() => {
                    setMotorSelecionado(null);
                    setModalVisible(true);
                  }}
                />
              )}
            </View>

            <AddMotorModal
              visible={modalVisible}
              onClose={() => {
                setModalVisible(false);
                setMotorSelecionado(null);
              }}
              atualizarLista={buscarMotores}
              motorSelecionado={motorSelecionado}
              idDashboardAtivo={plantaAtiva.id_dashboard}
            />

            <MotorDetailsModal
              visible={detailsModalVisible}
              onClose={() => {
                setDetailsModalVisible(false);
                setMotorParaDetalhes(null);
              }}
              motor={motorParaDetalhes}
            />

            <FlatList
              data={motoresFiltrados}
              keyExtractor={(item) => item.id_motor.toString()}
              renderItem={({ item }) => (
                <MotorCard
                  nome={item.nome_motor}
                  localizacao={item.localizacao}
                  polos={item.numero_polos}
                  rpm={item.rpm_nominal}
                  kw={item.potencia_motor}
                  status={item.status}
                  onEditar={() => {
                    if (podeEditar) {
                      setMotorSelecionado(item);
                      setModalVisible(true);
                    }
                  }}
                  onVisualizarCondicoes={() => {
                    setMotorParaDetalhes(item);
                    setDetailsModalVisible(true);
                  }}
                />
              )}
              style={{ marginTop: 20 }}
            />
          </>
        )}
      </View>

      {Platform.OS !== "web" && <BottomBar />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: Platform.OS === "web" ? "row" : "column",
  },
  conteudo: {
    flex: 1,
    backgroundColor: "#020617",
    paddingHorizontal: 10,
  },
  topBar: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
    gap: 15,
    marginTop: -20,
    width: "98%",
  },

  /* ESTILOS DO ESTADO VAZIO (EMPTY STATE) */
  emptyWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    width: '100%',
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtitle: {
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
  btnCriarDashboard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6C5DD2",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    gap: 8,
  },
  btnCriarText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
});