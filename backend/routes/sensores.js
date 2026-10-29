const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");

// ==========================================
// CONEXÃO COM BANCO
// ==========================================
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "db_novacore"
});

// ==========================================
// CONFIGURAÇÕES
// ==========================================
const TAM_BUFFER = 20;
const LIMITE_RUIDO = 0.3;
const ALPHA = 0.98;

// ==========================================
// VARIÁVEIS DE ESTADO
// ==========================================
let bufferX = [];
let bufferY = [];
let bufferZ = [];

let offsetX = 0;
let offsetY = 0;
let offsetZ = 0;

let calibrado = false;
let amostrasCalibracao = [];
const NUM_AMOSTRAS_CALIB = 100;

let ultimoFiltroX = 0;
let ultimoFiltroY = 0;
let ultimoFiltroZ = 0;

let ultimoRawX = 0;
let ultimoRawY = 0;
let ultimoRawZ = 0;

let estadoAtual = "ok";
let ultimoSalvamento = 0;
let ultimoEstadoSalvo = "ok";

// ==========================================
// KALMAN
// ==========================================
let Q = 0.1;
let R = 0.5;

let x_estX = 0, x_estY = 0, x_estZ = 0;
let PX = 1, PY = 1, PZ = 1;

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================
function filtro(valor, limite = 0.1) {
    return Math.abs(valor) < limite ? 0 : valor;
}

function filtroKalman(valor, eixo) {
    let x_est, P;

    if (eixo === "x") { x_est = x_estX; P = PX; }
    if (eixo === "y") { x_est = x_estY; P = PY; }
    if (eixo === "z") { x_est = x_estZ; P = PZ; }

    let x_pred = x_est;
    let P_pred = P + Q;
    let K = P_pred / (P_pred + R);

    x_est = x_pred + K * (valor - x_pred);
    P = (1 - K) * P_pred;

    if (eixo === "x") { x_estX = x_est; PX = P; }
    if (eixo === "y") { x_estY = x_est; PY = P; }
    if (eixo === "z") { x_estZ = x_est; PZ = P; }

    return x_est;
}

function calcularRMS(buffer) {
    if (buffer.length === 0) return 0;
    const soma = buffer.reduce((acc, v) => acc + v * v, 0);
    return Math.sqrt(soma / buffer.length);
}

