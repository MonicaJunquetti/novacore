const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "db_novacore"
});

connection.connect((err) => {
  if (err) {
    console.error("Erro ao conectar:", err);
  } else {
    console.log("Banco conectado!");
  }
});

module.exports = connection;