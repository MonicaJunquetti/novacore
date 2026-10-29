const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
    const { dashboard_id } = req.query; // 👈 Pega o ID do dashboard da query string

    let sql = `
        SELECT
            a.*,
            m.nome_motor
        FROM tb_alertas a
        LEFT JOIN tb_motores m ON m.id_motor = a.fk_motor
    `;

    const params = [];

    // Se o frontend passar ?dashboard_id=X, filtra por ele
    if (dashboard_id) {
        sql += ` WHERE m.fk_dashboard = ? `;
        params.push(dashboard_id);
    }

    sql += ` ORDER BY a.horario DESC LIMIT 20 `;

    db.query(sql, params, (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ erro: "Erro ao buscar alertas" });
        }
        res.json(rows);
    });
});

module.exports = router;