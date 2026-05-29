import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Pressable
} from "react-native";

import { MaterialIcons } from "@expo/vector-icons";

type Alerta = {
    id_alerta: number
    nome_motor: string
    valor_detectado: number
    nivel_alerta: "alerta" | "erro"
    horario: string
}

type Props = {
    visible: boolean
    onClose: () => void
    alertas: Alerta[]
}

export default function NotificationModal({
    visible,
    onClose,
    alertas
}: Props) {

    return (

        <Modal
            visible={visible}
            transparent
            animationType="fade"
        >

            <View style={styles.overlay}>

                {/* FUNDO */}
                <TouchableOpacity
                    style={styles.fundo}
                    activeOpacity={1}
                    onPress={onClose}
                />

                {/* MODAL */}
                <View style={styles.modal}>

                    <Text style={styles.titulo}>
                        Notificações
                    </Text>

                    <View style={{ flex: 1 }}>

                        <FlatList
                            data={alertas}

                            keyExtractor={(item) =>
                                item.id_alerta.toString()
                            }

                            nestedScrollEnabled={true}

                            keyboardShouldPersistTaps="handled"

                            showsVerticalScrollIndicator={false}

                            contentContainerStyle={{
                                paddingBottom: 20
                            }}

                            renderItem={({ item }) => {

                                const cor =
                                    item.nivel_alerta === "erro"
                                        ? "#ff4d4d"
                                        : "#ffd000";

                                const icone =
                                    item.nivel_alerta === "erro"
                                        ? "dangerous"
                                        : "warning";

                                return (

                                    <View
                                        style={[
                                            styles.card,
                                            {
                                                borderColor: cor
                                            }
                                        ]}
                                    >

                                        <View style={styles.linha}>

                                            <MaterialIcons
                                                name={icone}
                                                size={18}
                                                color={cor}
                                            />

                                            <View style={{ flex: 1 }}>

                                                <Text style={styles.motor}>
                                                    {item.nome_motor}
                                                </Text>

                                                <Text style={styles.texto}>
                                                    Vibração elevada detectada:
                                                    {" "}
                                                    {Number(
                                                        item.valor_detectado
                                                    ).toFixed(1)}
                                                    {" "}
                                                    m/s²
                                                </Text>

                                            </View>

                                            <Text style={styles.hora}>
                                            {new Date(item.horario).toLocaleString(
                                                "pt-BR",
                                                {
                                                day: "2-digit",
                                                month: "2-digit",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                }
                                            ).replace(",", " - ")}
                                            </Text>

                                        </View>

                                    </View>

                                );

                            }}
                        />
                    </View>

                </View>

            </View>

        </Modal>

    );

}

const styles = StyleSheet.create({

    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-start",
        alignItems: "flex-end",
    },

    fundo: {
        position: "absolute",
        width: "100%",
        height: "100%",
    },

    modal: {
        width: 320,
        height: "80%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0C101A",
        borderWidth: 1,
        borderColor: "#505050",
        marginTop: 70,
        marginRight: 20,
        borderRadius: 12,
        padding: 15,
    },

    titulo: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
    },

    card: {
        borderWidth: 1.5,
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
        backgroundColor: "#111827",
    },

    linha: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
    },

    motor: {
        color: "#fff",
        fontWeight: "bold",
        marginBottom: 4,
    },

    texto: {
        color: "#d1d5db",
        fontSize: 13,
    },

    hora: {
        color: "#9ca3af",
        fontSize: 11,
    },

});