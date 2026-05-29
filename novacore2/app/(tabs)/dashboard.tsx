import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions, TouchableOpacity, Modal, Image } from 'react-native';
import { CardStatus } from '@/components/CardStatus';
import { CardGrafico } from '@/components/CardGraficoHistograma';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BotaoFiltro } from '@/components/BotaoFiltro';
import MotorCardAlert from '@/components/CardMotorAlerta';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import BottomBar from "../../components/BottomBar";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NotificationModal from "../../components/NotificationModal";
import { useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  // ==========================================
  // ESTADOS
  // ==========================================
  const [filtroSelecionado, setFiltroSelecionado] = useState('Dia');
  const [modalVisivel, setModalVisivel] = useState(false);
  
  // Estado para armazenar os dados vindos do Backend
  const [dadosTemperatura, setDadosTemperatura] = useState([
    { label: "Motor 1", dados: [0], cor: "#ca2020" }
  ]);

  const filtros = ['Hora', 'Dia', 'Semana'];

  // ==========================================
  // FUNÇÃO DE BUSCA (BACKEND)
  // ==========================================
  const buscarDadosDoServidor = async () => {
    try {
      console.log("Tentando conectar ao servidor..."); // LOG 1
      const response = await fetch('http://192.168.0.146:3000/sensor_temp/ultimos');
      const json = await response.json();

      console.log("Dados recebidos do banco:", json); // LOG 2 - IMPORTANTE

      if (json && json.length > 0) {
        const valoresFormatados = json.map((item: any) => Number(item.valor)).reverse();
        console.log("Valores processados para o gráfico:", valoresFormatados); // LOG 3
        
        setDadosTemperatura([
          { 
            label: "Motor 1", 
            dados: valoresFormatados, 
            cor: "#ca2020" 
          }
        ]);
      } else {
        console.log("O banco retornou um array vazio [].");
      }
    } catch (error) {
      console.log("ERRO NA BUSCA:", error);
    }
  };

  const carregarNotificacoes = async () => {
    try {
      const valorSalvo =
        await AsyncStorage.getItem(
          "notificacoesNaoLidas"
        );
      if (valorSalvo) {
        setNotificacoesNaoLidas(
          Number(valorSalvo)
        );
      }
    }
    catch (error) {
      console.log(error);
    }
  };

  const insets = useSafeAreaInsets();

  const [alertas, setAlertas] = useState([]);

  const [notificacoesNaoLidas, setNotificacoesNaoLidas] =
    useState(0);

  const ultimoIdAlerta =
    useRef<number | null>(null);

  const carregarUltimoId = async () => {
    try {
      const valor =
        await AsyncStorage.getItem(
          "ultimoIdAlerta"
        );
      if (valor) {
        ultimoIdAlerta.current =
          Number(valor);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const buscarAlertas = async () => {
    try {
      const response = await fetch(
        "http://192.168.0.146:3000/alertas"
      );
      const data = await response.json();
      setAlertas(data);
      if (!data || data.length === 0) return;
      // pega maior ID
      const maiorId = Math.max(
        ...data.map((item: any) => item.id_alerta)
      );
      // PRIMEIRA EXECUÇÃO
      if (ultimoIdAlerta.current === null) {
        // tenta recuperar último ID salvo
        const ultimoIdSalvo =
          await AsyncStorage.getItem(
            "ultimoIdAlerta"
          );
        if (ultimoIdSalvo) {
          ultimoIdAlerta.current =
            Number(ultimoIdSalvo);
        } else {
          ultimoIdAlerta.current = maiorId;
          await AsyncStorage.setItem(
            "ultimoIdAlerta",
            maiorId.toString()
          );
        }
        return;
      }
      // chegou alerta novo
      if (maiorId > ultimoIdAlerta.current) {
        setNotificacoesNaoLidas((prev) => {
          const novoValor = prev + 1;
          AsyncStorage.setItem(
            "notificacoesNaoLidas",
            novoValor.toString()
          );
          return novoValor;
        });
        ultimoIdAlerta.current = maiorId;
        await AsyncStorage.setItem(
          "ultimoIdAlerta",
          maiorId.toString()
        );
      }
    } catch (error) {
      console.log(
        "Erro ao buscar alertas:",
        error
      );
    }
  };

  // Ciclo de vida: Busca os dados ao abrir e atualiza a cada 5 segundos
  useEffect(() => {
    carregarNotificacoes();
    carregarUltimoId();
    buscarAlertas();
    const intervalo = setInterval(() => {
      buscarAlertas();
    }, 2000);
    return () => clearInterval(intervalo);
  }, []);

  return (

  <View style={styles.containerPrincipal}>

    {/* HEADER FIXO */}
    <View
      style={[
        styles.header,
        { paddingTop: insets.top + 15 }
      ]}
    >

      <Text style={styles.text_header}>
        Dashboard
      </Text>

      <View style={styles.icons_header}>

        <TouchableOpacity
          style={styles.notificationButton}
          onPress={async () => {
          setModalVisivel(true);
          setNotificacoesNaoLidas(0);
          await AsyncStorage.setItem(
            "notificacoesNaoLidas",
            "0"
          );
        }}
        >
          <MaterialIcons
            name="notifications"
            size={22}
            color="#fff"
          />
          {notificacoesNaoLidas > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {notificacoesNaoLidas}
              </Text>
            </View>
          )}

        </TouchableOpacity>

      </View>

    </View>

    {/* CONTEÚDO SCROLLÁVEL */}
    <ScrollView
      style={styles.mainScroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >

      {/* FILTROS */}
      <View style={styles.container_filtros}>
        {filtros.map((item) => (
          <BotaoFiltro
            key={item}
            label={item}
            isSelected={filtroSelecionado === item}
            onPress={() => setFiltroSelecionado(item)}
            style={styles.buttonFiltroTempo}
          />
        ))}
      </View>

      {/* CARDS */}
      <View style={styles.statusRow}>
        <CardStatus
          label="Normal"
          icon={require('../../assets/images/icone_normal.png')}
          data={1}
        />

        <CardStatus
          label="Alerta"
          icon={require('../../assets/images/icone_alerta.png')}
          data={0}
        />

        <CardStatus
          label="Crítico"
          icon={require('../../assets/images/icone_critico.png')}
          data={0}
        />
      </View>

      {/* GRÁFICOS */}
      <CardGrafico
        titulo="Temperatura (°C)"
        linhas={dadosTemperatura}
      />

      <CardGrafico
        titulo="Vibração (m/s²) - Simulado"
        linhas={[
          {
            label: "Motor 1",
            dados: [10, 12, 11, 13, 10],
            cor: "#2055ca"
          }
        ]}
      />

      {/* ALERTAS */}
      <View style={styles.container_alerta_motores}>

        <Text style={styles.text_alertas}>
          Alertas ativos
        </Text>

        <MotorCardAlert
          status="critico"
          nome="MTR-001"
          localizacao_bancada="Bancada 1"
          localizacao_setor="Setor A"
        />

        <MotorCardAlert
          status="ok"
          nome="MTR-001"
          localizacao_bancada="Bancada 1"
          localizacao_setor="Setor A"
        />

      </View>

    </ScrollView>

    <NotificationModal
      visible={modalVisivel}
      onClose={() => setModalVisivel(false)}
      alertas={alertas}
    />

    {/* BOTTOM BAR */}
    {Platform.OS !== "web" && <BottomBar />}

  </View>
);
}

// ==========================================
// ESTILOS
// ==========================================
const styles = StyleSheet.create({

  mainScroll: {
    flex: 1,
    backgroundColor: '#000510',
  },

  containerPrincipal: {
  flex: 1,
  backgroundColor: "#000510",
},

scrollContent: {
  alignItems: "center",
  
},

  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#505050',
    width: '100%',
    paddingTop: 35,
    paddingBottom: 20,
    paddingHorizontal: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  icones_header: {
    flexDirection: 'row',
  },

  text_header: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },

  container_filtros: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 25,
    marginLeft: 10,
    width: '92%',
    justifyContent: 'flex-start',
  },

  buttonFiltroTempo: {
    width: 80,
    height: 40,
    borderRadius: 18,
  },

  statusRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    width: '92%',
    justifyContent: 'center'
  },

  container_alerta_motores:{
  width: '91%',
  borderRadius: 24,
  backgroundColor: '#050B18',
  borderColor: '#505050',
  borderWidth: 1,
  paddingBottom: 15,
  marginTop: 12,
  marginBottom: 30,
},

  text_alertas:{
  color: '#fff',
  fontSize: 18,
  fontWeight: 'bold',
  alignSelf: 'flex-start',
  marginLeft: 20,
  marginTop: 25,
  marginBottom: 20
},

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },

  modalContent: {
    width: '96%',
    height: '92.5%',
    backgroundColor: '#0C101A',
    borderWidth: 1,
    borderColor: '#505050',
    borderTopLeftRadius: 15,
    flexDirection: "column",
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 10,
    padding: 15,
    width: '100%'
  },

  modalTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 5
  },

  notificacaoItem: {
    flexDirection: 'row',
    alignItems: 'center', // Alinha verticalmente no centro
    backgroundColor: '#161b26',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ca2020',
    margin: 10,
    gap: 10, // Espaço entre a imagem e o texto

  },

  badge: {
  position: "absolute",
  right: -8,
  top: -8,
  backgroundColor: "#ef4444",
  width: 20,
  height: 20,
  borderRadius: 10,
  justifyContent: "center",
  alignItems: "center",
},

