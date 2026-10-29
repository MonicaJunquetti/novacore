import React, { useState, useEffect } from "react";
import { CardKPI } from "./CardKPI";
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { CardGraficoPizza } from "./CardGraficoPizza";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Motor = {
  id_motor: number;
  nome_motor: string;
  localizacao: string;
  numero_polos: number;
  rpm_nominal: number;
  potencia_motor: number;
  status: "ok" | "alerta" | "erro";
};

type Alerta = {
  id_alerta: number;
  fk_motor: number;
  fk_sensor: number;
  tipo_alerta: string;
  valor_detectado: number;
  horario: string;
  nivel_alerta: string;
};

type StatusMotor = {
  fk_motor: number;
  id_status: number;
  estado: string;
  valor_temp: number;
  ultima_atualizacao: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  motor: Motor | null;
};

// --- FUNÇÕES UTILITÁRIAS (FORA DO COMPONENTE) ---

const normalizarEstado = (estado: string) => {
  if (!estado) return "NORMAL";
  const limpo = estado.trim().toUpperCase();
  if (limpo === "CRÍTICO" || limpo === "CRITICO" || limpo === "ERRO") return "CRITICO";
  if (limpo === "ALERTA") return "ALERTA";
  return "OK";
};

export const formatarTempo = (msTotal: number): string => {
  if (msTotal <= 0 || isNaN(msTotal)) return "0m";

  const segundosTotais = Math.floor(msTotal / 1000);
  const horas = Math.floor(segundosTotais / 3600);
  const minutos = Math.floor((segundosTotais % 3600) / 60);
  const segundos = segundosTotais % 60;

  if (horas > 0) return `${horas}h ${minutos}m`;
  if (minutos > 0) return `${minutos}m ${segundos}s`;
  return `${segundos}s`;
};

export const calcularTempoEmEstado = (
  lista: Alerta[],
  nivelAlvo: "CRITICO" | "ALERTA",
  tipoSensorFiltro?: "TEMPERATURA" | "VIBRACAO"
): number => {
  let alertasFiltrados = lista;

  if (tipoSensorFiltro) {
    alertasFiltrados = lista.filter((a) => {
      const tipo = a.tipo_alerta ? a.tipo_alerta.trim().toUpperCase() : "";
      if (tipoSensorFiltro === "TEMPERATURA") return tipo.includes("TEMP");
      return tipo.includes("VIB");
    });
  }

  // Descarta datas inválidas como '0000-00-00' ou strings quebradas
  const alertasValidos = alertasFiltrados
    .filter((a) => {
      const timestamp = new Date(a.horario).getTime();
      return !isNaN(timestamp) && timestamp > 0;
    })
    .sort(
      (a, b) => new Date(a.horario).getTime() - new Date(b.horario).getTime()
    );

  let tempoTotalMs = 0;
  let inicioEstadoAlvo: number | null = null;

  for (let i = 0; i < alertasValidos.length; i++) {
    const itemAtual = alertasValidos[i];
    const nivelAtual = normalizarEstado(itemAtual.nivel_alerta);
    const horaAtualMs = new Date(itemAtual.horario).getTime();

    if (nivelAtual === nivelAlvo && inicioEstadoAlvo === null) {
      inicioEstadoAlvo = horaAtualMs;
    } else if (nivelAtual !== nivelAlvo && inicioEstadoAlvo !== null) {
      tempoTotalMs += horaAtualMs - inicioEstadoAlvo;
      inicioEstadoAlvo = null;
    }
  }

  // Se o último alerta do histórico ainda for do estado alvo, calcula a duração até agora
  if (inicioEstadoAlvo !== null) {
    const agoraMs = new Date().getTime();
    tempoTotalMs += agoraMs - inicioEstadoAlvo;
  }

  return tempoTotalMs;
};

// --- COMPONENTE PRINCIPAL ---