// ==========================================
// ROTA 1: RECEBER DADOS DO ESP32
// ==========================================
router.get("/dados", async (req, res) => {
    try {
        let ax = parseFloat(req.query.ax);
        let ay = parseFloat(req.query.ay);
        let az = parseFloat(req.query.az);
        
        // lê o id_motor dinâmico enviado pelo ESP32 (padrão 1 se não fornecido)
        const idMotor = parseInt(req.query.motor) || 1;

        if (isNaN(ax) || isNaN(ay) || isNaN(az)) {
            return res.status(400).json({ erro: "Dados inválidos" });
        }

        // Calibração de amostras iniciais
        if (!calibrado) {
            amostrasCalibracao.push({ ax, ay, az });
            if (amostrasCalibracao.length >= NUM_AMOSTRAS_CALIB) {
                offsetX = amostrasCalibracao.reduce((s, v) => s + v.ax, 0) / NUM_AMOSTRAS_CALIB;
                offsetY = amostrasCalibracao.reduce((s, v) => s + v.ay, 0) / NUM_AMOSTRAS_CALIB;
                offsetZ = amostrasCalibracao.reduce((s, v) => s + v.az, 0) / NUM_AMOSTRAS_CALIB;
                calibrado = true;
                console.log(`Calibração concluída para Motor ${idMotor}`);
            }
            return res.json({ status: "calibrando", progresso: amostrasCalibracao.length / NUM_AMOSTRAS_CALIB });
        }

        // Processamento dos eixos
        ax = (ax - offsetX) * 9.81;
        ay = (ay - offsetY) * 9.81;
        az = (az - offsetZ) * 9.81;

        ax = filtroKalman(ax, "x");
        ay = filtroKalman(ay, "y");
        az = filtroKalman(az, "z");

        let filtroX = ALPHA * (ultimoFiltroX + ax - ultimoRawX);
        let filtroY = ALPHA * (ultimoFiltroY + ay - ultimoRawY);
        let filtroZ = ALPHA * (ultimoFiltroZ + az - ultimoRawZ);

        ultimoFiltroX = filtroX;
        ultimoFiltroY = filtroY;
        ultimoFiltroZ = filtroZ;

        ultimoRawX = ax;
        ultimoRawY = ay;
        ultimoRawZ = az;

        filtroX = filtro(Math.max(Math.min(filtroX, 8), -8), 0.2);
        filtroY = filtro(Math.max(Math.min(filtroY, 8), -8), 0.2);
        filtroZ = filtro(Math.max(Math.min(filtroZ, 8), -8), 0.2);

        bufferX.push(filtroX);
        bufferY.push(filtroY);
        bufferZ.push(filtroZ);

        if (bufferX.length > TAM_BUFFER) {
            bufferX.shift();
            bufferY.shift();
            bufferZ.shift();
        }

        const rmsX = calcularRMS(bufferX);
        const rmsY = calcularRMS(bufferY);
        const rmsZ = calcularRMS(bufferZ);

        const total = Math.sqrt(rmsX * rmsX + rmsY * rmsY + rmsZ * rmsZ);

        // Avaliação de estado
        if (estadoAtual === "ok") {
            if (total >= 2.0 && total < 3.5) estadoAtual = "alerta";
            else if (total >= 3.5) estadoAtual = "erro";
        } else if (estadoAtual === "alerta") {
            if (total < 2.0) estadoAtual = "ok";
            else if (total >= 3.5) estadoAtual = "erro";
        } else if (estadoAtual === "erro") {
            if (total < 3.0) estadoAtual = "alerta";
        }

        const agora = Date.now();

        // 1. SALVAR DADOS DE TELEMETRIA (A cada 5 segundos)
        if (agora - ultimoSalvamento > 5000) {
            ultimoSalvamento = agora;

            await pool.query(
                `INSERT INTO tb_dados (fk_motor, tipo_sensor, valor, unidade, horario)
                 VALUES (?, 'vibracao', ?, 'm/s²', NOW())`,
                [idMotor, total]
            );
        }

        // 2. REGISTRAR ALERTAS (Sem a coluna fk_sensor)
        if (estadoAtual !== "ok" && estadoAtual !== ultimoEstadoSalvo) {
            await pool.query(
                `INSERT INTO tb_alertas (fk_motor, tipo_alerta, valor_detectado, horario, nivel_alerta)
                 VALUES (?, 'VIBRACAO', ?, NOW(), ?)`,
                [idMotor, total, estadoAtual]
            );
            ultimoEstadoSalvo = estadoAtual;
        }

        // 3. ATUALIZAR TABELA DE STATUS DO MOTOR
        await pool.query(
            `UPDATE tb_status_motor
             SET estado = ?, valor_vibracao = ?, ultima_atualizacao = NOW()
             WHERE fk_motor = ?`,
            [estadoAtual, total, idMotor]
        );

        res.json({
            aceleracaoX: rmsX,
            aceleracaoY: rmsY,
            aceleracaoZ: rmsZ,
            aceleracaoTotal: total,
            unidade: "m/s²",
            estado: estadoAtual
        });

    } catch (erro) {
        console.error("Erro na recepção do sensor de vibração:", erro);
        res.status(500).json({ erro: "Erro no servidor" });
    }
});

// ==========================================
// ROTA 2: HISTÓRICO DE VIBRAÇÃO PARA O GRÁFICO
// ==========================================
router.get("/ultimos-grafico", async (req, res) => {
    try {
        const filtro = req.query.filtro;
        const dashboardId = req.query.dashboard_id;
        
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
                WHERE d.tipo_sensor = 'vibracao' AND m.fk_dashboard = ?
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
                WHERE d.tipo_sensor = 'vibracao' AND m.fk_dashboard = ?
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
                WHERE d.tipo_sensor = 'vibracao' AND m.fk_dashboard = ?
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
                    AVG(d.valor) as valor
                FROM tb_dados d
                INNER JOIN tb_motores m ON d.fk_motor = m.id_motor
                WHERE d.tipo_sensor = 'vibracao' AND m.fk_dashboard = ?
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
        console.error("Erro ao buscar gráfico de vibração:", erro);
        res.status(500).json({ erro: "Erro ao buscar vibração" });
    }
});

module.exports = router;