import { View, Text, StyleSheet, FlatList, Platform, Image, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import MotorCard from "../../components/MotorCard";
import SearchBar from "../../components/SearchBar";
import AddMotorButton from "../../components/AddMotorButton";
import AddMotorModal from "../../components/AddMotorModal";
import Sidebar from "../../components/sidebar";
import BottomBar from "../../components/BottomBar";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Motor = {
  id_motor: number
  nome_motor: string
  localizacao: string
  numero_polos: number
  rpm_nominal: number
  potencia_motor: number
}

export default function Motores() {

  const insets = useSafeAreaInsets();

  const [motores, setMotores] = useState<Motor[]>([]);

  const handleEditar = (motor: Motor) => {
    setMotorSelecionado(motor);
    setModalVisible(true);
  };

  useEffect(() => {
    buscarMotores();
  }, []);

 const buscarMotores = async () => {
  try {

    const response = await fetch("http://192.168.0.146:3000/motores");

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
    status="ok"
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
            
            <TouchableOpacity>
            <MaterialIcons name="wb-sunny" size={22} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity>
            <MaterialIcons name="chat" size={22} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity>
            <MaterialIcons name="notifications" size={22} color="#fff" />
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
    marginBottom: 20
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
},

iconesHeader: {
  flexDirection: "row",
  alignItems: "center",
  gap: 15, // se não funcionar no seu RN, use margin
},

});