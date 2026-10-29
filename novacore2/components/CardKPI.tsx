import { Image } from "expo-image";
import { View, Text, StyleSheet } from "react-native";

type CardStatusProps = {
    label: string;
    icon: any;
    data: number | string;
};

export function CardKPI({ label, icon, data }: CardStatusProps) {
    return (
        <View style={styles.card_container}>
            <View style={styles.headerRow}>
                <Image source={icon} style={styles.icone_status} /> 
                <Text style={styles.text}>{label}</Text>
            </View>
            <Text style={styles.numero}>{data}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card_container: {
        width: "48%",
        height: 105,
        borderRadius: 10,
        backgroundColor: '#1A1D26',
        justifyContent: 'center',
        padding:10,
        borderWidth: 1,
        borderColor: "#505050"
    },
    headerRow: {
        flexDirection: "row",
        alignItems: 'center',
        marginBottom: 20,
        marginTop: -8
    },
    icone_status: {
        width: 14,
        height: 14,
        marginRight: 4,
    },
    numero: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '600',
        lineHeight: 25,
    },
    text: {
        color: '#fff',
        fontSize: 14,
        
    },
});