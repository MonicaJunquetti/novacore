import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from "@expo/vector-icons";
import BottomBar from "../../components/BottomBar";
import GerenciarAcessosModal from "../../components/GerenciarAcessosModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Dashboard = {
  id_dashboard: number;
  nome_dashboard: string;
  descricao: string;
  pode_editar: boolean;
};

export default function EditarPerfil() {
  const router = useRouter();
  const [idUsuario, setIdUsuario] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [modalAcessosVisivel, setModalAcessosVisivel] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);

  const carregarUsuario = async () => {
    try {
      const usuarioSalvo = await AsyncStorage.getItem("usuario");
      if (usuarioSalvo) {
        const usuario = JSON.parse(usuarioSalvo);
        setIdUsuario(usuario.id_usuario.toString());
        setNome(usuario.nome_usuario);
        setEmail(usuario.email_usuario);
        carregarDashboards(usuario.id_usuario);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const carregarDashboards = async (idUser: string | number) => {
    try {
      const res = await fetch(`${API_URL}/dashboards/usuario/${idUser}`);
      const data = await res.json();
      if (res.ok) setDashboards(data);
    } catch (error) {
      console.log("Erro ao buscar dashboards:", error);
    }
  };

  useEffect(() => {
    carregarUsuario();
  }, []);

  const salvarPerfil = async () => {
    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/usuarios/editar/${idUsuario}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha }),
      });
      if (response.ok) {
        await AsyncStorage.setItem(
          "usuario",
          JSON.stringify({ id_usuario: idUsuario, nome_usuario: nome, email_usuario: email })
        );
        alert("Perfil atualizado!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // FUNÇÃO PARA ENCERRAR A SESSÃO
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("usuario");
      await AsyncStorage.removeItem("dashboardAtivo");
      router.replace("/login");
    } catch (error) {
      console.log("Erro ao fazer logout:", error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#000510', '#000510', '#000510', '#030033', '#4200e880']}
        style={styles.mainContainer}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          <View style={styles.header}>
            <Text style={styles.text_header}>Editar perfil</Text>
          </View>


          <View style={styles.inputContainer}>
            <Text style={styles.text}>Nome</Text>
            <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Nome" placeholderTextColor="#888" />
            <Text style={styles.text}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="#888" />
            <Text style={styles.text}>Senha</Text>
            <TextInput style={styles.input} value={senha} onChangeText={setSenha} secureTextEntry placeholder="Senha" placeholderTextColor="#888" />
            <Text style={styles.text}>Confirmar senha</Text>
            <TextInput style={styles.input} value={confirmarSenha} onChangeText={setConfirmarSenha} secureTextEntry placeholder="Confirmar senha" placeholderTextColor="#888" />

            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.btn_salvar} onPress={salvarPerfil}>
              <Text style={styles.text_btn}>Salvar alterações</Text>
            </TouchableOpacity>
          </View>

        


        </ScrollView>
      </LinearGradient>

      {selectedDashboard && (
        <GerenciarAcessosModal
          visible={modalAcessosVisivel}
          onClose={() => setModalAcessosVisivel(false)}
          dashboardId={selectedDashboard.id_dashboard}
          dashboardNome={selectedDashboard.nome_dashboard}
        />
      )}

      {Platform.OS !== "web" && <BottomBar />}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
     flex: 1 
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 25, 
    borderBottomWidth: 1, 
    borderBottomColor: '#505050', 
    marginBottom: 20 
  },
  text_header: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  text: { 
    color: '#fff', 
    fontSize: 15, 
    fontWeight: 'bold',
    marginBottom: 5,
    alignSelf: 'flex-start',
    marginLeft: 20
  },
  inputContainer: { alignItems: 'center', width: '100%' },
  input: { width: '90%', height: 50, borderWidth: 1, borderColor: '#505050', borderRadius: 15, color: '#fff', paddingHorizontal: 15, backgroundColor: '#1A1D26', marginBottom: 15 },
  btn_salvar: { width: '90%', height: 50, backgroundColor: '#6C5DD2', alignItems: 'center', justifyContent: 'center', borderRadius: 15 },
  text_btn: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: "#505050", marginVertical: 25, width: "90%", alignSelf: "center" },
  dashCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#0C101A", padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: "#334155" },
  dashNome: { color: "#fff", fontSize: 16, fontWeight: "600" },
  dashDesc: { color: "#64748b", fontSize: 12, marginTop: 2 },
  btnGerenciar: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(108, 93, 210, 0.15)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  btnGerenciarText: { color: "#a5b4fc", fontSize: 13, fontWeight: "600" },
  logoutContainer: { alignItems: 'center', width: '100%', marginTop: 10 },
  btnLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '90%',
    height: 50,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 15,
  },
  btnLogoutText: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' },
});