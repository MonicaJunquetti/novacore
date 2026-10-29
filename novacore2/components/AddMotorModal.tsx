import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Paleta de cores sugeridas para o gráfico
const CORES_PALETA = [
  "#6C5DD1", "#00E396", "#FEB019", "#FF4560", 
  "#775DD0", "#3F51B5", "#03A9F4", "#20E647", "#FF66C4"
];

type Motor = {
  id_motor: number;
  nome_motor: string;
  localizacao: string;
  numero_polos: number;
  rpm_nominal: number;
  potencia_motor: number;
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
  fk_dashboard?: number;
  cor_grafico?: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  atualizarLista: () => void;
  motorSelecionado?: Motor | null;
  idDashboardAtivo?: number;
};

export default function AddMotorModal({
  visible,
  onClose,
  atualizarLista,
  motorSelecionado,
  idDashboardAtivo,
}: Props) {
  const [nome, setNome] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [polos, setPolos] = useState("");
  const [rpm, setRpm] = useState("");
  const [kw, setKw] = useState("");
  const [corGrafico, setCorGrafico] = useState("#6C5DD1");
  const [mostrarAvancado, setMostrarAvancado] = useState(false);
  const [tensao, setTensao] = useState("");
  const [corrente, setCorrente] = useState("");
  const [fatorPotencia, setFatorPotencia] = useState("");
  const [rendimento, setRendimento] = useState("");
  const [espessuraParede, setEspessuraParede] = useState("");
  const [areaTransferencia, setAreaTransferencia] = useState("");
  const [condutividadeMetal, setCondutividadeMetal] = useState("");
  const [raioInterno, setRaioInterno] = useState("");
  const [comprimentoMotor, setComprimentoMotor] = useState("");
  const [classeIsolamento, setClasseIsolamento] = useState("");
  const [raioExternoEstator, setRaioExternoEstator] = useState("");

  const formatarDecimal = (valor: any) => {
    return valor != null ? String(parseFloat(valor)) : "";
  };

  useEffect(() => {
    if (motorSelecionado) {
      setNome(motorSelecionado.nome_motor);
      setLocalizacao(motorSelecionado.localizacao);
      setPolos(String(motorSelecionado.numero_polos));
      setRpm(String(motorSelecionado.rpm_nominal));
      setKw(String(motorSelecionado.potencia_motor));
      setCorGrafico(motorSelecionado.cor_grafico || "#6C5DD1");
      setClasseIsolamento(motorSelecionado.classe_isolamento || "");
      setTensao(formatarDecimal(motorSelecionado.voltagem_nominal));
      setCorrente(formatarDecimal(motorSelecionado.corrente_nominal));
      setFatorPotencia(formatarDecimal(motorSelecionado.fator_potencia));
      setRendimento(formatarDecimal(motorSelecionado.rendimento));

      setEspessuraParede(formatarDecimal(motorSelecionado.espessura_carcaca));
      setAreaTransferencia(formatarDecimal(motorSelecionado.area_conducao));
      setCondutividadeMetal(formatarDecimal(motorSelecionado.condutividade_metal));
      setRaioInterno(formatarDecimal(motorSelecionado.raio_interno_carcaca));
      setComprimentoMotor(formatarDecimal(motorSelecionado.comprimento_estator));
      setRaioExternoEstator(formatarDecimal(motorSelecionado.raio_externo_estator));
    } else {
      setNome("");
      setLocalizacao("");
      setPolos("");
      setRpm("");
      setKw("");
      setCorGrafico("");
      setClasseIsolamento("");
      setTensao("");
      setCorrente("");
      setFatorPotencia("");
      setRendimento("");
      setEspessuraParede("");
      setAreaTransferencia("");
      setCondutividadeMetal("");
      setRaioInterno("");
      setComprimentoMotor("");
      setRaioExternoEstator("");
    }
  }, [motorSelecionado, visible]);

  const salvarMotor = async () => {
    if (!idDashboardAtivo && !motorSelecionado) {
      Alert.alert("Erro", "Nenhum dashboard selecionado para associar o motor.");
      return;
    }

    const url = motorSelecionado
      ? `${API_URL}/motores/${motorSelecionado.id_motor}`
      : `${API_URL}/motores`;

    const method = motorSelecionado ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome_motor: nome,
          localizacao: localizacao,
          numero_polos: Number(polos),
          rpm_nominal: Number(rpm),
          potencia_motor: Number(kw),
          cor_grafico: corGrafico,
          classe_isolamento: classeIsolamento,
          voltagem_nominal: tensao ? Number(tensao) : null,
          corrente_nominal: corrente ? Number(corrente) : null,
          fator_potencia: fatorPotencia ? Number(fatorPotencia) : null,
          rendimento: rendimento ? Number(rendimento) : null,
          espessura_carcaca: espessuraParede ? Number(espessuraParede) : null,
          area_conducao: areaTransferencia ? Number(areaTransferencia) : null,
          condutividade_metal: condutividadeMetal ? Number(condutividadeMetal) : null,
          raio_interno_carcaca: raioInterno ? Number(raioInterno) : null,
          raio_externo_estator: raioExternoEstator ? Number(raioExternoEstator) : null,
          comprimento_estator: comprimentoMotor ? Number(comprimentoMotor) : null,
          fk_dashboard: idDashboardAtivo,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar motor");
      }

      atualizarLista();
      onClose();
    } catch (error) {
      console.log("ERRO AO SALVAR:", error);
    }
  };

  const removerMotor = async () => {
    if (!motorSelecionado) return;
    try {
      const response = await fetch(`${API_URL}/motores/${motorSelecionado.id_motor}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Erro ao remover motor");
      }
      atualizarLista();
      onClose();
    } catch (error) {
      console.log("ERRO AO REMOVER:", error);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <TouchableOpacity style={styles.botaoFechar} onPress={onClose}>
              <Text style={styles.textoFechar}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.titulo}>
              {motorSelecionado ? "Editar motor" : "Cadastrar motor"}
            </Text>

            <Text style={styles.label}>Nome do motor</Text>
            <TextInput
              placeholder="Digite"
              placeholderTextColor="#888"
              style={styles.input}
              value={nome}
              onChangeText={setNome}
            />

            <Text style={styles.label}>Localização (setor)</Text>
            <TextInput
              placeholder="Digite"
              placeholderTextColor="#888"
              style={styles.input}
              value={localizacao}
              onChangeText={setLocalizacao}
            />

            {/* SELEÇÃO DE COR DO GRÁFICO */}
            <Text style={styles.label}>Cor da Linha do Gráfico</Text>
            <View style={styles.containerCores}>
              {CORES_PALETA.map((cor) => (
                <TouchableOpacity
                  key={cor}
                  style={[
                    styles.circuloCor,
                    { backgroundColor: cor },
                    corGrafico === cor && styles.circuloCorSelecionado,
                  ]}
                  onPress={() => setCorGrafico(cor)}
                >
                  {corGrafico === cor && (
                    <MaterialIcons name="check" size={16} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Polos</Text>
            <TextInput
              placeholder="Digite"
              placeholderTextColor="#888"
              style={styles.input}
              value={polos}
              onChangeText={setPolos}
              keyboardType="numeric"
            />

            <Text style={styles.label}>RPM</Text>
            <TextInput
              placeholder="Digite"
              placeholderTextColor="#888"
              style={styles.input}
              value={rpm}
              onChangeText={setRpm}
              keyboardType="numeric"
            />

            <Text style={styles.label}>kW</Text>
            <TextInput
              placeholder="Digite"
              placeholderTextColor="#888"
              style={styles.input}
              value={kw}
              onChangeText={setKw}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={styles.botaoAvancado}
              onPress={() => setMostrarAvancado(!mostrarAvancado)}
            >
              <MaterialIcons name="build" size={20} color="#fff" />
              <Text style={styles.textoAvancado}>Configurações avançadas</Text>
              <MaterialIcons
                name={mostrarAvancado ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                size={22}
                color="#fff"
              />
            </TouchableOpacity>

            {mostrarAvancado && (
              <>
                <Text style={[styles.label, { marginTop: 25 }]}>Tensão (Voltagem)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Digite"
                  placeholderTextColor="#888"
                  value={tensao}
                  onChangeText={setTensao}
                  keyboardType="numeric"
                />

                <Text style={styles.label}>Corrente Elétrica</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Digite"
                  placeholderTextColor="#888"
                  value={corrente}
                  onChangeText={setCorrente}
                  keyboardType="numeric"
                />

                <Text style={styles.label}>Fator de Potência</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Digite"
                  placeholderTextColor="#888"
                  value={fatorPotencia}
                  onChangeText={setFatorPotencia}
                  keyboardType="numeric"
                />

                <Text style={styles.label}>Rendimento (eta)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Digite"
                  placeholderTextColor="#888"
                  value={rendimento}
                  onChangeText={setRendimento}
                  keyboardType="numeric"
                />

                <Text style={styles.label}>Classe de Isolamento</Text>
                <View style={styles.containerClasses}>
                  {["A", "B", "F", "H"].map((classe) => (
                    <TouchableOpacity
                      key={classe}
                      style={[
                        styles.botaoClasse,
                        classeIsolamento === classe && styles.botaoClasseSelecionado,
                      ]}
                      onPress={() => setClasseIsolamento(classe)}
                    >
                      <Text
                        style={[
                          styles.textoClasse,
                          classeIsolamento === classe && styles.textoClasseSelecionado,
                        ]}
                      >
                        {classe}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Espessura da parede</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Digite"
                  placeholderTextColor="#888"
                  value={espessuraParede}
                  onChangeText={setEspessuraParede}
                  keyboardType="numeric"
                />

                <Text style={styles.label}>Área de transferência</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Digite"
                  placeholderTextColor="#888"
                  value={areaTransferencia}
                  onChangeText={setAreaTransferencia}
                  keyboardType="numeric"
                />

                <Text style={styles.label}>Condutividade do metal</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Digite"
                  placeholderTextColor="#888"
                  value={condutividadeMetal}
                  onChangeText={setCondutividadeMetal}
                  keyboardType="numeric"
                />

                <Text style={styles.label}>Raio interno da carcaça</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Digite"
                  placeholderTextColor="#888"
                  value={raioInterno}
                  onChangeText={setRaioInterno}
                  keyboardType="numeric"
                />

                <Text style={styles.label}>Raio externo do estator</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Digite"
                  placeholderTextColor="#888"
                  value={raioExternoEstator}
                  onChangeText={setRaioExternoEstator}
                  keyboardType="numeric"
                />

                <Text style={styles.label}>Comprimento do motor</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Digite"
                  placeholderTextColor="#888"
                  value={comprimentoMotor}
                  onChangeText={setComprimentoMotor}
                  keyboardType="numeric"
                />
              </>
            )}

            <View style={styles.containerBotoes}>
              <TouchableOpacity style={styles.botao} onPress={salvarMotor}>
                <Text style={styles.botaoTexto}>Salvar alterações</Text>
              </TouchableOpacity>

              {motorSelecionado && (
                <TouchableOpacity
                  style={styles.botaoExcluir}
                  onPress={() => {
                    Alert.alert("Excluir motor", "Deseja realmente apagar este motor?", [
                      { text: "Cancelar", style: "cancel" },
                      { text: "Sim", style: "destructive", onPress: removerMotor },
                    ]);
                  }}
                >
                  <MaterialIcons name="delete" size={22} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "90%",
    maxHeight: "90%",
    backgroundColor: "#020617",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#505050",
  },
  titulo: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },
  label: {
    color: "#ffffff",
    marginBottom: 6,
    marginTop: 10,
    fontSize: 13,
  },
  input: {
    backgroundColor: "#1A1D26",
    color: "#ffffff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#505050",
  },
  containerCores: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
    marginTop: 4,
  },
  circuloCor: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  circuloCorSelecionado: {
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  botaoAvancado: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#6C5DD2",
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  textoAvancado: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  containerClasses: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  botaoClasse: {
    flex: 1,
    height: 44,
    marginHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#505050",
    backgroundColor: "#1A1D26",
    justifyContent: "center",
    alignItems: "center",
  },
  botaoClasseSelecionado: {
    backgroundColor: "#6C5DD2",
    borderColor: "#6C5DD2",
  },
  textoClasse: {
    color: "#fff",
    fontWeight: "600",
  },
  textoClasseSelecionado: {
    color: "#fff",
    fontWeight: "bold",
  },
  containerBotoes: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 15,
  },
  botao: {
    flex: 1,
    backgroundColor: "#6C5DD2",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  botaoExcluir: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
  },
  botaoTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  botaoFechar: {
    position: "absolute",
    top: 0,
    right: 5,
    zIndex: 1,
  },
  textoFechar: {
    color: "#94a3b8",
    fontSize: 20,
    fontWeight: "bold",
  },
});