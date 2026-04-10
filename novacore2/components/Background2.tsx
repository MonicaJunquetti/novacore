import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";
import { ReactNode } from "react";

type BackgroundProps = {
  children: ReactNode;
};

export default function Background({ children }: BackgroundProps) {
  return (
    <LinearGradient
    colors={["#000000", "#1e0a63", "#6C5DD2"]}
    start={{ x: 0.5, y: 0 }}   // começa na parte inferior central
    end={{ x: 0.5, y: 1 }}     // termina no topo central
    style={styles.container}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
});