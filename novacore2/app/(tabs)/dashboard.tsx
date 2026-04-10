import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions, TouchableOpacity, Modal } from 'react-native';
import { CardStatus } from '@/components/CardStatus';
import { CardGrafico } from '@/components/CardGraficoHistograma';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BotaoFiltro } from '@/components/BotaoFiltro';
import MotorCardAlert from '@/components/CardMotorAlerta';

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  // 1. Estado para controlar o filtro selecionado
  const [filtroSelecionado, setFiltroSelecionado] = useState('Dia');
  const [modalVisivel, setModalVisivel] = useState(false);

  // Opções de filtro
  const filtros = ['Hora', 'Dia', 'Semana'];

  // Dados mockados para o gráfico
  const dadosParaExibir = [
    { label: "Motor 1", dados: [40, 50, 45, 80, 90, 60], cor: "#ca2020" },
    { label: "Motor 2", dados: [30, 35, 40, 38, 90, 50], cor: "#20ca4d" },
    { label: "Motor 3", dados: [10, 20, 15, 25, 90, 30], cor: "#2055ca" },
    { label: "Motor 4", dados: [0, 50, 75, 95, 100, 130], cor: "#2055ca" },
    { label: "Motor 5", dados: [0, 50, 75, 95, 100, 130], cor: "#ca2075" }
  ];

  return (
    <ScrollView 
      style={styles.mainScroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      
      <View style={styles.header}> 
        <Text style={styles.text_header}>Dashboard</Text>

       <TouchableOpacity 
          style={styles.icones_header} 
          onPress={() => setModalVisivel(!modalVisivel)} // Agora ele abre E fecha
          activeOpacity={0.7}
        >
          <Ionicons 
            name={modalVisivel ? "notifications" : "notifications-outline"} 
            size={20} 
            color="white" 
          />
        </TouchableOpacity>
      </View>

      <Modal
          animationType="fade" 
          transparent={true}
          visible={modalVisivel}
          onRequestClose={() => setModalVisivel(false)} 
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.triangleBorder} />
              <View style={styles.triangleInner} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Notificações</Text>
                <TouchableOpacity onPress={() => setModalVisivel(false)}>
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>

              <View style={styles.notificacaoItem}>
                <Text style={styles.notificacaoTexto}>Motor A atingiu 90°C!</Text>
                <Text style={styles.notificacaoHora}>Agora</Text>
              </View>
              
            </View>
          </View>
        </Modal>

      
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

     
      <View style={styles.statusRow}>
        <CardStatus 
          label="Normal" 
          icon={require('../../assets/images/icone_normal.png')} 
          data={0} 
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
      
      
      <CardGrafico
        titulo="Temperatura (°C)" 
        linhas={dadosParaExibir} 
      />
      
      <CardGrafico
        titulo="Vibração (mm/s)" 
        linhas={dadosParaExibir} 
      />
      
      <View style={styles.container_alerta_motores}>
        <Text style={styles.text_alertas}>Alertas ativos</Text>
        <MotorCardAlert status='ok' nome="Motor A" localizacao_bancada= "Bancada 1" localizacao_setor="Setor A" />
        <MotorCardAlert status='alerta' nome="Motor B" localizacao_bancada= "Bancada 1" localizacao_setor="Setor A" />
        <MotorCardAlert status='ooo' nome="Motor C" localizacao_bancada= "Bancada 1" localizacao_setor="Setor A" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mainScroll: {
    flex: 1,
    backgroundColor: '#000510',
  },
  container: {
    alignItems: 'center',
    paddingBottom: 40, 
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
    marginBottom: 30,
  },
  icones_header: {
    flexDirection: 'row',
    gap: 20,
  },
  text_header: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  container_filtros: {
    flexDirection: 'row',
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
    borderRadius: 12,
    backgroundColor: '#0C101A',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    borderColor: '#505050',
    borderWidth: 1,
    marginLeft: 10,
    marginTop: 12
  },
  text_alertas:{
    color: '#aaa',
    fontSize: 13,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginTop: 15,
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
    borderTopLeftRadius: 5
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
  },
  notificacaoItem: {
    backgroundColor: '#161b26',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ca2020', 
    margin: 10
  },
  notificacaoTexto: {
    color: '#fff',
    fontSize: 14,
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
});