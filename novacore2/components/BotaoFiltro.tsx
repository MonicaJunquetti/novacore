import { TouchableOpacity, Text, StyleSheet } from "react-native";

type BotaoFiltroProps = {
  label: string;
  onPress: () => void;
  isSelected?: boolean;
  style?: any;
};


export function BotaoFiltro({ label, isSelected, onPress, style }: BotaoFiltroProps) {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      // Corrigido: Agora aponta para os nomes certos (button e selectedButton)
      style={[styles.button, isSelected && styles.selectedButton, style]} 
    >
      {/* Corrigido: Aponta para styles.text */}
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 18, 
    backgroundColor: '#0C101A',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 3,
    borderColor: '#505050', 
    borderWidth: 0.5
  },
  selectedButton: {
    backgroundColor: '#6B5CCF', 
    borderColor: '#6B5CCF', 
  },
  text: {
    color: '#ffffff', 
    fontSize: 13,
    fontWeight: '600',
  }
});