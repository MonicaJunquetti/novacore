import { TouchableOpacity, Text, StyleSheet } from "react-native";

type BotaoFiltroProps = {
    label: string;
    onPress: () => void;
    isSelected?: boolean;
    style?: any
};

export function BotaoFiltro({ label, onPress, isSelected, style }: BotaoFiltroProps) {
    return (
        <TouchableOpacity 
            style={[
                styles.button, 
                isSelected && styles.selectedButton, 
                style 
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={[
                styles.text,
                isSelected && styles.selectedText
                
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button:{
        borderRadius: 0,
        backgroundColor: '#0C101A',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 3,
        borderColor: '#505050', 
        borderWidth: 0.5
    },
    selectedButton:{
        backgroundColor: '#6B5CCF',
        borderColor: '#6B5CCF', 
    },
    text:{
        color: '#ffff',
        fontSize: 14,
        fontWeight: '600',
    },
    selectedText: {
        color: '#ffffff',
    }
});