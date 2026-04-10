import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import StatusIcon from "./StatusIcon";

type Props = {
  nome: string;
  localizacao: string;
  polos: number;
  rpm: number;
  kw: number;
  status: "ok" | "alerta" | "erro";
  onEditar: () => void;
};

export default function MotorCard({
  nome,
  localizacao,
  polos,
  rpm,
  kw,
  status,
  onEditar, 
}: Props) {
  const borderColor =
    status === "ok"
      ? "#22c55e"
      : status === "alerta"
      ? "#eab308"
      : "#ef4444";

  return (
    <View style={[styles.card, { borderColor }]}>

      <View style={styles.left}>
        <View style={{ marginTop: -60 }}>
          <StatusIcon status={status} />
        </View>

        <View>
          <View style={styles.content}>
            <Text style={styles.nome}>{nome}</Text>
            <Text style={styles.local}>{localizacao}</Text>
          </View>

          {/* 👇 AGORA FICA EMBAIXO */}
          <View style={styles.info}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>POLOS</Text>
              <Text style={styles.valor}>{polos}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.label}>RPM</Text>
              <Text style={styles.valor}>{rpm}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.label}>kW</Text>
              <Text style={styles.valor}>{kw}</Text>
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity onPress={onEditar} style={styles.botao}>
        <Text style={styles.botaoText}>Editar</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  content: {
  marginLeft: 16, // 👈 espaço entre ícone e texto
  flex: 1,
},

  card:{
    backgroundColor:"#020617",
  borderWidth:1.5,
  borderRadius:12,
  padding:20,
  marginBottom:14,
  flexDirection:"column", // 👈 muda isso
    
  },

  left:{
    flexDirection:"row",
    alignItems:"center",
    flex:2,
  },

  nome:{
    color:"#fff",
    fontWeight:"bold"
  },

  local:{
    color:"#94a3b8",
    fontSize:12
  },

info: {
  width: "100%",
  justifyContent: "space-evenly",
  flexDirection: "row", // 👈 lado a lado
  
  marginTop: 8,
  
},
infoItem: {
  alignItems: "center",
  
},
infoText: {
  color: "#aaa",
  fontSize: 13,
},

  label:{
    color:"#ffffff",
    fontSize:11,
  },

  valor:{
    color:"#fff",
    textAlign:"center",
    fontWeight:"bold",
  },

  botao:{
  width: 260,
  marginTop: 16,
  alignSelf: "center",
  borderWidth:1,
  borderColor:"#505050",
  paddingVertical:6,
  paddingHorizontal:16,
  borderRadius:8,
  alignItems: "center",
  },

  botaoText:{
    color:"#fff",
    fontWeight: "bold",
  },
  

});