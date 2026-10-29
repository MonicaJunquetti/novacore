import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDashboard } from "@/context/DashboardContext";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Mensagem = {
  id: string;
  texto: string;
  autor: "usuario" | "bot";
  horario: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function ChatModal({ visible, onClose }: Props) {
  const { plantaAtiva } = useDashboard();
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      id: "1",
      texto: "Olá! Como posso ajudar com o monitoramento dos motores desta planta?",
      autor: "bot",
      horario: "18:57",
    },
  ]);

  const listaRef = useRef<FlatList<Mensagem>>(null);

  useEffect(() => {
    if (visible && mensagens.length > 0) {
      const temporizador = setTimeout(() => {
        listaRef.current?.scrollToEnd({ animated: true });
      }, 250);
      return () => clearTimeout(temporizador);
    }
  }, [visible, mensagens]);

  const enviarMensagem = async () => {
    const texto = mensagem.trim();
    if (!texto || carregando) return;

    const agora = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const mensagemUsuario: Mensagem = {
      id: `${Date.now()}`,
      texto,
      autor: "usuario",
      horario: agora,
    };

    setMensagens((anteriores) => [...anteriores, mensagemUsuario]);
    setMensagem("");
    setCarregando(true);

    try {
      const respostaHttp = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mensagem: texto,
          dashboard_id: plantaAtiva?.id_dashboard || null,
        }),
      });

      const dados = await respostaHttp.json();

      if (!respostaHttp.ok) {
        throw new Error(dados.resposta || "Erro ao consultar o chatbot.");
      }

      const horarioResposta = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      setMensagens((anteriores) => [
        ...anteriores,
        {
          id: `${Date.now()}-bot`,
          texto: dados.resposta,
          autor: "bot",
          horario: horarioResposta,
        },
      ]);
    } catch (erro) {
      console.error("Erro no envio da mensagem:", erro);

      setMensagens((anteriores) => [
        ...anteriores,
        {
          id: `${Date.now()}-erro`,
          texto:
            "Não consegui me conectar ao chatbot. Verifique a conexão e tente novamente.",
          autor: "bot",
          horario: new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={styles.fundo} onPress={onClose} />

        <KeyboardAvoidingView
          style={styles.posicaoModal}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          <View style={styles.modal}>
            <View style={styles.cabecalho}>
              <Text style={styles.titulo}>Chat NovaCore</Text>
              <TouchableOpacity onPress={onClose} hitSlop={10}>
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <FlatList
              ref={listaRef}
              onContentSizeChange={() => {
                if (visible) {
                  listaRef.current?.scrollToEnd({ animated: false });
                }
              }}
              style={styles.lista}
              data={mensagens}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.conteudoLista}
              renderItem={({ item }) => {
                const enviada = item.autor === "usuario";

                return (
                  <View
                    style={[
                      styles.grupoMensagem,
                      enviada ? styles.mensagemEnviada : styles.mensagemRecebida,
                    ]}
                  >
                    {!enviada && (
                      <View style={styles.avatar}>
                        <Ionicons
                          name="chatbubble-ellipses"
                          size={14}
                          color="#FFFFFF"
                        />
                      </View>
                    )}

                    <View
                      style={[
                        styles.colunaMensagem,
                        enviada ? styles.colunaDireita : styles.colunaEsquerda,
                      ]}
                    >
                      <Text style={styles.horario}>{item.horario}</Text>

                      <View
                        style={[
                          styles.balao,
                          enviada ? styles.balaoEnviado : styles.balaoRecebido,
                        ]}
                      >
                        <Text style={styles.textoMensagem}>{item.texto}</Text>
                      </View>
                    </View>
                  </View>
                );
              }}
            />

            <View style={styles.areaEnvio}>
              <TextInput
                style={styles.input}
                value={mensagem}
                onChangeText={setMensagem}
                placeholder="Digite sua mensagem..."
                placeholderTextColor="#9CA3AF"
                multiline
                maxLength={2000}
                returnKeyType="send"
                onSubmitEditing={enviarMensagem}
              />

              <TouchableOpacity
                style={styles.botaoEnviar}
                onPress={enviarMensagem}
                disabled={carregando}
                activeOpacity={0.7}
              >
                <Ionicons name="send-outline" size={19} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  posicaoModal: {
    width: 330,
    maxWidth: "95%",
    height: "75%",
    maxHeight: "85%",
    marginTop: 85,
    marginRight: 15,
  },
  modal: {
    flex: 1,
    backgroundColor: "#0C101A",
    borderWidth: 1,
    borderColor: "#505050",
    borderRadius: 16,
    overflow: "hidden",
    padding: 15,
  },
  cabecalho: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#333842",
  },
  titulo: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  lista: {
    flex: 1,
  },
  conteudoLista: {
    paddingTop: 10,
    paddingBottom: 12,
    flexGrow: 1,
  },
  grupoMensagem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    marginBottom: 12,
  },
  mensagemRecebida: {
    justifyContent: "flex-start",
  },
  mensagemEnviada: {
    justifyContent: "flex-end",
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#6C5DD2",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
  },
  colunaMensagem: {
    maxWidth: "88%",
    flexShrink: 1,
  },
  colunaEsquerda: {
    alignItems: "flex-start",
  },
  colunaDireita: {
    alignItems: "flex-end",
  },
  horario: {
    color: "#9CA3AF",
    fontSize: 10,
    marginBottom: 3,
    marginHorizontal: 4,
  },
  balao: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 70,
  },
  balaoRecebido: {
    backgroundColor: "#1B1F2A",
    borderWidth: 1,
    borderColor: "#383D49",
    borderTopLeftRadius: 2,
  },
  balaoEnviado: {
    backgroundColor: "#6C5DD1",
    borderTopRightRadius: 2,
  },
  textoMensagem: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 18,
  },
  areaEnvio: {
    minHeight: 42,
    maxHeight: 100,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#191D27",
    borderWidth: 1,
    borderColor: "#383D49",
    borderRadius: 18,
    paddingLeft: 12,
    paddingRight: 8,
    marginTop: 5,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    paddingVertical: 8,
    maxHeight: 80,
    outlineStyle: "none",
  } as any,
  botaoEnviar: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
});