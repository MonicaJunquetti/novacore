import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Background from "../../components/Background2";
import Input from "../../components/Input";
import Button from "../../components/Button2";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = async () => {
  console.log("Tentando login");

  try {
    const response = await fetch("http://192.168.0.146:3000/usuarios/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    console.log("Status:", response.status);

    const data = await response.json();

    console.log("Resposta do servidor:", data);

    if (response.ok) {
      console.log("Login OK");
      router.push("/motores");
    } else {
      console.log("Erro no login");
      Alert.alert("Erro", data.message);
    }

  } catch (error) {
    console.log("Erro de conexão:", error);
  }
};

  return (
    <Background>
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()} // volta para a página anterior
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>
      <View style={styles.container}>
        <Text style={styles.title}>Faça login na {"\n"}sua conta</Text>

        <Input placeholder="Email" value={email} onChangeText={setEmail} />
        <Input placeholder="Senha" secure value={senha} onChangeText={setSenha} />

        <Button title="Login" onPress={handleLogin} />

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
  safeArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  backButton: {
    position: "absolute",
    top: 50, // ajuste conforme necessário
    left: 20,
    zIndex: 1, // garante que fique acima do conteúdo
  },
  container: {
    alignItems: "center",

  paddingHorizontal: 24,
  },
  title: {
    color: "#fff",
    fontSize: 36,
    marginBottom: 100,
    
    fontWeight: "bold",
    marginLeft: -40,
  },
  link: {
    color: "#aaa",
    marginTop: 10,
  },
  linkHover: {
  color: "#fff",
  textDecorationLine: "underline",
  },
  linkHighlight: {
  color: "#fff",
  fontWeight: "bold",
},
});