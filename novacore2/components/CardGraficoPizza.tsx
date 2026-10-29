import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { PieChart } from "react-native-chart-kit";

type DadosPorTipo = {
  temperatura: number;
  vibracao: number;
};

type CardGraficoPizzaProps = {
  titulo: string;
  dadosCriticos: DadosPorTipo;
  dadosAlertas: DadosPorTipo;
};

export function CardGraficoPizza({
  titulo,
  dadosCriticos,
  dadosAlertas,
}: CardGraficoPizzaProps) {
  const screenWidth = Dimensions.get("window").width;
  const [filtro, setFiltro] = useState<"CRITICO" | "ALERTA">("CRITICO");

  const dadosAtuais = filtro === "CRITICO" ? dadosCriticos : dadosAlertas;
  const total = dadosAtuais.temperatura + dadosAtuais.vibracao;

  const dataPie = [
    {
      name: "Temperatura",
      population: dadosAtuais.temperatura,
      color: "#af42ee",
    },
    {
      name: "Vibração",
      population: dadosAtuais.vibracao,
      color: "#520591",
    },
  ];

  return (
    <View style={styles.card_container}>
      <View style={styles.header}>
        <Text style={styles.text}>{titulo}</Text>

        <View style={styles.filtroContainer}>
          <TouchableOpacity
            style={[styles.btnFiltro, filtro === "CRITICO" && styles.btnFiltroAtivo]}
            onPress={() => setFiltro("CRITICO")}
          >
            <Text style={[styles.btnTexto, filtro === "CRITICO" && styles.btnTextoAtivo]}>
              Críticos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnFiltro, filtro === "ALERTA" && styles.btnFiltroAtivo]}
            onPress={() => setFiltro("ALERTA")}
          >
            <Text style={[styles.btnTexto, filtro === "ALERTA" && styles.btnTextoAtivo]}>
              Alertas
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {total > 0 ? (
        <View style={styles.contentRow}>
          {/* GRÁFICO ROSQUINHA */}
          <View style={styles.chartWrapper}>
            <PieChart
              data={dataPie}
              width={160}
              height={160}
              chartConfig={{
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              }}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"40"} // Alinha a rosquinha ao centro exato do box de 160px
              absolute
              hasLegend={false} // 👈 Oculta a legenda nativa e travada da biblioteca
            />

            {/* MIOLO DA ROSQUINHA */}
            <View style={styles.donutHole}>
              <Text style={styles.donutTotalNum}>{total}</Text>
              <Text style={styles.donutTotalLabel}>Total</Text>
            </View>
          </View>

          {/* LEGENDA CUSTOMIZADA (BEM PRÓXIMA E COMPACTA) */}
          <View style={styles.legendaCustomContainer}>
            {dataPie.map((item) => (
              <View key={item.name} style={styles.legendaItem}>
                <View style={[styles.bolinhaCor, { backgroundColor: item.color }]} />
                <Text style={styles.legendaTexto}>
                  {item.name}: <Text style={styles.legendaVal}>{item.population}</Text>
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Sem transições para {filtro === "CRITICO" ? "crítico" : "alerta"}.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card_container: {
    width: "100%",
    paddingBottom: 15,
    borderRadius: 12,
    backgroundColor: '#1A1D26',
    alignItems: "center",
    marginVertical: 10,
    alignSelf: "center",
    borderColor: "#505050",
    borderWidth: 1,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginTop: 15,
  },
  text: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  filtroContainer: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    borderRadius: 8,
    padding: 2,
  },
  btnFiltro: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  btnFiltroAtivo: {
    backgroundColor: "#3b82f6",
  },
  btnTexto: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "bold",
  },
  btnTextoAtivo: {
    color: "#ffffff",
  },
  
  /* CONTAINER LADO A LADO DO GRÁFICO E DA LEGENDA */
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 10,
  },
  
  /* ROSQUINHA */
  chartWrapper: {
    position: "relative",
    width: 160,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
  },
  donutHole: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#1A1D26",
    justifyContent: "center",
    alignItems: "center",
  },
  donutTotalNum: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  donutTotalLabel: {
    color: "#94a3b8",
    fontSize: 10,
  },

  /* LEGENDAS CUSTOMIZADAS */
  legendaCustomContainer: {
    justifyContent: "center",
    gap: 6, // 👈 Ajusta o espaçamento vertical entre as legendas (mais perto ou distante)
    marginLeft: 10, // 👈 Ajusta a distância entre a rosquinha e as legendas
  },
  legendaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6, // Espaço entre a bolinha colorida e o texto
  },
  bolinhaCor: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendaTexto: {
    color: "#aaaaaa",
    fontSize: 12,
  },
  legendaVal: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  emptyContainer: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#64748b",
    fontSize: 13,
  },
});