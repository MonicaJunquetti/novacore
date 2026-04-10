import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type Props = {
  telaAtiva: string;
};

const router = useRouter();

export default function Sidebar() {
  return (
    <View style={styles.sidebar}>
      
      <View style={styles.top}>
        <Image 
          source={require("../assets/images/logo.png")} 
          style={styles.logo} 
        />

        <TouchableOpacity 
          style={styles.item}
          onPress={() => router.push("/dashboard")}
        >
          <MaterialIcons name="dashboard" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.item}>
          <MaterialIcons name="my-location" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.item}>
          <MaterialIcons name="person" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 100,
    backgroundColor: "#020617",
    padding: 20,
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#505050",
    justifyContent: "space-between",
  },

  top: {
    alignItems: "center",
  },

  bottom: {
    alignItems: "center",
  },

  titulo: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 20,
    fontWeight: "bold",
  },

  
  logo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginBottom: 46,
    alignSelf: "center",
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 35,
  },

  texto: {
    color: "#fff",
    fontSize: 16,
  },

});