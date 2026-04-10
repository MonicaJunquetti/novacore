import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Background from "../../components/Background2"; // use o mesmo background do login
import Input from "../../components/Input";
import Button from "../../components/Button2";
import { useRouter } from "expo-router";
import React, { useState } from "react";

export default function Cadastro() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleCadastro = async () => {
    try {
      const response = await fetch("http://192.168.0.146:3000/usuarios/cadastro", { // use 10.0.2.2 no Android emulator
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Sucesso", data.message);
        router.push("/login");
      } else {
        Alert.alert("Erro", data.message || "Erro ao cadastrar");
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível conectar ao servidor");
      console.error(error);
    }
  };


  return (
    <Background>
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>

      <View style={styles.container}>
        <Text style={styles.title}>Crie sua conta</Text>

        <Input placeholder="Nome" value={nome} onChangeText={setNome} />
        <Input placeholder="Email" value={email} onChangeText={setEmail} />
        <Input placeholder="Senha" secure value={senha} onChangeText={setSenha} />

        <Button title="Criar conta" onPress={handleCadastro} />

        <Pressable onPress={() => router.push("/login")}>
          {({ hovered }) => (
            <Text style={styles.link}>
              Já tem uma conta?{" "}
              <Text style={[styles.linkHighlight, hovered && styles.linkHover]}>
                Faça login
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
    top: 50,
    left: 20,
    zIndex: 1,
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