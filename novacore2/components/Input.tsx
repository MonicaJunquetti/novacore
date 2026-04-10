import { TextInput, StyleSheet } from "react-native";

type InputProps = {
  placeholder: string;
  secure?: boolean;
  value: string;                        // adiciona value
  onChangeText: (text: string) => void; // adiciona onChangeText
};

export default function Input({ placeholder, secure, value, onChangeText }: InputProps) {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#aaa"
      value={value}                 // ✅ agora está definido
      onChangeText={onChangeText}   // ✅ agora está definido
      secureTextEntry={secure}
      style={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: "90%",
    height: 50,
    backgroundColor: "#1A1D26",
    borderWidth: 1,
    borderColor: "#505050",
    borderRadius: 10,
    paddingHorizontal: 16,
    color: "#fff",
    marginBottom: 22,
  },
});