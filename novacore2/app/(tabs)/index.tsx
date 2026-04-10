import { View, Text, StyleSheet, Image, Pressable  } from "react-native";
import Background from "../../components/Background";
import Button from "../../components/Button";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();

  return (
    <Background>
      <View style={styles.container}>
        <Image
        source={require("../../assets/images/novacore2.png")}
        style={styles.logo2}
        />
        <Text style={styles.title}>Bem vindo a</Text>
        <Image
        source={require("../../assets/images/novacore.png")}
        style={styles.logo}
        />

        <Button
          title="Login"
          onPress={() => router.push("/login")}
        />

        <Pressable onPress={() => router.push("/cadastro")}>
          {({ hovered }) => (
            <Text style={styles.link}>
              Não tem uma conta?{" "}
              <Text style={[styles.linkHighlight, hovered && styles.linkHover]}>
                Cadastre-se
              </Text>
            </Text>
          )}
        </Pressable>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end", // joga para baixo
    alignItems: "flex-start",   // joga para esquerda
    padding: 20,                // espaço da borda
    top: -50,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 10,
    fontWeight: "bold",
  },
  logo: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 60,
  },
  logo2: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 30,
  },
  link: {
    color: "#aaa",
    marginTop: 10,
    
  },

  linkHighlight: {
  color: "#fff",
  fontWeight: "bold",
},

linkHover: {
  color: "#fff",
  textDecorationLine: "underline",
},
});