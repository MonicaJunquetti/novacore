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
// VARIÁVEIS DE CONTROLE
// ==========================================
let ultimoSalvamento = 0;

// ==========================================
// RECEBER DADOS DO SENSOR (TEMPERATURA)
// ==========================================
router.get("/dados", async (req, res) => {
    try {
        // Captura os dados via Query String (Ex: /dados?Tc=35.5&motor=1)
        const temperatura = parseFloat(req.query.Tc);
        const idMotor = parseInt(req.query.motor) || 1;
        const idSensor = parseInt(req.query.sensor) || 1;
        const unidade = req.query.unidade || "C";

        if (isNaN(temperatura)) {
            return res.status(400).json({ erro: "Temperatura inválida" });
        }

        const agora = Date.now();

        // ==========================================
        // SALVAR NO BANCO (A cada 5 segundos)
        // ==========================================
        if (agora - ultimoSalvamento > 5000) {
            ultimoSalvamento = agora;

            await pool.query(
                `INSERT INTO tb_dados (fk_motor, fk_sensor, valor, unidade, horario) 
                 VALUES (?, ?, ?, ?, NOW())`,
                [idMotor, idSensor, temperatura, unidade]
            );
            console.log(`>>> Salvo: ${temperatura}${unidade}`);
        }

        // Retorna o dado processado para o React Native ou ESP32
        res.json({
            temperatura,
            unidade,
            proximo_salvamento_em: 5000 - (agora - ultimoSalvamento)
        });

    } catch (erro) {
        console.error("Erro no servidor:", erro);
        res.status(500).json({ erro: "Erro ao processar dados" });
    }
});

// ==========================================
// BUSCAR HISTÓRICO (Para o gráfico no React Native)
// ==========================================
router.get("/ultimos", async (req, res) => {
    try {
        const [dados] = await pool.query(
            "SELECT * FROM tb_dados ORDER BY horario DESC LIMIT 20"
        );
        console.log(`>>> App solicitou dados. Enviando ${dados.length} registros.`);
        res.json(dados);
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao buscar dados" });
    }
});



module.exports = router;