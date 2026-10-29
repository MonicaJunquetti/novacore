const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/", (req, res) => {
  const mensagem = String(req.body.mensagem || "")
    .trim()
    .toLowerCase();
  const dashboardId = req.body.dashboard_id;

  if (!mensagem) {
    return res.status(400).json({
      resposta: "Digite uma pergunta para continuar.",
    });
  }

  // Se não passar dashboard_id, filtra por 0 (ou seja, nenhum motor retornado)
  const filtroDashboard = dashboardId ? Number(dashboardId) : null;

  // Perguntas sobre a quantidade de motores
  if (
    mensagem.includes("quantos motores") ||
    mensagem.includes("quantidade de motores")
  ) {
    const sql = filtroDashboard
      ? "SELECT COUNT(*) AS total FROM tb_motores WHERE fk_dashboard = ?"
      : "SELECT COUNT(*) AS total FROM tb_motores";
    const params = filtroDashboard ? [filtroDashboard] : [];

    return db.query(sql, params, (erro, resultado) => {
      if (erro) {
        console.error("Erro ao consultar motores:", erro);
        return res.status(500).json({
          resposta: "Não consegui consultar os dados agora. Tente novamente.",
        });
      }

      const total = resultado[0]?.total || 0;
      return res.json({
        resposta: filtroDashboard
          ? `Nesta planta existem ${total} motor(es) cadastrado(s).`
          : `Existem ${total} motor(es) cadastrado(s) no sistema.`,
      });
    });
  }

  // Perguntas sobre alertas
  if (mensagem.includes("alerta") || mensagem.includes("alertas")) {
    let sql = `
      SELECT
        a.tipo_alerta,
        a.valor_detectado,
        a.horario,
        a.nivel_alerta,
        m.nome_motor
      FROM tb_alertas a
      INNER JOIN tb_motores m ON m.id_motor = a.fk_motor
    `;
    const params = [];

    if (filtroDashboard) {
      sql += " WHERE m.fk_dashboard = ? ";
      params.push(filtroDashboard);
    }

    sql += " ORDER BY a.horario DESC LIMIT 5";

    return db.query(sql, params, (erro, alertas) => {
      if (erro) {
        console.error("Erro ao consultar alertas:", erro);
        if (res.headersSent) return;
        return res.status(500).json({
          resposta: "Não consegui consultar os alertas agora. Tente novamente.",
        });
      }

      if (res.headersSent) return;

      if (!alertas || alertas.length === 0) {
        return res.json({
          resposta: "Não encontrei alertas recentes registrados para esta planta.",
        });
      }

      const detalhes = alertas.map(
        (a) =>
          `${a.nome_motor || "Motor"}: ${a.tipo_alerta}, nível ${a.nivel_alerta}, valor ${a.valor_detectado}`
      );

      return res.json({
        resposta:
          "Estes são os últimos alertas desta planta:\n" + detalhes.join("\n"),
      });
    });
  }

  // Resposta padrão
  return res.json({
    resposta:
      "Posso ajudar com informações sobre a planta ativa. " +
      "Experimente perguntar 'quantos motores' estão cadastrados " +
      "ou 'quais foram os últimos alertas'.",
  });
});

module.exports = router;