import React from 'react';
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";

type DadosLinha = {
    dados: number[];
    cor: string;
    label: string;
};

type CardGraficoProps = {
    titulo: string;
    linhas: DadosLinha[];
};

export function CardGrafico({ titulo, linhas }: CardGraficoProps) {
    const screenWidth = Dimensions.get("window").width;
    const screenHeight = Dimensions.get("window").height;

    // Removemos a propriedade 'legend' daqui para desativar a legenda nativa no topo
    const data = {
        labels: linhas[0]?.dados.map((_, index) => `${index + 1}`) || [],
        datasets: linhas.map(linha => ({
            data: linha.dados,
            color: (opacity = 1) => linha.cor,
            strokeWidth: 2
        })),
    };

    return (
        <View style={styles.card_container}>
            <Text style={styles.text}>{titulo}</Text>
            
            <LineChart
                data={data}
                width={screenWidth * 0.98} // Ajustado para não vazar do card
                height={screenHeight * 0.30} // Reduzido para dar espaço à legenda embaixo
                bezier
                withInnerLines={false}
                withOuterLines={false}
                withVerticalLines={false}
                withHorizontalLines={false}
                chartConfig={{
                    backgroundColor: "transparent",
                    backgroundGradientFrom: "white",
                    backgroundGradientTo: "white",
                    backgroundGradientFromOpacity: 0,
                    backgroundGradientToOpacity: 0,
                    decimalPlaces: 0,
                    labelColor: (opacity = 1) => `rgba(170, 170, 170, ${opacity})`,
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    propsForDots: {
                        r: "3",
                    }
                }}
                style={{
                    marginTop: 30, 
                    backgroundColor: "transparent"
                }}
            />

            {/* LEGENDA CUSTOMIZADA EMBAIXO */}
            <View style={styles.legendContainer}>
                {linhas.map((linha, index) => (
                    <View key={index} style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: linha.cor }]} />
                        <Text style={styles.legendText}>{linha.label}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card_container: {
        width: '91%',
        height: '27%', 
        paddingBottom: 10,
        borderRadius: 12,
        backgroundColor: '#0C101A',
        alignItems: 'center',
        marginVertical: 10,
        alignSelf: 'center',
        borderColor: '#505050',
        borderWidth: 1,
    },
    text: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        alignSelf: 'flex-start',
        marginLeft: 20,
        marginTop: 15
    },
    legendContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 10,
        width: '100%',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
        marginTop: 5
    },
    legendColor: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 5,
    },
    legendText: {
        color: '#aaaaaa',
        fontSize: 11,
    },
});