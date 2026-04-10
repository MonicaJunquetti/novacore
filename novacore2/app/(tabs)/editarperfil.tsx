import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions, TouchableOpacity, Modal, Image, TextInput } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

export default function EditarPerfil() {
  
    const [text, setText] = useState("");
    const [modalVisivel, setModalVisivel] = useState(false);

    return (
        <LinearGradient 
            colors={['#000510', '#000510', '#000510', '#030033', '#4200e880' ]} 
            style={styles.mainContainer}
        >

            <View style={styles.header}> 
                <Text style={styles.text_header}>Perfil</Text>

                <TouchableOpacity 
                    style={styles.icones_header} 
                    onPress={() => setModalVisivel(!modalVisivel)} 
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
                        <ScrollView> 
                            <View style={styles.notificacaoItem}>
                                <Image 
                                    source={require('../../assets/images/icone_critico.png')} 
                                    style={styles.icone_status_notificacoes} 
                                /> 
                                <View style={{ flex: 1 }}> 
                                    <Text style={styles.notificacaoTexto}>MTR-001</Text>
                                    <Text style={styles.notificacaoHora}>Vibração elevada detectada</Text>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <Text style={styles.text}>Editar Informações</Text>
            
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    onChangeText={setText}
                    placeholder="Nome"
                    placeholderTextColor="#888"  
                />

                <TextInput
                    style={styles.input}
                    onChangeText={setText}
                    placeholder="Email"
                    placeholderTextColor="#888"
                />

                <TextInput
                    style={styles.input}
                    onChangeText={setText}
                    secureTextEntry={true} // Oculta a senha
                    placeholder="Senha"
                    placeholderTextColor="#888"
                />

                <TextInput
                    style={styles.input}
                    onChangeText={setText}
                    secureTextEntry={true} // Oculta a senha
                    placeholder="Confirmar senha"
                    placeholderTextColor="#888"
                />

                <TouchableOpacity 
                    style={styles.btn_salvar} 
                    activeOpacity={0.7}
                >
                    <Text style={styles.text_btn}>Salvar alterações</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  btn_salvar:{
    width: '90%',
    height: 60,
    backgroundColor: '#6C5DD2',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginTop: 10
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#505050',
    width: '100%',
    paddingTop: 50, 
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
  text: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
    marginLeft: 20,
    marginBottom: 20
  },
  text_btn: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  inputContainer: {
    alignItems: 'center',
    width: '100%',
  },
  input: {
    width: '90%',
    height: 60,
    borderWidth: 1,
    borderColor: '#505050',
    borderRadius: 8,
    color: '#fff',
    paddingHorizontal: 15,
    backgroundColor: '#1A1D26', // Fundo levemente opaco para destacar do gradiente
    fontSize: 14,
    marginBottom: 20
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    height: '40%',
    backgroundColor: '#0C101A',
    borderWidth: 1,
    borderColor: '#505050',
    borderRadius: 15,
    marginTop: 100, 
    marginRight: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    padding: 15,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  notificacaoItem: {
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: '#161b26',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ca2020', 
    margin: 10,
    gap: 10,
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
  triangleBorder: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,  
    borderRightWidth: 10, 
    borderBottomWidth: 15, 
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#505050', 
    position: 'absolute',
    top: -15, 
    right: 20, 
  },
  triangleInner: {
    width: 0,
    height: 0,
    borderLeftWidth: 9,   
    borderRightWidth: 9,  
    borderBottomWidth: 14, 
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#0C101A', 
    position: 'absolute',
    top: -14, 
    right: 21, 
    zIndex: 2,
  },
  icone_status_notificacoes: {
    width: 15,
    height: 15,
  }
});