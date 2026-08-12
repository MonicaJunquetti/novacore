const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");

// ==========================================
// CONEXÃO COM BANCO DE DADOS
// ==========================================
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "db_novacore"
});

// ==========================================
// CLASSE DO FILTRO DE KALMAN
// ==========================================
class KalmanFilter {
    constructor(Q = 0.01, R = 3) {
        this.Q = Q;             
        this.R = R;             
        this.x_est = 0.0;       
        this.P = 1.0;           
        this.primeiraLeitura = true;
    }

    filtrar(valorNaoFiltrado) {
        if (isNaN(valorNaoFiltrado)) return this.x_est;
        if (this.primeiraLeitura) {
            this.x_est = valorNaoFiltrado;
            this.primeiraLeitura = false;
            return this.x_est;
        }
        let z = valorNaoFiltrado; 
        let x_pred = this.x_est; 
        let P_pred = this.P + this.Q; 
        let K = P_pred / (P_pred + this.R); 
        this.x_est = x_pred + K * (z - x_pred); 
        this.P = (1 - K) * P_pred; 
        return this.x_est; 
    }
}

const kalmanCarcaca = new KalmanFilter(0.01, 3);
const kalmanEnrolamento = new KalmanFilter(0.01, 3);
let ultimoSalvamento = 0;
const raizDeTres = Math.sqrt(3);

// Cache para os dados do motor
let motorInfoCache = null;

// ==========================================
// VARIÁVEIS PARA CONTROLE DE ALERTAS
// ==========================================
let ultimoEstadoSalvo = "ok";

// ==========================================
// FUNÇÃO PARA OBTER LIMITES POR CLASSE DE ISOLAMENTO
// ==========================================
function getLimitesPorClasse(classeIsolamento, tipoTemperatura = "carcaca") {
    let limites = {
        alerta: 0,
        critico: 0
    };

    // Limites base IEC 60034-1 para temperatura da CARCAÇA
    switch (classeIsolamento) {
        case "B":
            limites.alerta = 96;
            limites.critico = 104;
            break;
        case "H":
            limites.alerta = 124;
            limites.critico = 144;
            break;
        case "F":
        default:
            limites.alerta = 108;
            limites.critico = 124;
            break;
    }

    // Se for temperatura do ENROLAMENTO, aumenta 10%
    if (tipoTemperatura === "enrolamento") {
        limites.alerta = Math.round(limites.alerta * 1.10);
        limites.critico = Math.round(limites.critico * 1.10);
    }

    return limites;
}

// ==========================================
// FUNÇÃO PARA BUSCAR CLASSE DE ISOLAMENTO DO MOTOR
// ==========================================
async function getClasseIsolamentoMotor(idMotor) {
    const [motores] = await pool.query(
        "SELECT classe_isolamento FROM tb_motores WHERE id_motor = ?", 
        [idMotor]
    );
    
    if (motores.length > 0 && motores[0].classe_isolamento) {
        return motores[0].classe_isolamento;
    }
    return "F"; // padrão se não encontrar
}

// ==========================================
// FUNÇÃO PARA ATUALIZAR TB_STATUS_TEMP (SEMPRE)
// ==========================================
async function atualizarStatusTemp(idMotor, estado, temperatura) {
    const [existe] = await pool.query(
        "SELECT id_status FROM tb_status_temp WHERE fk_motor = ?",
        [idMotor]
    );

    if (existe.length > 0) {
        await pool.query(
            `UPDATE tb_status_temp
             SET estado = ?,
                 valor_temp = ?,
                 ultima_atualizacao = NOW()
             WHERE fk_motor = ?`,
            [estado, temperatura, idMotor]
        );
    } else {
        await pool.query(
            `INSERT INTO tb_status_temp (fk_motor, estado, valor_temp, ultima_atualizacao)
             VALUES (?, ?, ?, NOW())`,
            [idMotor, estado, temperatura]
        );
    }
    
    console.log(`[STATUS] Tabela status_temp atualizada: Motor ${idMotor} = ${estado.toUpperCase()} | Temp: ${temperatura.toFixed(1)}°C`);
}

