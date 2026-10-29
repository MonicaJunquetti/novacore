import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { CardStatus } from '@/components/CardStatus';
import { CardGrafico } from '@/components/CardGraficoHistograma';
import { BotaoFiltro } from '@/components/BotaoFiltro';
import MotorCardAlert from '@/components/CardMotorAlerta';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import BottomBar from "../../components/BottomBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDashboard } from "@/context/DashboardContext";
import { useRouter } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function HomeScreen() {
  const router = useRouter();
  const { plantaAtiva, setPlantaAtiva } = useDashboard();

  // ==========================================
  // ESTADOS
  // ==========================================
  const [filtroSelecionado, setFiltroSelecionado] = useState('');
  const [motores, setMotores] = useState([]);
  const [tipoVisualizacao, setTipoVisualizacao] = useState<'carcaca' | 'enrolamento'>('carcaca');
  const [labelsTemperatura, setLabelsTemperatura] = useState<string[]>([]);
  const [labelsVibracao, setLabelsVibracao] = useState<string[]>([]);

  // DADOS DOS SENSORES
  const [dadosTemperatura, setDadosTemperatura] = useState<any[]>([]);
  const [dadosVibracao, setDadosVibracao] = useState<any[]>([]);

  const [contagemStatus, setContagemStatus] = useState({
    normal: 0,
    alerta: 0,
    critico: 0
  });

  const [alertas, setAlertas] = useState([]);
  const [notificacoesNaoLidas, setNotificacoesNaoLidas] = useState(0);
  const ultimoIdAlerta = useRef<number | null>(null);

  const filtros = ['Hora', 'Dia', 'Semana'];

  // ==========================================
  // AUTOSELEÇÃO / VALIDAÇÃO DE DASHBOARDS
  // ==========================================
  useEffect(() => {
    validarEDefinirPlantaUsuario();
  }, []);

  const validarEDefinirPlantaUsuario = async () => {
    try {
      const usuarioSalvo = await AsyncStorage.getItem("usuario");
      if (!usuarioSalvo) {
        setPlantaAtiva(null);
        return;
      }

      const usuario = JSON.parse(usuarioSalvo);

      const res = await fetch(`${API_URL}/dashboards/usuario/${usuario.id_usuario}`);
      const dashboardsDoUsuario = await res.json();

      if (!res.ok || !dashboardsDoUsuario || dashboardsDoUsuario.length === 0) {
        setPlantaAtiva(null);
        await AsyncStorage.removeItem("dashboardAtivo");
        return;
      }

      const aindaTemAcesso = dashboardsDoUsuario.some(
        (dash: any) => dash.id_dashboard === plantaAtiva?.id_dashboard
      );

      if (!aindaTemAcesso) {
        setPlantaAtiva(dashboardsDoUsuario[0]);
        await AsyncStorage.setItem("dashboardAtivo", JSON.stringify(dashboardsDoUsuario[0]));
      }
    } catch (error) {
      console.log("Erro ao validar dashboards do usuário:", error);
      setPlantaAtiva(null);
    }
  };

  // ==========================================
  // FUNÇÃO AUXILIAR DE AGRUPAMENTO POR MOTOR (USANDO COR DO BANCO)
  // ==========================================
  const agruparPorMotor = (json: any[]) => {
    if (!json || json.length === 0) return { labels: [], linhas: [] };

    const labelsUnicas = Array.from(new Set(json.map((i) => i.ponto_escala)));

    // Estrutura do mapa para armazenar valores e a cor customizada do motor
    const motoresMap: { [key: string]: { dados: number[]; cor: string } } = {};

    json.forEach((item) => {
      const nome = item.nome_motor || `Motor ${item.id_motor}`;
      const cor = item.cor_grafico || '#6C5DD1';

      if (!motoresMap[nome]) {
        motoresMap[nome] = { dados: [], cor: cor };
      }
      motoresMap[nome].dados.push(Number(item.valor));
    });

    const linhas = Object.keys(motoresMap).map((nomeMotor) => ({
      label: nomeMotor,
      dados: motoresMap[nomeMotor].dados,
      cor: motoresMap[nomeMotor].cor
    }));

    return { labels: labelsUnicas, linhas };
  };

  // ==========================================
  // FUNÇÕES DE BUSCA (BACKEND)
  // ==========================================
  const buscarDadosDoServidor = async () => {
    if (!plantaAtiva?.id_dashboard) {
      setDadosTemperatura([]);
      setLabelsTemperatura([]);
      return;
    }
    try {
      const url = `${API_URL}/sensor_temp/ultimos_temp?tipo=${tipoVisualizacao}&filtro=${filtroSelecionado}&dashboard_id=${plantaAtiva.id_dashboard}`;
      const response = await fetch(url);
      const json = await response.json();

      if (json && json.length > 0) {
        const { labels, linhas } = agruparPorMotor(json);

        let labelsExibicao = [...labels];

        if (filtroSelecionado === "" || filtroSelecionado === "Hora") {
          const passo = Math.ceil(labels.length / 5) || 1;
          labelsExibicao = labels.map((label: string, index: number) =>
            index % passo === 0 ? label : ""
          );
        }

        setLabelsTemperatura(labelsExibicao);
        setDadosTemperatura(linhas);
      } else {
        setDadosTemperatura([]);
        setLabelsTemperatura([]);
      }
    } catch (error) {
      console.log("ERRO ao buscar dados do servidor:", error);
    }
  };

  const buscarContagemStatus = async () => {
    if (!plantaAtiva?.id_dashboard) {
      setContagemStatus({ normal: 0, alerta: 0, critico: 0 });
      return;
    }
    try {
      const response = await fetch(`${API_URL}/motores/status-contagem?dashboard_id=${plantaAtiva.id_dashboard}`);
      if (!response.ok) return;

      const data = await response.json();

      setContagemStatus({
        normal: Number(data.normal || 0),
        alerta: Number(data.alerta || 0),
        critico: Number(data.critico || 0)
      });
    } catch (error) {
      console.log("Erro ao buscar contagem:", error);
    }
  };

  const buscarDadosVibracao = async () => {
    if (!plantaAtiva?.id_dashboard) {
      setDadosVibracao([]);
      setLabelsVibracao([]);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/sensores/ultimos-grafico?filtro=${filtroSelecionado}&dashboard_id=${plantaAtiva.id_dashboard}`);
      const json = await response.json();

      if (json && json.length > 0) {
        const { labels, linhas } = agruparPorMotor(json);

        let labelsExibicao = [...labels];

        if (filtroSelecionado === "" || filtroSelecionado === "Hora") {
          const passo = Math.ceil(labels.length / 5) || 1;
          labelsExibicao = labels.map((label: string, index: number) =>
            index % passo === 0 ? label : ""
          );
        }

        setLabelsVibracao(labelsExibicao);
        setDadosVibracao(linhas);
      } else {
        setDadosVibracao([]);
        setLabelsVibracao([]);
      }
    } catch (error) {
      console.log("Erro ao buscar vibração:", error);
    }
  };

  const carregarNotificacoes = async () => {
    try {
      const valorSalvo = await AsyncStorage.getItem("notificacoesNaoLidas");
      if (valorSalvo) {
        setNotificacoesNaoLidas(Number(valorSalvo));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const carregarUltimoId = async () => {
    try {
      const valor = await AsyncStorage.getItem("ultimoIdAlerta");
      if (valor) {
        ultimoIdAlerta.current = Number(valor);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const buscarAlertas = async () => {
    if (!plantaAtiva?.id_dashboard) {
      setAlertas([]);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/alertas?dashboard_id=${plantaAtiva.id_dashboard}`);
      const data = await response.json();
      setAlertas(data);
      if (!data || data.length === 0) return;

      const maiorId = Math.max(...data.map((item: any) => item.id_alerta));

      if (ultimoIdAlerta.current === null) {
        const ultimoIdSalvo = await AsyncStorage.getItem("ultimoIdAlerta");
        if (ultimoIdSalvo) {
          ultimoIdAlerta.current = Number(ultimoIdSalvo);
        } else {
          ultimoIdAlerta.current = maiorId;
          await AsyncStorage.setItem("ultimoIdAlerta", maiorId.toString());
        }
        return;
      }

      if (maiorId > ultimoIdAlerta.current) {
        setNotificacoesNaoLidas((prev) => {
          const novoValor = prev + 1;
          AsyncStorage.setItem("notificacoesNaoLidas", novoValor.toString());
          return novoValor;
        });
        ultimoIdAlerta.current = maiorId;
        await AsyncStorage.setItem("ultimoIdAlerta", maiorId.toString());
      }
    } catch (error) {
      console.log("Erro ao buscar alertas:", error);
    }
  };

  const buscarMotores = async () => {
    if (!plantaAtiva?.id_dashboard) {
      setMotores([]);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/motores/dashboard/${plantaAtiva.id_dashboard}`);
      const data = await response.json();
      if (response.ok) setMotores(data);
    } catch (error) {
      console.log("Erro ao buscar motores:", error);
    }
  };

  useEffect(() => {
    carregarNotificacoes();
    carregarUltimoId();

    if (!plantaAtiva) {
      setMotores([]);
      setAlertas([]);
      setContagemStatus({ normal: 0, alerta: 0, critico: 0 });
      setDadosTemperatura([]);
      setDadosVibracao([]);
      return;
    }

    buscarAlertas();
    buscarMotores();
    buscarDadosDoServidor();
    buscarDadosVibracao();
    buscarContagemStatus();

    const intervalo = setInterval(() => {
      buscarAlertas();
      buscarMotores();
      buscarDadosDoServidor();
      buscarDadosVibracao();
      buscarContagemStatus();
    }, 2000);

    return () => clearInterval(intervalo);
  }, [tipoVisualizacao, filtroSelecionado, plantaAtiva]);

  return (
    <View style={styles.containerPrincipal}>
      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ESTADO VAZIO */}
        {!plantaAtiva ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="dashboard-customize" size={64} color="#6C5DD2" />
            <Text style={styles.emptyTitle}>Nenhum Dashboard Selecionado</Text>
            <Text style={styles.emptySubtitle}>
              Você ainda não possui nenhum dashboard criado ou compartilhado com sua conta.
            </Text>

            <TouchableOpacity
              style={styles.btnCriarDashboard}
              onPress={() => router.push("/dashboard_admin")}
            >
              <MaterialIcons name="add" size={20} color="#fff" />
              <Text style={styles.btnCriarText}>Criar dashboard</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* CONTEÚDO DO DASHBOARD */
          <>
            {/* FILTROS */}
            <View style={styles.container_filtros}>
              {filtros.map((item) => (
                <BotaoFiltro
                  key={item}
                  label={item}
                  isSelected={filtroSelecionado === item}
                  onPress={() => {
                    if (filtroSelecionado === item) {
                      setFiltroSelecionado('');
                    } else {
                      setFiltroSelecionado(item);
                    }
                  }}
                  style={styles.buttonFiltroTempo}
                />
              ))}
            </View>

            {/* CARDS STATUS */}
            <View style={styles.statusRow}>
              <CardStatus
                label="Normal"
                icon={require('../../assets/images/icone_normal_cinza.png')}
                data={contagemStatus.normal}
              />

              <CardStatus
                label="Alerta"
                icon={require('../../assets/images/icone_alerta.png')}
                data={contagemStatus.alerta}
              />

              <CardStatus
                label="Crítico"
                icon={require('../../assets/images/icone_critico.png')}
                data={contagemStatus.critico}
              />
            </View>

            {/* BOTÕES CARCAÇA / ENROLAMENTO */}
            <View style={styles.botoesContainer}>
              <TouchableOpacity
                style={[
                  styles.botaoVisualizacao,
                  tipoVisualizacao === "carcaca" && styles.botaoAtivo
                ]}
                onPress={() => setTipoVisualizacao("carcaca")}
              >
                <Text
                  style={[
                    styles.botaoTexto,
                    tipoVisualizacao === "carcaca" && styles.botaoTextoAtivo
                  ]}
                >
                  Carcaça (Real)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.botaoVisualizacao,
                  tipoVisualizacao === "enrolamento" && styles.botaoAtivo
                ]}
                onPress={() => setTipoVisualizacao("enrolamento")}
              >
                <Text
                  style={[
                    styles.botaoTexto,
                    tipoVisualizacao === "enrolamento" && styles.botaoTextoAtivo
                  ]}
                >
                  Enrolamento (Estimado)
                </Text>
              </TouchableOpacity>
            </View>

            {/* GRÁFICOS */}
            <CardGrafico
              titulo={
                tipoVisualizacao === "enrolamento"
                  ? "Temperatura do Enrolamento (Estimada)"
                  : "Temperatura da Carcaça (Real)"
              }
              linhas={dadosTemperatura}
              labels={labelsTemperatura}
            />

            <CardGrafico
              titulo="Vibração (m/s²)"
              linhas={dadosVibracao}
              labels={labelsVibracao}
            />

            {/* ALERTAS */}
            <View style={styles.container_alerta_motores}>
              <Text style={styles.text_alertas}>Alertas ativos</Text>

              {motores.map((motor: any) => (
                <MotorCardAlert
                  key={motor.id_motor}
                  nome={motor.nome_motor}
                  localizacao_setor={motor.localizacao}
                  status_vibracao={motor.status_vibracao}
                  status_temperatura={motor.status_temperatura}
                  valor_vibracao={motor.valor_vibracao}
                  valor_temp={motor.valor_temp}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>

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
  botoesContainer: {
    flexDirection: 'row',
    width: '91%',
    gap: 12,
    marginBottom: 15,
  },
  botaoVisualizacao: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#050B18',
    borderWidth: 1,
    borderColor: '#505050',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  botaoAtivo: {
    backgroundColor: '#6C5DD2',
    borderColor: '#6C5DD2',
  },
  botaoTexto: {
    color: '#aaa',
    fontSize: 13,
    fontWeight: 'bold',
  },
  botaoTextoAtivo: {
    color: '#ffffff',
  },
  container_filtros: {
    flexDirection: 'row',
    marginTop: 10,
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
  container_alerta_motores: {
    width: '91%',
    borderRadius: 24,
    backgroundColor: '#050B18',
    borderColor: '#505050',
    borderWidth: 1,
    paddingBottom: 15,
    marginTop: 12,
    marginBottom: 30,
  },
  text_alertas: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginTop: 25,
    marginBottom: 20
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    width: '90%',
    marginTop: "60%",
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
  btnCriarDashboard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C5DD2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    gap: 8,
  },
  btnCriarText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});