const express = require("express");
const router = express.Router();

const db = require("../db");

router.get("/", (req, res) => {

    const sql = `
        SELECT
            a.*,
            m.nome_motor
        FROM tb_alertas a

        LEFT JOIN tb_motores m
        ON m.id_motor = a.fk_motor

        ORDER BY a.horario DESC
        LIMIT 20
    `;

    db.query(sql, (err, rows) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                erro: "Erro ao buscar alertas"
            });

        }

        res.json(rows);

    });

});

module.exports = router;