// ==========================================
// FUNÇÃO PARA VERIFICAR E SALVAR ALERTAS
// ==========================================
async function verificarEmitirAlerta(idMotor, idSensor, temperatura, classeIsolamento, tipoTemperatura) {
    const limites = getLimitesPorClasse(classeIsolamento, tipoTemperatura);

    console.log(
        `[DEBUG] Classe=${classeIsolamento} | Alerta=${limites.alerta} | Critico=${limites.critico} | Temp=${temperatura}`
    );
    
    // Determinar estado atual
    let estadoAtual = "ok";
    if (temperatura >= limites.alerta && temperatura < limites.critico) {
        estadoAtual = "alerta";
    } else if (temperatura >= limites.critico) {
        estadoAtual = "erro";
    }
    
    // ATUALIZAR STATUS_TEMP SEMPRE (independente se mudou ou não)
    await atualizarStatusTemp(idMotor, estadoAtual, temperatura);
    
    // Se o estado mudou, salvar alerta no banco
    if (estadoAtual !== ultimoEstadoSalvo) {
        console.log(
            `[DEBUG] Mudança de estado: ${ultimoEstadoSalvo} -> ${estadoAtual}`
        );
        if (estadoAtual !== "ok") {
            console.log("[DEBUG] Salvando alerta de temperatura...");
            await pool.query(
                `INSERT INTO tb_alertas 
                    (fk_motor, fk_sensor, tipo_alerta, valor_detectado, horario, nivel_alerta)
                 VALUES (?, ?, ?, ?, NOW(), ?)`,
                [idMotor, idSensor, "TEMPERATURA", temperatura, estadoAtual.toUpperCase()]
            );
            console.log(`\x1b[31m[ALERTA] Motor ${idMotor} (${tipoTemperatura}) em ${estadoAtual.toUpperCase()}! Temp: ${temperatura.toFixed(1)}°C | Limite: ${limites.alerta}°C\x1b[0m`);
        } else {
            console.log(`\x1b[32m[OK] Motor ${idMotor} normalizou. Temp: ${temperatura.toFixed(1)}°C\x1b[0m`);
        }
        
        ultimoEstadoSalvo = estadoAtual;

    }
    
    return { estado: estadoAtual, limites };
}

// ==========================================
// FÓRMULA MATEMÁTICA DE ESTIMATIVA TÉRMICA
// ==========================================
function estimarTempEnrolamento(tempCarcaca, voltagem, corrente, fatorPotencia, rendimento, l, A, k, rIntCarcaca, rExtEstator, L_motor) {
    const kArConstante = 0.3265; 
    const q = voltagem * corrente * raizDeTres * fatorPotencia;
    const qPerdasEstator = q * (1 - rendimento) * 0.65; 
    const Rth_carcaca = l / (k * A);
    const numeradorAr = Math.log(rIntCarcaca / rExtEstator);
    const denominadorAr = 2 * Math.PI * kArConstante * L_motor;
    const Rth_ar = numeradorAr / denominadorAr;

    return tempCarcaca + (qPerdasEstator * (Rth_carcaca + Rth_ar));
}

// ==========================================
// FUNÇÃO PARA BUSCAR DADOS DO MOTOR
// ==========================================
async function getMotorInfo(idMotor) {
    if (motorInfoCache) return motorInfoCache;
    
    const [motores] = await pool.query("SELECT * FROM tb_motores WHERE id_motor = ?", [idMotor]);
    if (motores.length > 0) {
        motorInfoCache = motores[0];
        return motorInfoCache;
    }
    return null;
}

// ==========================================
// ROTA 1: RECEBER DADOS DO SENSOR
// ==========================================
router.get("/dados", async (req, res) => {
    try {
        const temperaturaRaw = parseFloat(req.query.Tc);
        const idMotor = parseInt(req.query.motor) || 1;
        const idSensor = 2;
        const unidade = req.query.unidade || "C";

        if (isNaN(temperaturaRaw)) {
            return res.status(400).json({ erro: "Temperatura inválida" });
        }

        const temperaturaCarcacaFiltrada = kalmanCarcaca.filtrar(temperaturaRaw);
        const agora = Date.now();

        // VERIFICAR ALERTAS PARA CARCAÇA (já atualiza status_temp dentro)
        const classeIsolamento = await getClasseIsolamentoMotor(idMotor);
        const resultadoAlerta = await verificarEmitirAlerta(
            idMotor, 
            idSensor, 
            temperaturaCarcacaFiltrada, 
            classeIsolamento, 
            "carcaca"
        );

        if (agora - ultimoSalvamento > 5000) {
            ultimoSalvamento = agora;
            await pool.query(
                `INSERT INTO tb_dados (fk_motor, fk_sensor, valor, unidade, horario) VALUES (?, ?, ?, ?, NOW())`,
                [idMotor, idSensor, temperaturaCarcacaFiltrada, unidade]
            );
            console.log(`[Banco] Carcaça Salva: ${temperaturaCarcacaFiltrada.toFixed(2)}°C | Estado: ${resultadoAlerta.estado.toUpperCase()}`);
        }

        res.json({ 
            status: "sucesso", 
            valor_salvo: temperaturaCarcacaFiltrada,
            estado_motor: resultadoAlerta.estado,
            limite_alerta: resultadoAlerta.limites.alerta,
            limite_critico: resultadoAlerta.limites.critico
        });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro interno" });
    }
});

