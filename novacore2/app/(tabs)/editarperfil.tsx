import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
  Image,
  TextInput,
  Platform
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from "@expo/vector-icons";
import BottomBar from "../../components/BottomBar";
import Sidebar from "../../components/sidebar";
import NotificationModal from "../../components/NotificationModal";
import AsyncStorage from "@react-native-async-storage/async-storage";


const { width: screenWidth } = Dimensions.get('window');

export default function EditarPerfil() {
  
    const [idUsuario, setIdUsuario] = useState("");

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");

    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");

    const [modalVisivel, setModalVisivel] = useState(false);
    const [alertas, setAlertas] = useState([]);

    const [notificacoesNaoLidas, setNotificacoesNaoLidas] = useState(0);

    const ultimoIdAlerta = useRef<number | null>(null);

    const buscarAlertas = async () => {
    try {
        const response = await fetch(
        "http://192.168.0.146:3000/alertas"
        );
        const data = await response.json();
        setAlertas(data);
        if (!data || data.length === 0) return;
        // pega maior ID
        const maiorId = Math.max(
        ...data.map((item: any) => item.id_alerta)
        );
        // PRIMEIRA EXECUÇÃO
        if (ultimoIdAlerta.current === null) {
        // tenta recuperar último ID salvo
        const ultimoIdSalvo =
            await AsyncStorage.getItem(
            "ultimoIdAlerta"
            );
        if (ultimoIdSalvo) {

            ultimoIdAlerta.current =
            Number(ultimoIdSalvo);
        } else {
            ultimoIdAlerta.current = maiorId;
            await AsyncStorage.setItem(
            "ultimoIdAlerta",
            maiorId.toString()
            );
        }
        return;
        }
        // chegou alerta novo
        if (maiorId > ultimoIdAlerta.current) {
        setNotificacoesNaoLidas((prev) => {
            const novoValor = prev + 1;
            AsyncStorage.setItem(
            "notificacoesNaoLidas",
            novoValor.toString()
            );
            return novoValor;
        });
        ultimoIdAlerta.current = maiorId;
        await AsyncStorage.setItem(
            "ultimoIdAlerta",
            maiorId.toString()
        );
        }
    } catch (error) {
        console.log(
        "Erro ao buscar alertas:",
        error
        );
    }
    };

    const carregarNotificacoes = async () => {
    try {
        const valorSalvo =
        await AsyncStorage.getItem(
            "notificacoesNaoLidas"
        );
        if (valorSalvo) {
        setNotificacoesNaoLidas(
            Number(valorSalvo)
        );
        }
    }
    catch (error) {
        console.log(error);
    }
    };

    const carregarUltimoId = async () => {
    try {
        const valor =
        await AsyncStorage.getItem(
            "ultimoIdAlerta"
        );
        if (valor) {
        ultimoIdAlerta.current =
            Number(valor);
        }
    } catch (error) {
        console.log(error);
    }
    };

    const carregarUsuario = async () => {
        try {
            const usuarioSalvo =
                await AsyncStorage.getItem("usuario");
            if (usuarioSalvo) {
                const usuario =
                    JSON.parse(usuarioSalvo);
                setIdUsuario(usuario.id_usuario.toString());
                setNome(usuario.nome_usuario);
                setEmail(usuario.email_usuario);
            }
        }

        catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
    carregarNotificacoes();
    carregarUltimoId();
    buscarAlertas();
    const intervalo = setInterval(() => {
        buscarAlertas();
    }, 2000);
    return () => clearInterval(intervalo);
    }, []);

    const salvarPerfil = async () => {
        if (senha !== confirmarSenha) {
            alert("As senhas não coincidem");
            return;
        }
        try {
            const response = await fetch(
                `http://192.168.0.146:3000/usuarios/editar/${idUsuario}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        nome,
                        email,
                        senha,
                    }),
                }
            );
            const data = await response.json();
            if (response.ok) {
                const usuarioAtualizado = {
                    id_usuario: idUsuario,
                    nome_usuario: nome,
                    email_usuario: email,
                };
                // salva no AsyncStorage
                await AsyncStorage.setItem(
                    "usuario",
                    JSON.stringify(usuarioAtualizado)
                );
                // atualiza estados imediatamente
                setNome(nome);
                setEmail(email);
                // limpa senhas
                setSenha("");
                setConfirmarSenha("");
                // recarrega dados atualizados
                carregarUsuario();
                alert("Perfil atualizado!");
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.log(error);
            alert("Erro ao atualizar perfil");
        }
    };

    return (

      <View style={{ flex: 1 }}>

          <LinearGradient 
              colors={['#000510', '#000510', '#000510', '#030033', '#4200e880' ]} 
              style={styles.mainContainer}
          >

              <View style={styles.header}> 
                  <Text style={styles.text_header}>Perfil</Text>

                  <TouchableOpacity
                    style={styles.notificationButton}
                    onPress={async () => {
                    setModalVisivel(true);
                    setNotificacoesNaoLidas(0);
                    await AsyncStorage.setItem(
                        "notificacoesNaoLidas",
                        "0"
                    );
                    }}
                    >

                      <MaterialIcons
                          name="notifications"
                          size={22}
                          color="#fff"
                      />

                      {notificacoesNaoLidas > 0 && (

                          <View style={styles.badge}>

                              <Text style={styles.badgeText}>
                                  {notificacoesNaoLidas}
                              </Text>

                          </View>

                      )}

                  </TouchableOpacity>
              </View>

              <NotificationModal
                  visible={modalVisivel}
                  onClose={() => setModalVisivel(false)}
                  alertas={alertas}
              />

              <Text style={styles.text}>Editar Informações</Text>
              
              <View style={styles.inputContainer}>

                  <TextInput
                      style={styles.input}
                      value={nome}
                      onChangeText={setNome}
                      placeholder="Nome"
                      placeholderTextColor="#888"
                  />

                  <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Email"
                      placeholderTextColor="#888"
                  />

                  <TextInput
                      style={styles.input}
                      value={senha}
                      onChangeText={setSenha}
                      secureTextEntry={true}
                      placeholder="Senha"
                      placeholderTextColor="#888"
                  />

                  <TextInput
                      style={styles.input}
                      value={confirmarSenha}
                      onChangeText={setConfirmarSenha}
                      secureTextEntry={true}
                      placeholder="Confirmar senha"
                      placeholderTextColor="#888"
                  />

                  <TouchableOpacity 
                      style={styles.btn_salvar}
                      activeOpacity={0.7}
                      onPress={salvarPerfil}
                  >
                      <Text style={styles.text_btn}>
                          Salvar alterações
                      </Text>
                  </TouchableOpacity>

              </View>

          </LinearGradient>

          {Platform.OS !== "web" && <BottomBar />}

      </View>

  );
}

const styles = StyleSheet.create({
  notificationButton: {
    position: "relative",
},

badge: {
    position: "absolute",
    right: -8,
    top: -8,
    backgroundColor: "#ef4444",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
},

badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
},
  mainContainer: {
    flex: 1,
  },
  btn_salvar:{
    width: '90%',
    height: 50,
    backgroundColor: '#6C5DD2',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    marginTop: 10
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#505050',
    width: '100%',
    paddingTop: 50, 
    paddingBottom: 20,
    paddingHorizontal: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  icones_header: {
    flexDirection: 'row',
    gap: 20,
  },
  text_header: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  text: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
    marginLeft: 20,
    marginBottom: 20
  },
  text_btn: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  inputContainer: {
    alignItems: 'center',
    width: '100%',
  },
  input: {
    width: '90%',
    height: 50,
    borderWidth: 1,
    borderColor: '#505050',
    borderRadius: 15,
    color: '#fff',
    paddingHorizontal: 15,
    backgroundColor: '#1A1D26', // Fundo levemente opaco para destacar do gradiente
    fontSize: 14,
    marginBottom: 20
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    height: '40%',
    backgroundColor: '#0C101A',
    borderWidth: 1,
    borderColor: '#505050',
    borderRadius: 15,
    marginTop: 100, 
    marginRight: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    padding: 15,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  notificacaoItem: {
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: '#161b26',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ca2020', 
    margin: 10,
    gap: 10,
  },
  notificacaoTexto: {
    color: '#fff',
    fontSize: 14,
  },
  notificacaoHora: {
    color: '#aaa',
    fontSize: 11,
    marginTop: 5,
  },
  triangleBorder: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,  
    borderRightWidth: 10, 
    borderBottomWidth: 15, 
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#505050', 
    position: 'absolute',
    top: -15, 
    right: 20, 
  },
  triangleInner: {
    width: 0,
    height: 0,
    borderLeftWidth: 9,   
    borderRightWidth: 9,  
    borderBottomWidth: 14, 
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#0C101A', 
    position: 'absolute',
    top: -14, 
    right: 21, 
    zIndex: 2,
  },
  icone_status_notificacoes: {
    width: 15,
    height: 15,
  }
});