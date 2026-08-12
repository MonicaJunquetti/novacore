import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ScrollView
} from "react-native";
import { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";

type Motor = {
  id_motor: number
  nome_motor: string
  localizacao: string
  numero_polos: number
  rpm_nominal: number
  potencia_motor: number
  classe_isolamento: string
  voltagem_nominal: number
  corrente_nominal: number
  fator_potencia: number
  rendimento: number
  espessura_carcaca: number
  area_conducao: number
  condutividade_metal: number
  raio_interno_carcaca: number
  raio_externo_estator: number
  comprimento_estator: number
}

type Props = {
  visible: boolean;
  onClose: () => void;
  atualizarLista: () => void;
  motorSelecionado?: Motor | null; // 👈 NOVO
};

export default function AddMotorModal({ visible, onClose, atualizarLista, motorSelecionado }: Props) {

  const [nome, setNome] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [polos, setPolos] = useState("");
  const [rpm, setRpm] = useState("");
  const [kw, setKw] = useState("");
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
      // limpa quando for cadastro novo
      setNome("");
      setLocalizacao("");
      setPolos("");
      setRpm("");
      setKw("");
      setRaioExternoEstator("");
    }
  }, [motorSelecionado, visible]);

  const salvarMotor = async () => {

    const url = motorSelecionado
      ? `http://10.223.48.54:3000/motores/${motorSelecionado.id_motor}`
      : "http://10.223.48.54:3000/motores";

    const method = motorSelecionado ? "PUT" : "POST";

    try {

      console.log("Enviando:", {
        url,
        method,
        id: motorSelecionado?.id_motor
      });

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nome_motor: nome,
          localizacao: localizacao,
          numero_polos: Number(polos),
          rpm_nominal: Number(rpm),
          potencia_motor: Number(kw),
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
        })
      });

      const data = await response.json();

      console.log("Resposta do servidor:", data);

      if (!response.ok) {
        throw new Error("Erro ao salvar");
      }

      atualizarLista();
      onClose();

    } catch (error) {
      console.log("ERRO:", error);
    }
  };

  const removerMotor = async () => {
    if (!motorSelecionado) return;
    try {
      const response = await fetch(
        `http://10.223.48.54:3000/motores/${motorSelecionado.id_motor}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Erro ao remover");
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
            contentContainerStyle={{
              paddingBottom: 20,
            }}
          >

          <TouchableOpacity style={styles.botaoFechar} onPress={onClose}>
            <Text style={styles.textoFechar}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.titulo}>
            {motorSelecionado ? "Editar motor" : "Cadastrar motor"}
          </Text>

          {/* ID */}
          <Text style={styles.label}>ID do motor</Text>
          <TextInput placeholder="Digite" placeholderTextColor="#ffffff" style={styles.input} value={nome} onChangeText={setNome} />

          {/* Localização */}
          <Text style={styles.label}>Localização (setor)</Text>
          <TextInput placeholder="Digite" placeholderTextColor="#ffffff" style={styles.input} value={localizacao} onChangeText={setLocalizacao} />

          {/* Polos */}
          <Text style={styles.label}>Polos</Text>
          <TextInput placeholder="Digite" placeholderTextColor="#ffffff" style={styles.input} value={polos} onChangeText={setPolos} />

          {/* RPM */}
          <Text style={styles.label}>RPM</Text>
          <TextInput placeholder="Digite" placeholderTextColor="#ffffff" style={styles.input} value={rpm} onChangeText={setRpm} />

          {/* kW */}
          <Text style={styles.label}>kW</Text>
          <TextInput placeholder="Digite" placeholderTextColor="#ffffff" style={styles.input} value={kw} onChangeText={setKw} />

          <TouchableOpacity
            style={styles.botaoAvancado}
            onPress={() =>
              setMostrarAvancado(!mostrarAvancado)
            }
          >
            <MaterialIcons
              name="build"
              size={20}
              color="#fff"
            />

            <Text style={styles.textoAvancado}>
              Configurações avançadas
            </Text>

            <MaterialIcons
              name={
                mostrarAvancado
                  ? "keyboard-arrow-up"
                  : "keyboard-arrow-down"
              }
              size={22}
              color="#fff"
            />
          </TouchableOpacity>

          {mostrarAvancado && (
            <>

              <Text style={styles.label}
              style={[
                styles.label,
                { marginTop: 25 }
              ]}>
                Tensão (Voltagem)
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Digite"
                placeholderTextColor="#fff"
                value={tensao}
                onChangeText={setTensao}
              />

              <Text style={styles.label}>
                Corrente Elétrica
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Digite"
                placeholderTextColor="#fff"
                value={corrente}
                onChangeText={setCorrente}
              />

              <Text style={styles.label}>
                Fator de Potência
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Digite"
                placeholderTextColor="#fff"
                value={fatorPotencia}
                onChangeText={setFatorPotencia}
              />

              <Text style={styles.label}>
                Rendimento (eta)
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Digite"
                placeholderTextColor="#fff"
                value={rendimento}
                onChangeText={setRendimento}
              />

              <Text style={styles.label}>
                Classe de Isolamento
              </Text>

              <View style={styles.containerClasses}>
                {["A", "B", "F", "H"].map((classe) => (
                  <TouchableOpacity
                    key={classe}
                    style={[
                      styles.botaoClasse,
                      classeIsolamento === classe && styles.botaoClasseSelecionado
                    ]}
                    onPress={() => setClasseIsolamento(classe)}
                  >
                    <Text
                      style={[
                        styles.textoClasse,
                        classeIsolamento === classe && styles.textoClasseSelecionado
                      ]}
                    >
                      {classe}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>
                Espessura da parede
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Digite"
                placeholderTextColor="#fff"
                value={espessuraParede}
                onChangeText={setEspessuraParede}
              />

              <Text style={styles.label}>
                Área de transferência
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Digite"
                placeholderTextColor="#fff"
                value={areaTransferencia}
                onChangeText={setAreaTransferencia}
              />

              <Text style={styles.label}>
                Condutividade do metal
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Digite"
                placeholderTextColor="#fff"
                value={condutividadeMetal}
                onChangeText={setCondutividadeMetal}
              />

              <Text style={styles.label}>
                Raio interno da carcaça
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Digite"
                placeholderTextColor="#fff"
                value={raioInterno}
                onChangeText={setRaioInterno}
              />

              <Text style={styles.label}>
                Raio externo do estator
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Digite"
                placeholderTextColor="#fff"
                value={raioExternoEstator}
                onChangeText={setRaioExternoEstator}
              />

              <Text style={styles.label}>
                Comprimento do motor
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Digite"
                placeholderTextColor="#fff"
                value={comprimentoMotor}
                onChangeText={setComprimentoMotor}
              />

            </>
          )}

          <View style={styles.containerBotoes}>

            <TouchableOpacity
              style={styles.botao}
              onPress={salvarMotor}
            >
              <Text style={styles.botaoTexto}>
                Salvar alterações
              </Text>
            </TouchableOpacity>
            {motorSelecionado && (
              <TouchableOpacity
                style={styles.botaoExcluir}
                onPress={() => {
                  Alert.alert(
                    "Excluir motor",
                    "Deseja realmente apagar este motor?",
                    [
                      {
                        text: "Cancelar",
                        style: "cancel"
                      },
                      {
                        text: "Sim",
                        style: "destructive",
                        onPress: removerMotor
                      }
                    ]
                  );
                }}
              >
                <MaterialIcons
                  name="delete"
                  size={22}
                  color="#fff"
                />
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

  container:{
    flex:1,
    backgroundColor:"#0C101A",
    padding:400,
    justifyContent:"center",
    
  },

  label: {
  color: "#ffffff",
  marginBottom: 6,
  marginTop: 10,
},

containerBotoes: {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
},

botaoExcluir: {
  width: 55,
  height: 55,
  borderRadius: 15,
  backgroundColor: "#dc2626",
  justifyContent: "center",
  alignItems: "center",
  marginTop: 20,
},

  titulo:{
    color:"#fff",
    fontSize:18,
    marginBottom:10,
    fontWeight: "bold",
  },

  linha: {
  flexDirection: "row",
  justifyContent: "space-between",
  gap: 20, // se não funcionar, pode remover
},

coluna: {
  flex: 1,
},

input: {
  backgroundColor:"#1A1D26",
  color:"#ffffff",
  padding:12,
  borderRadius:15,
  marginBottom:10,
  borderWidth: 1,
  borderColor:"#505050",

},

  botao:{
  flex: 1,
  backgroundColor:"#6C5DD2",
  padding:15,
  borderRadius:15,
  alignItems:"center",
  justifyContent:"center",
  marginTop: 10,
},

botaoAvancado: {
  height: 55,
  borderRadius: 15,
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
  fontSize: 16,
  fontWeight: "600",
},

  botaoTexto:{
    color:"#fff",
    fontWeight:"bold",
    fontSize:16,
  },
  botaoFechar: {
  position: "absolute",
  top: -1,
  right: 10,
  zIndex: 1,
},

textoFechar: {
  color: "#fff",
  fontSize: 18,
  fontWeight: "bold",
},

overlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.6)", // fundo escuro
  justifyContent: "center",
  alignItems: "center",
},

modalBox: {
  width: "90%",
  maxHeight: "90%",
  backgroundColor: "#020617",
  borderRadius: 20,
  padding: 20,
  borderWidth: 1,          // espessura da borda
  borderColor: "#505050",
},

containerClasses: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 10,
},

botaoClasse: {
  flex: 1,
  height: 50,
  marginHorizontal: 4,
  borderRadius: 12,
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

});