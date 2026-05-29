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

const TAM_BUFFER = 80;
const LIMITE_RUIDO = 0.3;
const ALPHA = 0.98;


// ==========================================
// VARIÁVEIS
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

let Q = 0.05;
let R = 0.5;

let x_estX = 0;
let x_estY = 0;
let x_estZ = 0;

let PX = 1;
let PY = 1;
let PZ = 1;


// ==========================================
// FUNÇÕES
// ==========================================

function filtro(valor, limite = 0.1) {

    return Math.abs(valor) < limite
        ? 0
        : valor;

}

function filtroKalman(valor, eixo) {

    let x_est, P;

    if (eixo === "x") {
        x_est = x_estX;
        P = PX;
    }

    if (eixo === "y") {
        x_est = x_estY;
        P = PY;
    }

    if (eixo === "z") {
        x_est = x_estZ;
        P = PZ;
    }

    let x_pred = x_est;
    let P_pred = P + Q;

    let K = P_pred / (P_pred + R);

    x_est = x_pred + K * (valor - x_pred);

    P = (1 - K) * P_pred;

    if (eixo === "x") {
        x_estX = x_est;
        PX = P;
    }

    if (eixo === "y") {
        x_estY = x_est;
        PY = P;
    }

    if (eixo === "z") {
        x_estZ = x_est;
        PZ = P;
    }

    return x_est;
}

function calcularRMS(buffer) {

    if (buffer.length === 0) return 0;

    const soma = buffer.reduce((acc, v) => {

        return acc + v * v;

    }, 0);

    return Math.sqrt(soma / buffer.length);

}


// ==========================================
// RECEBER DADOS DO ESP32
// ==========================================
router.get("/dados", async (req, res) => {
    try {
        let ax = parseFloat(req.query.ax);
        let ay = parseFloat(req.query.ay);
        let az = parseFloat(req.query.az);

        let gx = parseFloat(req.query.gx);
        let gy = parseFloat(req.query.gy);
        let gz = parseFloat(req.query.gz);

        // Se falhar a leitura do sensor, ignora para não quebrar o cálculo
        if (isNaN(ax) || isNaN(ay) || isNaN(az)) {
            return res.status(400).json({ erro: "Dados inválidos" });
        }

        // ==========================
        // Calibração com múltiplas amostras

        // No início do router.get("/dados")
        if (!calibrado) {
            amostrasCalibracao.push({ax, ay, az});
            
            if (amostrasCalibracao.length >= NUM_AMOSTRAS_CALIB) {
                // Calcula média das amostras
                offsetX = amostrasCalibracao.reduce((s, v) => s + v.ax, 0) / NUM_AMOSTRAS_CALIB;
                offsetY = amostrasCalibracao.reduce((s, v) => s + v.ay, 0) / NUM_AMOSTRAS_CALIB;
                offsetZ = amostrasCalibracao.reduce((s, v) => s + v.az, 0) / NUM_AMOSTRAS_CALIB;
                
                // Ajuste para gravidade (espera-se ~1G no eixo Z quando parado)
                // offsetZ = offsetZ - 1.0; // Remove a gravidade
                
                calibrado = true;
                console.log(`Calibração concluída: X:${offsetX}, Y:${offsetY}, Z:${offsetZ}`);
            }
            return res.json({ status: "calibrando", progresso: amostrasCalibracao.length / NUM_AMOSTRAS_CALIB });
        }

        // ==========================
        // 2. REMOVE OFFSET (Zera a gravidade ANTES de converter a escala)
        // ==========================
        ax -= offsetX;
        ay -= offsetY;
        az -= offsetZ;

        // ==========================
        // 3. CONVERTE PARA m/s²
        // ==========================
        ax *= 9.81;
        ay *= 9.81;
        az *= 9.81;

        // ==========================
        // 4. FILTROS DE RUÍDO (Kalman e Passa-Alta)
        // ==========================
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

        // Deadzone para evitar oscilação de milésimos parada
        // LIMITADOR

        filtroX = Math.max(Math.min(filtroX, 8), -8);
        filtroY = Math.max(Math.min(filtroY, 8), -8);
        filtroZ = Math.max(Math.min(filtroZ, 8), -8);

        // ==========================
        // BUFFER E RMS (O restante permanece igual)
        // ==========================
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

        const total = Math.sqrt(
            rmsX * rmsX +
            rmsY * rmsY +
            rmsZ * rmsZ
        );

        console.log("TOTAL:", total);

        // ... (Mantenha o código daqui para baixo exatamente como estava para salvar no Banco de Dados)

        // ==========================
        // ESTADO
        // ==========================

        if (estadoAtual === "ok") {

            if (total >= 1.5 && total < 4) {
                estadoAtual = "alerta";
            }

            else if (total >= 4) {
                estadoAtual = "erro";
            }

        }

        else if (estadoAtual === "alerta") {

            if (total < 1.2) {
                estadoAtual = "ok";
            }

            else if (total >= 4) {
                estadoAtual = "erro";
            }

        }

        else if (estadoAtual === "erro") {

            if (total < 3.5) {
                estadoAtual = "alerta";
            }

        }

        if (estadoAtual === "ok") {

            ultimoEstadoSalvo = "ok";

        }

        // ==========================
        // SALVAR DADOS
        // ==========================

        const agora = Date.now();

        // salva apenas a cada 5 segundos
        if (agora - ultimoSalvamento > 5000) {

            ultimoSalvamento = agora;

            await pool.query(
                `
                INSERT INTO tb_dados
                (
                    fk_motor,
                    fk_sensor,
                    valor,
                    unidade,
                    horario
                )
                VALUES (?, ?, ?, ?, NOW())
                `,
                [
                    1,
                    1,
                    total,
                    "m/s²"
                ]
            );

        }

        // ==========================
        // ALERTAS
        // ==========================

        if (
            estadoAtual !== "ok" &&
            estadoAtual !== ultimoEstadoSalvo
        ) {

            await pool.query(
                `
                INSERT INTO tb_alertas
                (
                    fk_motor,
                    fk_sensor,
                    tipo_alerta,
                    valor_detectado,
                    horario,
                    nivel_alerta
                )
                VALUES (?, ?, ?, ?, NOW(), ?)
                `,
                [
                    1,
                    1,
                    "VIBRACAO",
                    total,
                    estadoAtual
                ]
            );
            ultimoEstadoSalvo = estadoAtual;

        }

        // ==========================
        // ATUALIZA STATUS MOTOR
        // ==========================

        await pool.query(
            `
            UPDATE tb_status_motor
            SET
                estado = ?,
                valor_vibracao = ?,
                ultima_atualizacao = NOW()
            WHERE fk_motor = ?
            `,
            [
                estadoAtual,
                total,
                1
            ]
        );

        res.json({
            aceleracaoX: rmsX,
            aceleracaoY: rmsY,
            aceleracaoZ: rmsZ,
            aceleracaoTotal: total,
            unidade: "m/s²",
            estado: estadoAtual
        });

    }

    catch (erro) {

        console.log(erro);

        res.status(500).json({
            erro: "Erro no servidor"
        });

    }

});


// ==========================================
// BUSCAR ÚLTIMOS DADOS
// ==========================================

router.get("/ultimos", async (req, res) => {

    try {

        const [dados] = await pool.query(
            `
            SELECT *
            FROM tb_dados
            ORDER BY horario DESC
            LIMIT 20
            `
        );

        res.json(dados);

    }

    catch (erro) {

        console.log(erro);

        res.status(500).json({
            erro: "Erro ao buscar dados"
        });

    }

});



module.exports = router;