badgeText: {
  color: "#fff",
  fontSize: 11,
  fontWeight: "bold",
},

  notificacaoTexto: {
    color: '#fff',
    fontSize: 14,
  },

  notificationButton: {
    position: "relative",
  },

  notificacaoHora: {
    color: '#aaa',
    fontSize: 11,
    marginTop: 5,
  },

  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 15,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    position: 'absolute',
    top: -15,
    right: 25,
  },

  triangleBorder: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,  
    borderRightWidth: 10,
    borderBottomWidth: 15,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#505050',
    position: 'absolute',
    top: -15,
    right: 20,
    zIndex: 1,

  },

  triangleInner: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 9,   // 1px menor que o de trás
    borderRightWidth: 9,  // 1px menor que o de trás
    borderBottomWidth: 14, // 1px menor que o de trás
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#0C101A', // COR DO FUNDO DO MODAL
    position: 'absolute',
    top: -14, // 1px abaixo do triângulo de borda
    right: 21, // Centralizado (20 + 1px de diferença da borda)
    zIndex: 2, // Fica na frente

  },

  icone_status_notificacoes:{
    width: 15,
    height: 15,
    marginTop: -20,
    marginLeft: 30

  },

  icons_header:{
    display: "flex",
    flexDirection: "row",
    gap: 20
  }


});