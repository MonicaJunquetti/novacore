import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import StatusIcon from "./StatusIcon";
import { calcularStatus } from "./StatusMotor";

type Props = {
  nome: string;
  localizacao_setor: string;
  localizacao_bancada: string;
  status: "ok" | "alerta" | "erro";
  temperatura: number;
  vibracao: number;
};

export default function MotorCardAlert({
  nome,
  localizacao_setor,
  localizacao_bancada,
  temperatura,
  vibracao,
}: Props) {

  const status = calcularStatus(temperatura, vibracao);

  const borderColor =
    status === "ok"
      ? "#22c55e"
      : status === "alerta"
      ? "#eab308"
      : "#ef4444";

  return (
    <View style={[styles.card, { borderColor }]}>

      <View style={styles.left}>
        <StatusIcon status={status} />

        <View>
          <Text style={styles.nome}>{nome}</Text>
          <Text style={styles.local}>{localizacao_setor}</Text>
          <Text style={styles.local}>{localizacao_bancada}</Text>
        </View>
      </View>

      <View style={styles.info}>
        <View style={styles.info_card}>
          <Text style={styles.label}>TEMP</Text>
          <Text style={styles.valor}>{temperatura}°C</Text>
        </View>

        <View style={styles.info_card}>
          <Text style={styles.label}>VIB</Text>
          <Text style={styles.valor}>{vibracao} mm/s</Text>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  card:{
    borderWidth:1.5,
    borderRadius:18,
    padding:20,
    marginBottom:14,
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    width: '90%',
    gap: '15%'
  },

  left:{
    flexDirection:"row",
    alignItems:"center",
    flex:2
  },

  nome:{
    color:"#fff",
    fontWeight:"bold",
    fontFamily: 'sans-serif'
  },

  local:{
    color:"#ffffff",
    fontSize:13,
    marginTop: 2
  },

  info:{
    flexDirection:"row",
    gap:30,
    flex:2,
    justifyContent:"center",
  },
  info_card:{
    justifyContent:"center",
    alignItems: "center",
   
  },

  label:{
    color:"#ffffff",
    fontSize:13
  },

  valor:{
    color:"#fff",
    textAlign:"center"
  },

  botao:{
    borderWidth:1,
    borderColor:"#475569",
    paddingVertical:6,
    paddingHorizontal:16,
    borderRadius:8
  },

  botaoText:{
    color:"#fff"
  }

});