// ==========================================
// ROTA 2: ENVIAR HISTÓRICO COM FILTRO DE TEMPO
// ==========================================
router.get("/ultimos_temp", async (req, res) => {
    try {
        const filtro = req.query.filtro; // Recebe: 'Hora', 'Dia', 'Semana' ou undefined
        const idMotor = parseInt(req.query.motor) || 1;
        const tipo = req.query.tipo || 'carcaca';
        
        let querySql = "";
        let queryParams = [idMotor];

        // Mapeamento dos filtros para queries SQL inteligentes (evita sobreposição agrupando os dados)
        if (filtro === 'Hora') {
            // Última 1 hora -> Agrupa de minuto em minuto
            querySql = `
                SELECT 
                    DATE_FORMAT(horario, '%H:%i') as ponto_escala,
                    AVG(valor) as valor
                FROM tb_dados 
                WHERE fk_motor = ? AND fk_sensor = 2
                  AND horario >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
                GROUP BY MINUTE(horario), HOUR(horario)
                ORDER BY MINUTE(horario) ASC
            `;
        } else if (filtro === 'Dia') {
            // Últimas 24 horas -> Agrupa de hora em hora
            querySql = `
                SELECT 
                    DATE_FORMAT(horario, '%H:00') as ponto_escala,
                    AVG(valor) as valor
                FROM tb_dados 
                WHERE fk_motor = ? AND fk_sensor = 2
                  AND horario >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
                GROUP BY HOUR(horario), DAY(horario)
                ORDER BY horario ASC
            `;
        } else if (filtro === 'Semana') {
            // Últimos 7 dias -> Agrupa por Dia da Semana
            querySql = `
                SELECT 
                    CASE DAYOFWEEK(horario)
                        WHEN 1 THEN 'Dom' WHEN 2 THEN 'Seg' WHEN 3 THEN 'Ter'
                        WHEN 4 THEN 'Qua' WHEN 5 THEN 'Qui' WHEN 6 THEN 'Sex' WHEN 7 THEN 'Sáb'
                    END as ponto_escala,
                    AVG(valor) as valor
                FROM tb_dados 
                WHERE fk_motor = ? AND fk_sensor = 2
                  AND horario >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                GROUP BY DAYOFWEEK(horario), DATE(horario)
                ORDER BY DATE(horario) ASC
            `;
        } else {
            // ====================================================================
            // TEMPO REAL (Nenhum filtro válido selecionado)
            // Retorna os últimos 20 registros sem mudar a estrutura padrão do banco
            // ====================================================================
            querySql = `
                SELECT
                    DATE_FORMAT(horario, '%H:%i') as ponto_escala,
                    valor
                FROM tb_dados
                WHERE fk_motor = ? AND fk_sensor = 2
                ORDER BY horario DESC
                LIMIT 20
            `;
        }

        let [dados] = await pool.query(querySql, queryParams);

        // Se o filtro foi tempo real, nós demos um 'DESC' para pegar os últimos, precisamos dar um reverse para o gráfico ir da esquerda para a direita.
        if (!filtro) {
            dados = dados.reverse();
        }

        // Se for enrolamento, aplica a sua fórmula matemática existente
        if (tipo === 'enrolamento') {
            const motorInfo = await getMotorInfo(idMotor);
            if (motorInfo) {
                const tensao = parseFloat(motorInfo.tensao_nominal) || 380;
                const corrente = parseFloat(motorInfo.corrente_nominal) || 4.5;
                const fp = parseFloat(motorInfo.fator_potencia) || 0.88;
                const rend = parseFloat(motorInfo.rendimento) || 0.865;
                const espessura = parseFloat(motorInfo.espessura_carcaca) || 0.006;
                const area = parseFloat(motorInfo.area_conducao) || 1.70816;
                const cond_metal = parseFloat(motorInfo.condutividade_metal) || 44;
                const r_int = parseFloat(motorInfo.raio_interno_carcaca) || 0.0700;
                const r_ext = parseFloat(motorInfo.raio_externo_estator) || 0.0698;
                const comp_estator = parseFloat(motorInfo.comprimento_estator) || 0.14;

                const dadosComEstimativa = dados.map((item) => {
                    let tempEstimada = estimarTempEnrolamento(
                        Number(item.valor), tensao, corrente, fp, rend,
                        espessura, area, cond_metal, r_int, r_ext, comp_estator
                    );
                    const tempFiltrada = kalmanEnrolamento.filtrar(tempEstimada);
                    return {
                        ponto_escala: item.ponto_escala,
                        valor: isNaN(tempFiltrada) ? Number(item.valor) + 5 : tempFiltrada
                    };
                });
                return res.json(dadosComEstimativa);
            }
        }
        
        res.json(dados);
    } catch (erro) {
        console.error("Erro na rota /ultimos_temp:", erro);
        res.status(500).json({ erro: "Erro interno" });
    }
});

// ==========================================
// ROTA 3: BUSCAR STATUS ATUAL DO MOTOR
// ==========================================
router.get("/status_motor", async (req, res) => {
    try {
        const idMotor = parseInt(req.query.motor) || 1;
        
        const [status] = await pool.query(
            "SELECT estado, valor_temp, ultima_atualizacao FROM tb_status_temp WHERE fk_motor = ?",
            [idMotor]
        );
        
        if (status.length > 0) {
            res.json({
                motor: idMotor,
                estado: status[0].estado,
                temperatura: status[0].valor_temp,
                ultima_atualizacao: status[0].ultima_atualizacao
            });
        } else {
            res.json({
                motor: idMotor,
                estado: "ok",
                temperatura: null,
                ultima_atualizacao: null
            });
        }
    } catch (erro) {
        console.error("Erro ao buscar status:", erro);
        res.status(500).json({ erro: "Erro interno" });
    }
});

module.exports = router;