import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
} from "react-native";

type Props = {
  status_vibracao: "ok" | "alerta" | "erro";
  status_temperatura: "ok" | "alerta" | "erro";

  valor_vibracao: number;
  valor_temp: number;

  nome: string;
  localizacao_bancada?: string;
  localizacao_setor: string;
};

export default function MotorCardAlert({
  status_vibracao,
  status_temperatura,
  valor_vibracao,
  valor_temp,
  nome,
  localizacao_bancada,
  localizacao_setor,
}: Props) {

  console.log(
    "Motor:",
    nome,
    "| Temp:",
    status_temperatura,
    "| Vib:",
    status_vibracao
  );

  const bordaCard =
  status_vibracao === "erro" ||
  status_temperatura === "erro"
    ? "#ff4d4d"
    : status_vibracao === "alerta" ||
      status_temperatura === "alerta"
    ? "#FFD000"
    : "#505050";

  const iconeTemp =
  status_temperatura === "erro"
    ? require("../assets/images/icone_critico.png")
    : status_temperatura === "alerta"
    ? require("../assets/images/icone_alerta.png")
    : require("../assets/images/icone_normal_cinza.png");

  const iconeVib =
  status_vibracao === "erro"
    ? require("../assets/images/icone_critico.png")
    : status_vibracao === "alerta"
    ? require("../assets/images/icone_alerta.png")
    : require("../assets/images/icone_normal_cinza.png");

  return (
  <View
    style={[
      styles.card,
      { borderColor: bordaCard },
    ]}
  >

    {/* TOPO */}
    <View style={styles.topRow}>

      <Text style={styles.nome}>
        {nome}
      </Text>

      <Text style={styles.local}>
        {localizacao_setor}
      </Text>

      <Text style={styles.local}>
        {localizacao_bancada}
      </Text>

    </View>

    {/* STATUS */}
    <View style={styles.statusContainer}>

      {/* TEMP */}
      <View
        style={[
          styles.statusBox,
          {
            borderColor:
            status_temperatura === "erro"
              ? "#ff5a52"
              : status_temperatura === "alerta"
              ? "#FFD000"
              : "#505050"
          },
        ]}
      >

        <Image
          source={iconeTemp}
          style={styles.iconStatus}
        />

        <View>
          <Text style={styles.statusLabel}>
            TEMP
          </Text>

          <Text style={styles.statusValue}>
            {Number(valor_temp || 0).toFixed(1)}°C
          </Text>
        </View>

      </View>

      {/* VIB */}
      <View
        style={[
          styles.statusBox,
          {
            borderColor:
            status_vibracao === "erro"
              ? "#ff5a52"
              : status_vibracao === "alerta"
              ? "#FFD000"
              : "#505050"
          },
        ]}
      >

        <Image
          source={iconeVib}
          style={styles.iconStatus}
        />

        <View>
          <Text style={styles.statusLabel}>
            VIB
          </Text>

          <Text style={styles.statusValue}>
            {Number(valor_vibracao || 0).toFixed(2)} m/s²
          </Text>
        </View>

      </View>

    </View>

  </View>
);
}

const styles = StyleSheet.create({

  card: {
    width: "90%",
    backgroundColor: "#020817",
    borderWidth: 2,
    borderRadius: 24,

    paddingHorizontal: 18,
    paddingVertical: 20,

    marginBottom: 18,
    marginLeft: 20,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  nome: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
    marginRight: 14,
  },

  local: {
    color: "#fff",
    fontSize: 14,
    marginRight: 14,
  },

  statusContainer: {
  flexDirection: "row",
  gap: 14,

  justifyContent: "center",
  alignItems: "center",
},

  statusBox: {
  flexDirection: "row",
  alignItems: "center",

  borderWidth: 2,
  borderRadius: 18,

  paddingHorizontal: 14,
  paddingVertical: 8,
},

  iconStatus: {
    width: 16,
    height: 16,
    resizeMode: "contain",
    marginRight: 10,
  },

  statusLabel: {
    color: "#e5e5e5",
    fontSize: 13,
    marginRight: 10,
  },

  statusValue: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },

});