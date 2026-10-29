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
    const { dashboard_id } = req.query;

    let joinDashboard = "";
    let whereClause = "";
    let queryParams = [];

    if (dashboard_id) {
      joinDashboard = " INNER JOIN tb_motores m ON s.fk_motor = m.id_motor ";
      whereClause = " AND m.fk_dashboard = ? ";
      queryParams = [dashboard_id];
    }

    // Queries dinâmicas filtrando por dashboard quando enviado
    const qNormalVibra = pool.query(
      `SELECT COUNT(*) AS total FROM tb_status_motor s ${joinDashboard} WHERE s.estado = 'ok' ${whereClause}`,
      queryParams
    );
    const qNormalTemp = pool.query(
      `SELECT COUNT(*) AS total FROM tb_status_temp s ${joinDashboard} WHERE s.estado = 'ok' ${whereClause}`,
      queryParams
    );

    const qAlertaVibra = pool.query(
      `SELECT COUNT(*) AS total FROM tb_status_motor s ${joinDashboard} WHERE s.estado = 'alerta' ${whereClause}`,
      queryParams
    );
    const qAlertaTemp = pool.query(
      `SELECT COUNT(*) AS total FROM tb_status_temp s ${joinDashboard} WHERE s.estado = 'alerta' ${whereClause}`,
      queryParams
    );

    const qCriticoVibra = pool.query(
      `SELECT COUNT(*) AS total FROM tb_status_motor s ${joinDashboard} WHERE s.estado = 'erro' ${whereClause}`,
      queryParams
    );
    const qCriticoTemp = pool.query(
      `SELECT COUNT(*) AS total FROM tb_status_temp s ${joinDashboard} WHERE s.estado = 'erro' ${whereClause}`,
      queryParams
    );

    const [
      resNormVibra, resNormTemp,
      resAlerVibra, resAlerTemp,
      resCritVibra, resCritTemp
    ] = await Promise.all([
      qNormalVibra, qNormalTemp,
      qAlertaVibra, qAlertaTemp,
      qCriticoVibra, qCriticoTemp
    ]);

    const nVibra = Number(resNormVibra[0][0].total);
    const nTemp  = Number(resNormTemp[0][0].total);

    const aVibra = Number(resAlerVibra[0][0].total);
    const aTemp  = Number(resAlerTemp[0][0].total);

    const cVibra = Number(resCritVibra[0][0].total);
    const cTemp  = Number(resCritTemp[0][0].total);

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