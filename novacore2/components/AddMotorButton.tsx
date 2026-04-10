import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  onPress: () => void
}

export default function AddMotorButton({ onPress }: Props) {

  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>

      <View style={styles.content}>
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.text}>Cadastrar motor</Text>
      </View>

    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({

  button:{
    backgroundColor:"#6B5CCF",
    paddingHorizontal:20,
    height:42,
    borderRadius:10,
    justifyContent:"center",
    marginLeft:12
  },

  content:{
    flexDirection:"row",
    alignItems:"center"
  },

  text:{
    color:"#fff",
    fontWeight:"600",
    marginLeft:6
  }

});