import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { useState, useEffect } from "react";

type Motor = {
  id_motor: number
  nome_motor: string
  localizacao: string
  numero_polos: number
  rpm_nominal: number
  potencia_motor: number
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

  useEffect(() => {
    if (motorSelecionado) {
      setNome(motorSelecionado.nome_motor);
      setLocalizacao(motorSelecionado.localizacao);
      setPolos(String(motorSelecionado.numero_polos));
      setRpm(String(motorSelecionado.rpm_nominal));
      setKw(String(motorSelecionado.potencia_motor));
    } else {
      // limpa quando for cadastro novo
      setNome("");
      setLocalizacao("");
      setPolos("");
      setRpm("");
      setKw("");
    }
  }, [motorSelecionado, visible]);

  const salvarMotor = async () => {

    const url = motorSelecionado
      ? `http://192.168.0.146:3000/motores/${motorSelecionado.id_motor}`
      : "http://192.168.0.146:3000/motores";

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
          potencia_motor: Number(kw)
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

  return (

    <Modal visible={visible} animationType="fade" transparent={true}>

    <View style={styles.overlay}>

        <View style={styles.modalBox}>

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

          <TouchableOpacity style={styles.botao} onPress={salvarMotor}>
            <Text style={styles.botaoTexto}>Salvar alterações</Text>
          </TouchableOpacity>

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

  titulo:{
    color:"#fff",
    fontSize:18,
    marginBottom:30,
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
    backgroundColor:"#6C5DD2",
    padding:15,
    borderRadius:15,
    alignItems:"center",
    marginTop: 20,
  },

  botaoTexto:{
    color:"#fff",
    fontWeight:"bold",
    fontSize:16,
  },
  botaoFechar: {
  position: "absolute",
  top: 25,
  right: 25,
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
  backgroundColor: "#020617",
  borderRadius: 20,
  padding: 20,
  borderWidth: 1,          // espessura da borda
  borderColor: "#505050",
},

});