import { View, Text, StyleSheet, FlatList, Platform, Image, TouchableOpacity } from "react-native";
import { useEffect, useState, useRef } from "react";
import MotorCard from "../../components/MotorCard";
import SearchBar from "../../components/SearchBar";
import AddMotorButton from "../../components/AddMotorButton";
import AddMotorModal from "../../components/AddMotorModal";
import Sidebar from "../../components/sidebar";
import BottomBar from "../../components/BottomBar";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NotificationModal from "../../components/NotificationModal";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Motor = {
  id_motor: number
  nome_motor: string
  localizacao: string
  numero_polos: number
  rpm_nominal: number
  potencia_motor: number
  status: "ok" | "alerta" | "erro"
}

export default function Motores() {

  const insets = useSafeAreaInsets();

  const [motores, setMotores] = useState<Motor[]>([]);

  const [notificationVisible, setNotificationVisible] = useState(false);

  const [alertas, setAlertas] = useState([]);

  const [notificacoesNaoLidas, setNotificacoesNaoLidas] = useState(0);

  const ultimoIdAlerta = useRef<number | null>(null);

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
    } catch (error) {
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

  const handleEditar = (motor: Motor) => {
    setMotorSelecionado(motor);
    setModalVisible(true);
  };

  const buscarAlertas = async () => {
    try {
      const response = await fetch(
        "http://10.223.48.54:3000/alertas"
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

  useEffect(() => {

    buscarMotores();
    buscarAlertas();
    carregarNotificacoes();
    carregarUltimoId();

    const intervalo = setInterval(() => {

      buscarMotores();
      buscarAlertas();

    }, 2000);

    return () => clearInterval(intervalo);

  }, []);

 const buscarMotores = async () => {
  try {

    const response = await fetch("http://10.223.48.54:3000/motores");

    const data = await response.json();

    console.log("Motores recebidos:", data);

    setMotores(data);

  } catch (error) {
    console.log(error);
  }
};

  const renderMotor = ({ item }: { item: Motor }) => (
  <MotorCard
    nome={item.nome_motor}
    localizacao={item.localizacao}
    polos={item.numero_polos}
    rpm={item.rpm_nominal}
    kw={item.potencia_motor}
    status={item.status}
    onEditar={() => handleEditar(item)} // 👈 novo
  />
);

  const [modalVisible, setModalVisible] = useState(false);
  const [motorSelecionado, setMotorSelecionado] = useState<Motor | null>(null);

  const [busca, setBusca] = useState("");

  const motoresFiltrados = motores.filter((motor) =>
    motor.nome_motor.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <View style={styles.container}>

      {/* SIDEBAR (WEB) */}
      {Platform.OS === "web" && <Sidebar />}

      {/* CONTEÚDO */}
      <View style={[
        styles.conteudo,
        { paddingTop: insets.top + 20 } // 👈 AQUI
      ]}>
        
        <View style={styles.header}>

        <Text style={styles.titulo}>Motores</Text>

        <View style={styles.iconesHeader}>

            <TouchableOpacity
              style={styles.notificationButton}

              onPress={async () => {
                setNotificationVisible(true);
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

        </View>

        <View style={styles.divider} />

        <View style={styles.topBar}>
          <SearchBar 
            valor={busca}
            onChange={setBusca}
            />
          <AddMotorButton onPress={() => {
            setMotorSelecionado(null);
            setModalVisible(true);
          }} />
        </View>

        <AddMotorModal
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setMotorSelecionado(null); // limpa
          }}
          atualizarLista={buscarMotores}
          motorSelecionado={motorSelecionado}
        />

        <NotificationModal
          visible={notificationVisible}
          onClose={() =>
            setNotificationVisible(false)
          }
          alertas={alertas}
        />

        <FlatList
        data={motoresFiltrados} // 🔥 aqui muda
        keyExtractor={(item) => item.id_motor.toString()}
        renderItem={renderMotor}
        style={{ marginTop: 20 }}
        />

      </View>

      {/* BOTTOM BAR (MOBILE) */}
      {Platform.OS !== "web" && <BottomBar />}

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    flexDirection: Platform.OS === "web" ? "row" : "column",
  },

  conteudo: {
  flex: 1,
  backgroundColor: "#020617",
  paddingHorizontal: 20,
  paddingTop: 20, // base
},

  titulo: {
  color: "#fff",
  fontSize: 20,
  fontWeight: "bold",
},

  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 20,
  },
  divider: {
  height: 1,
  backgroundColor: "#505050", // roxo do seu app
  width: 1440, // linha menor (fica elegante)
  marginBottom: 20,
  borderRadius: 1,
  right:20,
},
header: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20,
},

iconesHeader: {
  flexDirection: "row",
  alignItems: "center",
  gap: 15, // se não funcionar no seu RN, use margin
},

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

});