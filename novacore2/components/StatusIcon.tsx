import { View, StyleSheet, Image } from "react-native";

type Props = {
  status: "ok" | "alerta" | "erro";
};

export default function StatusIcon({ status }: Props) {

  const icones = {
    ok: require("../assets/images/icone_normal.png"),
    alerta: require("../assets/images/icone_alerta.png"),
    erro: require("../assets/images/icone_critico.png"),
  };

  return (
    <Image
      source={icones[status]}
      style={{ width: 16, height: 16 }}
      resizeMode="contain"
    />
  );
}