import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";
import { ReactNode } from "react";

type BackgroundProps = {
  children: ReactNode;
};

export default function Background({ children }: BackgroundProps) {
  return (
    <LinearGradient
    colors={["#000000", "#1e0a63", "#7c3aed"]}
    start={{ x: 0, y: 0.5 }}
    end={{ x: 1, y: 0.5 }}
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