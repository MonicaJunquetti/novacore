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

// EDITAR PERFIL
router.put("/editar/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, email, senha } = req.body;
  try {
    // se vier senha nova
    if (senha && senha.trim() !== "") {
      const senhaHash = await bcrypt.hash(senha, 10);
      const sql = `
        UPDATE tb_usuarios
        SET
          nome_usuario = ?,
          email_usuario = ?,
          senha_usuario = ?
        WHERE id_usuario = ?
      `;
      db.query(
        sql,
        [nome, email, senhaHash, id],
        (err, result) => {

          if (err)
            return res.status(500).json(err);

          res.json({
            message: "Perfil atualizado!"
          });
        }
      );
    }
    // sem alterar senha
    else {

      const sql = `
        UPDATE tb_usuarios
        SET
          nome_usuario = ?,
          email_usuario = ?
        WHERE id_usuario = ?
      `;
      db.query(
        sql,
        [nome, email, id],
        (err, result) => {

          if (err)
            return res.status(500).json(err);

          res.json({
            message: "Perfil atualizado!"
          });
        }
      );
    }
  }

  catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;