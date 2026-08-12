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

router.get('/status-contagem', async (req, res) => {
  try {
    // 1. Criamos as promessas usando a variável 'pool' correta
    const qNormalVibra = pool.query("SELECT COUNT(*) AS total FROM tb_status_motor WHERE estado = 'ok'");
    const qNormalTemp  = pool.query("SELECT COUNT(*) AS total FROM tb_status_temp WHERE estado = 'ok'");

    const qAlertaVibra = pool.query("SELECT COUNT(*) AS total FROM tb_status_motor WHERE estado = 'alerta'");
    const qAlertaTemp  = pool.query("SELECT COUNT(*) AS total FROM tb_status_temp WHERE estado = 'alerta'");

    const qCriticoVibra = pool.query(
    "SELECT COUNT(*) AS total FROM tb_status_motor WHERE estado = 'erro'"
    );

    const qCriticoTemp = pool.query(
    "SELECT COUNT(*) AS total FROM tb_status_temp WHERE estado = 'erro'"
    );

    // 2. Executamos em paralelo
    const [
      resNormVibra, resNormTemp,
      resAlerVibra, resAlerTemp,
      resCritVibra, resCritTemp
    ] = await Promise.all([
      qNormalVibra, qNormalTemp,
      qAlertaVibra, qAlertaTemp,
      qCriticoVibra, qCriticoTemp
    ]);

    // 3. Estrutura correta para extrair dados no pacote mysql2: [rows]
    const nVibra = Number(resNormVibra[0][0].total);
    const nTemp  = Number(resNormTemp[0][0].total);

    const aVibra = Number(resAlerVibra[0][0].total);
    const aTemp  = Number(resAlerTemp[0][0].total);

    const cVibra = Number(resCritVibra[0][0].total);
    const cTemp  = Number(resCritTemp[0][0].total);

    console.log({
    nVibra,
    nTemp,
    aVibra,
    aTemp,
    cVibra,
    cTemp
    });

    // 4. Retorno limpo para o front-end
    return res.json({
      normal: nVibra + nTemp,
      alerta: aVibra + aTemp,
      critico: cVibra + cTemp
    });

  } catch (error) {
    console.error("Erro interno no backend:", error);
    return res.status(500).json({ error: 'Erro ao buscar contagens dos motores' });
  }
});

module.exports = router;