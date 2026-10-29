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

let motorInfoCache = null;
let ultimoEstadoSalvo = "ok";

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================
function getLimitesPorClasse(classeIsolamento, tipoTemperatura = "carcaca") {
    let limites = { alerta: 0, critico: 0 };

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

    if (tipoTemperatura === "enrolamento") {
        limites.alerta = Math.round(limites.alerta * 1.10);
        limites.critico = Math.round(limites.critico * 1.10);
    }

    return limites;
}

async function getClasseIsolamentoMotor(idMotor) {
    const [motores] = await pool.query(
        "SELECT classe_isolamento FROM tb_motores WHERE id_motor = ?", 
        [idMotor]
    );
    
    if (motores.length > 0 && motores[0].classe_isolamento) {
        return motores[0].classe_isolamento;
    }
    return "F";
}

async function atualizarStatusTemp(idMotor, estado, temperatura) {
    const [existe] = await pool.query(
        "SELECT id_status FROM tb_status_temp WHERE fk_motor = ?",
        [idMotor]
    );

    if (existe.length > 0) {
        await pool.query(
            `UPDATE tb_status_temp
             SET estado = ?, valor_temp = ?, ultima_atualizacao = NOW()
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
    
    console.log(`[STATUS] status_temp: Motor ${idMotor} = ${estado.toUpperCase()} | Temp: ${temperatura.toFixed(1)}°C`);
}

// Removido a coluna obsoleta 'fk_sensor' da gravação do alerta
async function verificarEmitirAlerta(idMotor, temperatura, classeIsolamento, tipoTemperatura) {
    const limites = getLimitesPorClasse(classeIsolamento, tipoTemperatura);

    let estadoAtual = "ok";
    if (temperatura >= limites.alerta && temperatura < limites.critico) {
        estadoAtual = "alerta";
    } else if (temperatura >= limites.critico) {
        estadoAtual = "erro";
    }
    
    await atualizarStatusTemp(idMotor, estadoAtual, temperatura);
    
    if (estadoAtual !== ultimoEstadoSalvo) {
        if (estadoAtual !== "ok") {
            await pool.query(
                `INSERT INTO tb_alertas 
                    (fk_motor, tipo_alerta, valor_detectado, horario, nivel_alerta)
                 VALUES (?, 'TEMPERATURA', ?, NOW(), ?)`,
                [idMotor, temperatura, estadoAtual.toUpperCase()]
            );
            console.log(`\x1b[31m[ALERTA] Motor ${idMotor} em ${estadoAtual.toUpperCase()}! Temp: ${temperatura.toFixed(1)}°C\x1b[0m`);
        } else {
            console.log(`\x1b[32m[OK] Motor ${idMotor} normalizou. Temp: ${temperatura.toFixed(1)}°C\x1b[0m`);
        }
        
        ultimoEstadoSalvo = estadoAtual;
    }
    
    return { estado: estadoAtual, limites };
}

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
// ROTA 1: RECEBER DADOS DO ESP32
// ==========================================
router.get("/dados", async (req, res) => {
    try {
        const temperaturaRaw = parseFloat(req.query.Tc);
        const idMotor = parseInt(req.query.motor) || 1;
        const unidade = req.query.unidade || "C";

        if (isNaN(temperaturaRaw)) {
            return res.status(400).json({ erro: "Temperatura inválida" });
        }

        const temperaturaCarcacaFiltrada = kalmanCarcaca.filtrar(temperaturaRaw);
        const agora = Date.now();

        const classeIsolamento = await getClasseIsolamentoMotor(idMotor);
        const resultadoAlerta = await verificarEmitirAlerta(
            idMotor, 
            temperaturaCarcacaFiltrada, 
            classeIsolamento, 
            "carcaca"
        );

        if (agora - ultimoSalvamento > 5000) {
            ultimoSalvamento = agora;
            await pool.query(
                `INSERT INTO tb_dados (fk_motor, tipo_sensor, valor, unidade, horario) VALUES (?, 'temperatura', ?, ?, NOW())`,
                [idMotor, temperaturaCarcacaFiltrada, unidade]
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
        console.error("Erro na recepção do sensor de temperatura:", erro);
        res.status(500).json({ erro: "Erro interno" });
    }
});

// ==========================================
// ROTA 2: ENVIAR HISTÓRICO COM FILTRO DE TEMPO
// ==========================================
router.get("/ultimos_temp", async (req, res) => {
    try {
        const filtro = req.query.filtro;
        const dashboardId = req.query.dashboard_id;
        const tipo = req.query.tipo || 'carcaca';
        
        if (!dashboardId) {
            return res.status(400).json({ erro: "ID do Dashboard é obrigatório" });
        }

        let querySql = "";
        let queryParams = [dashboardId];

        if (filtro === 'Hora') {
            querySql = `
                SELECT 
                    m.id_motor,
                    m.nome_motor,
                    m.cor_grafico,
                    DATE_FORMAT(d.horario, '%H:%i') as ponto_escala,
                    AVG(d.valor) as valor
                FROM tb_dados d
                INNER JOIN tb_motores m ON d.fk_motor = m.id_motor
                WHERE d.tipo_sensor = 'temperatura' AND m.fk_dashboard = ?
                  AND d.horario >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
                GROUP BY m.id_motor, m.nome_motor, MINUTE(d.horario), HOUR(d.horario)
                ORDER BY MINUTE(d.horario) ASC
            `;
        } else if (filtro === 'Dia') {
            querySql = `
                SELECT 
                    m.id_motor,
                    m.nome_motor,
                    m.cor_grafico,
                    DATE_FORMAT(d.horario, '%H:00') as ponto_escala,
                    AVG(d.valor) as valor
                FROM tb_dados d
                INNER JOIN tb_motores m ON d.fk_motor = m.id_motor
                WHERE d.tipo_sensor = 'temperatura' AND m.fk_dashboard = ?
                  AND d.horario >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
                GROUP BY m.id_motor, m.nome_motor, HOUR(d.horario), DAY(d.horario)
                ORDER BY d.horario ASC
            `;
        } else if (filtro === 'Semana') {
            querySql = `
                SELECT 
                    m.id_motor,
                    m.nome_motor,
                    m.cor_grafico,
                    CASE DAYOFWEEK(d.horario)
                        WHEN 1 THEN 'Dom' WHEN 2 THEN 'Seg' WHEN 3 THEN 'Ter'
                        WHEN 4 THEN 'Qua' WHEN 5 THEN 'Qui' WHEN 6 THEN 'Sex' WHEN 7 THEN 'Sáb'
                    END as ponto_escala,
                    AVG(d.valor) as valor
                FROM tb_dados d
                INNER JOIN tb_motores m ON d.fk_motor = m.id_motor
                WHERE d.tipo_sensor = 'temperatura' AND m.fk_dashboard = ?
                  AND d.horario >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                GROUP BY m.id_motor, m.nome_motor, DAYOFWEEK(d.horario), DATE(d.horario)
                ORDER BY DATE(d.horario) ASC
            `;
        } else {
            querySql = `
                SELECT
                    m.id_motor,
                    m.nome_motor,
                    m.cor_grafico,
                    DATE_FORMAT(d.horario, '%H:%i') as ponto_escala,
                    d.valor
                FROM tb_dados d
                INNER JOIN tb_motores m ON d.fk_motor = m.id_motor
                WHERE d.tipo_sensor = 'temperatura' AND m.fk_dashboard = ?
                ORDER BY d.horario DESC
                LIMIT 50
            `;
        }

        let [dados] = await pool.query(querySql, queryParams);

        if (!filtro) {
            dados = dados.reverse();
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