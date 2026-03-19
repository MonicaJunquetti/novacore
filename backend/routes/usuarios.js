const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");


// CADASTRO
router.post("/cadastro", async (req, res) => {
  const { nome, email, senha } = req.body;

  const senhaHash = await bcrypt.hash(senha, 10);

  const sql = `
    INSERT INTO tb_usuarios (nome_usuario, email_usuario, senha_usuario)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [nome, email, senhaHash], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json({ message: "Usuário criado!" });
  });
});


// LOGIN
router.post("/login", (req, res) => {
  const { email, senha } = req.body;

  const sql = "SELECT * FROM tb_usuarios WHERE email_usuario = ?";

  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length === 0) {
      return res.status(401).json({ message: "Usuário não encontrado" });
    }

    const usuario = results[0];

    const senhaValida = await bcrypt.compare(senha, usuario.senha_usuario);

    if (!senhaValida) {
      return res.status(401).json({ message: "Senha inválida" });
    }

    res.json({ message: "Login OK", usuario });
  });
});

module.exports = router;