export default function MotorDetailsModal({ visible, onClose, motor }: Props) {
  const [totalCritico, setTotalCritico] = useState<number>(0);
  const [totalAlerta, setTotalAlerta] = useState<number>(0);
  const [tempoEmFalhaText, setTempoEmFalhaText] = useState<string>("0m");
  const [tempoEmAlertaText, setTempoEmAlertaText] = useState<string>("0m");

  const [criticosPorTipo, setCriticosPorTipo] = useState({ temperatura: 0, vibracao: 0 });
  const [alertasPorTipo, setAlertasPorTipo] = useState({ temperatura: 0, vibracao: 0 });

  useEffect(() => {
    if (!visible || !motor) return;

    const carregarDadosEMetricas = async () => {
      try {
        const [resAlertas, resStatus] = await Promise.all([
          fetch(`${API_URL}/alertas`),
          fetch(`${API_URL}/motores`),
        ]);

        const alertas: Alerta[] = await resAlertas.json();
        const listaStatus: StatusMotor[] = await resStatus.json();

        // 1. Estado atual do motor na tb_status_motor
        const statusAtualObj = listaStatus.find(
          (s) => Number(s.fk_motor) === Number(motor.id_motor)
        );
        const estadoAtual = statusAtualObj
          ? normalizarEstado(statusAtualObj.estado)
          : "OK";

        // 2. Filtra os alertas deste motor
        const alertasMotor = alertas.filter(
          (a) => Number(a.fk_motor) === Number(motor.id_motor)
        );

        // --- CÁLCULO TOTAL DE OCORRÊNCIAS/MUDANÇAS (KPIs) ---
        const alertasOrdenados = [...alertasMotor].sort(
          (a, b) => new Date(a.horario).getTime() - new Date(b.horario).getTime()
        );

        let contCritico = 0;
        let emFalhaCritica = false;
        for (const item of alertasOrdenados) {
          const nivel = normalizarEstado(item.nivel_alerta);
          if (nivel === "CRITICO" && !emFalhaCritica) {
            contCritico += 1;
            emFalhaCritica = true;
          } else if (nivel !== "CRITICO") {
            emFalhaCritica = false;
          }
        }
        if (estadoAtual === "CRITICO" && !emFalhaCritica) contCritico += 1;
        setTotalCritico(contCritico);

        let contAlerta = 0;
        let emAlerta = false;
        for (const item of alertasOrdenados) {
          const nivel = normalizarEstado(item.nivel_alerta);
          if (nivel === "ALERTA" && !emAlerta) {
            contAlerta += 1;
            emAlerta = true;
          } else if (nivel !== "ALERTA") {
            emAlerta = false;
          }
        }
        if (estadoAtual === "ALERTA" && !emAlerta) contAlerta += 1;
        setTotalAlerta(contAlerta);

        // --- CÁLCULO DO TEMPO EM CADA ESTADO (KPIs de Duração) ---
        const msCritico = calcularTempoEmEstado(alertasMotor, "CRITICO");
        const msAlerta = calcularTempoEmEstado(alertasMotor, "ALERTA");

        setTempoEmFalhaText(formatarTempo(msCritico));
        setTempoEmAlertaText(formatarTempo(msAlerta));

        // --- CÁLCULO POR TIPO DE SENSOR (Gráfico de Pizza) ---
        const alertasTemp = alertasMotor.filter((a) => {
          const tipo = a.tipo_alerta ? a.tipo_alerta.trim().toUpperCase() : "";
          return tipo.includes("TEMP");
        });

        const alertasVib = alertasMotor.filter((a) => {
          const tipo = a.tipo_alerta ? a.tipo_alerta.trim().toUpperCase() : "";
          return tipo.includes("VIB") || tipo.includes("VIBRACAO") || tipo.includes("VIBRAÇÃO");
        });

        const calcularTransicoes = (lista: Alerta[], nivelAlvo: "CRITICO" | "ALERTA") => {
          lista.sort(
            (a, b) => new Date(a.horario).getTime() - new Date(b.horario).getTime()
          );

          let contador = 0;
          let ultimoEstado: string | null = null;

          for (const item of lista) {
            const nivelAtual = normalizarEstado(item.nivel_alerta);
            if (nivelAtual === nivelAlvo && ultimoEstado !== nivelAlvo) {
              contador += 1;
            }
            ultimoEstado = nivelAtual;
          }
          return contador;
        };

        const criticoTemp = calcularTransicoes(alertasTemp, "CRITICO");
        const alertaTemp = calcularTransicoes(alertasTemp, "ALERTA");
        const criticoVib = calcularTransicoes(alertasVib, "CRITICO");
        const alertaVib = calcularTransicoes(alertasVib, "ALERTA");

        setCriticosPorTipo({ temperatura: criticoTemp, vibracao: criticoVib });
        setAlertasPorTipo({ temperatura: alertaTemp, vibracao: alertaVib });

      } catch (error) {
        console.log("Erro ao carregar dados do modal:", error);
      }
    };

    carregarDadosEMetricas();
  }, [visible, motor]);

  if (!motor) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* BOTÃO FECHAR */}
          <TouchableOpacity style={styles.botaoFechar} onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* CABEÇALHO */}
            <View style={styles.cabecalho}>
              <Text style={styles.titulo}>{motor.nome_motor}</Text>
            </View>
            

            <View style={styles.divider} />

            <View style={styles.containterIndicadores}> 
              <View style={styles.LIndicadores}>
                <CardKPI
                  label="Tempo em crítico"
                  icon={require("../assets/images/icone_critico.png")}
                  data={tempoEmFalhaText}
                />
                <CardKPI
                  label="Tempo em alerta"
                  icon={require("../assets/images/icone_alerta.png")}
                  data={tempoEmAlertaText}
                />
              </View>
            </View>


            {/* GRÁFICO DE PIZZA */}
            <View style={{ marginTop: 5 }}>
              <CardGraficoPizza
                titulo="Ocorrências por estado"
                dadosCriticos={criticosPorTipo}
                dadosAlertas={alertasPorTipo}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(13, 14, 15, 0.83)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "95%",
    maxHeight: "95%",
    backgroundColor: "#0C101A",
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: "#505050",
  },
  cabecalho: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  botaoFechar: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 1,
  },
  titulo: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "medium",
  },
  subtitulo: {
    color: "#94a3b8",
    fontSize: 16,
    marginTop: 10,
    marginRight: 30
  },
  divider: {
    height: 1,
    backgroundColor: "#50505050",
    marginVertical: 8,
  },
  placeholderContainer: {
    alignItems: "center",
    justifyContent: "space-evenly",
    marginTop: 10,
    flex: 1,
    flexDirection: "row",
  },
  containterIndicadores: {
    gap: 8,
    marginTop: 5,
  },
  LIndicadores: {
    display: "flex",
    flexDirection: "row",
    gap: 10
  }
});