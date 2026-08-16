const bcrypt = require("bcryptjs");

const usuario = "admin";
const senha = "TROQUE-ESSA-SENHA";

const hash = bcrypt.hashSync(
    senha,
    12
);

console.log("");
console.log("USUÁRIO:");
console.log(usuario);

console.log("");

console.log("HASH DA SENHA:");
console.log(hash);

console.log("");