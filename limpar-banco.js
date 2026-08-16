const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(
    path.join(__dirname, "database.db")
);

console.log("Limpando dados de teste...");

db.prepare("DELETE FROM presencas").run();

db.prepare("DELETE FROM escolhas_presentes").run();

db.prepare("DELETE FROM mensagens").run();

console.log("Presenças apagadas.");
console.log("Escolhas de presentes apagadas.");
console.log("Mensagens apagadas.");

db.close();

console.log("Banco limpo com sucesso!");    