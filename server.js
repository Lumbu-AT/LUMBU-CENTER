const express = require("express");
const session = require("express-session");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const db = new sqlite3.Database("database.db");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.use(session({
  secret: "lumbu_secret",
  resave: false,
  saveUninitialized: true
}));

// Criar tabela de usuários
db.run(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT,
  email TEXT UNIQUE,
  senha TEXT,
  tipo TEXT
)`);

// Rota de cadastro
app.post("/register", (req, res) => {
  const { nome, email, senha, tipo } = req.body;

  db.run(
    "INSERT INTO users (nome, email, senha, tipo) VALUES (?,?,?,?)",
    [nome, email, senha, tipo],
    (err) => {
      if (err) {
        return res.send("Erro: email já cadastrado.");
      }
      res.send("Cadastro realizado! Faça login.");
    }
  );
});

// Rota de login
app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  db.get(
    "SELECT * FROM users WHERE email = ? AND senha = ?",
    [email, senha],
    (err, user) => {
      if (!user) {
        return res.send("Email ou senha inválidos.");
      }

      req.session.user = user;
      res.redirect("/painel.html");
    }
  );
});

// Rota para verificar sessão
app.get("/me", (req, res) => {
  if (!req.session.user) {
    return res.json({ logged: false });
  }
  res.json({ logged: true, user: req.session.user });
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
