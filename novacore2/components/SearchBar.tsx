import { View, TextInput, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  valor: string;
  onChange: (text: string) => void;
};

export default function SearchBar({ valor, onChange }: Props) {
  return (
    <View style={styles.container}>

      <Ionicons name="search" size={18} color="#6b7280" />

      <TextInput
        placeholder="Pesquisar"
        placeholderTextColor="#6b7280"
        style={styles.input}
        value={valor}
        onChangeText={onChange}
      />

    </View>
  );
}

const styles = StyleSheet.create({

  container:{
    flexDirection:"row",
    alignItems:"center",
    backgroundColor:"#020617",
    
    paddingHorizontal:14,
    width:160,

    borderWidth: 1,              // 🔥 CORRETO
    borderColor:"#505050",
    borderRadius:10,
    height: 40,
  },

  input:{
    color:"#fff",
    marginLeft:8,
    flex:1,

   outlineStyle: "none" as any,
},

});