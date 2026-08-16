/* =====================================================
   CHÁ DE CASA NOVA
   BACKEND - SERVER.JS
===================================================== */

const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");
const session = require("express-session");
const bcrypt = require("bcryptjs");


/* =====================================================
   CONFIGURAÇÕES
===================================================== */

const app = express();

const PORT = 3000;


/* =====================================================
   ADMINISTRADOR
===================================================== */

const ADMIN_USERNAME = "admin";

/*
   Hash bcrypt da senha do administrador.
   A senha original NÃO fica armazenada aqui.
*/

const ADMIN_PASSWORD_HASH = "$2b$12$3nDHztfxZEgHhW3Bf.6mpuunAxV8cX/eZTR7cCOiyB4K2k6fqxkG6";


/* =====================================================
   MIDDLEWARES
===================================================== */

app.use(
    express.json({
        limit: "100kb"
    })
);

app.use(
    express.urlencoded({
        extended: true
    })
);


/* =====================================================
   SESSÃO
===================================================== */

app.use(
    session({

        secret:
            "cha-de-casa-nova-chave-secreta-troque-esta-chave",

        resave:
            false,

        saveUninitialized:
            false,

        cookie: {

            httpOnly:
                true,

            maxAge:
                1000 *
                60 *
                60 *
                8

        }

    })
);


/* =====================================================
   BANCO DE DADOS
===================================================== */

const db = new Database(
    path.join(
        __dirname,
        "database.db"
    )
);

console.log(
    "Banco de dados conectado."
);


/* =====================================================
   TABELA DE PRESENÇAS
===================================================== */

db.prepare(`

    CREATE TABLE IF NOT EXISTS presencas (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        nome TEXT NOT NULL UNIQUE COLLATE NOCASE,

        status TEXT NOT NULL,

        data DATETIME DEFAULT CURRENT_TIMESTAMP

    )

`).run();

console.log(
    "Tabela de presenças pronta."
);


/* =====================================================
   TABELA DE PRESENTES
===================================================== */

db.prepare(`

    CREATE TABLE IF NOT EXISTS presentes (

        id INTEGER PRIMARY KEY,

        nome TEXT NOT NULL,

        icone TEXT NOT NULL

    )

`).run();

console.log(
    "Tabela de presentes pronta."
);


/* =====================================================
   TABELA DE ESCOLHAS
===================================================== */

db.prepare(`

    CREATE TABLE IF NOT EXISTS escolhas_presentes (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        presente_id INTEGER NOT NULL,

        nome_pessoa TEXT NOT NULL COLLATE NOCASE,

        data DATETIME DEFAULT CURRENT_TIMESTAMP,

        UNIQUE (
            presente_id,
            nome_pessoa
        ),

        FOREIGN KEY (
            presente_id
        )
        REFERENCES presentes(id)

    )

`).run();

console.log(
    "Tabela de escolhas pronta."
);


/* =====================================================
   TABELA DE MENSAGENS
===================================================== */

db.prepare(`

    CREATE TABLE IF NOT EXISTS mensagens (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        nome TEXT NOT NULL,

        texto TEXT NOT NULL,

        data DATETIME DEFAULT CURRENT_TIMESTAMP

    )

`).run();

console.log(
    "Tabela de mensagens pronta."
);


/* =====================================================
   PRESENTES PADRÃO
===================================================== */

const presentesPadrao = [

    {
        id: 1,
        nome: "Copos",
        icone: "🥤"
    },

    {
        id: 2,
        nome: "Pratos",
        icone: "🍽️"
    },

    {
        id: 3,
        nome: "Jogo de colheres",
        icone: "🥄"
    },

    {
        id: 4,
        nome: "Panelas",
        icone: "🍳"
    },

    {
        id: 5,
        nome: "Talheres",
        icone: "🍴"
    },

    {
        id: 6,
        nome: "Toalhas",
        icone: "🧺"
    },

    {
        id: 7,
        nome: "Potes",
        icone: "🥣"
    },

    {
        id: 8,
        nome: "Canecas",
        icone: "☕"
    },

    {
        id: 9,
        nome: "Jogo de cama",
        icone: "🛏️"
    },

    {
        id: 10,
        nome: "Tapete",
        icone: "🧶"
    }

];


const inserirPresente = db.prepare(`

    INSERT OR IGNORE INTO presentes

    (
        id,
        nome,
        icone
    )

    VALUES
    (
        ?,
        ?,
        ?
    )

`);


for (const presente of presentesPadrao) {

    inserirPresente.run(
        presente.id,
        presente.nome,
        presente.icone
    );

}

console.log(
    "Presentes padrão carregados."
);


/* =====================================================
   AUTENTICAÇÃO ADMIN
===================================================== */

function requireAdmin(
    req,
    res,
    next
) {

    if (
        req.session &&
        req.session.adminLogado === true
    ) {

        return next();

    }

    return res.status(401).json({

        sucesso: false,

        mensagem:
            "Não autorizado. Faça login como administrador."

    });

}


/* =====================================================
   ARQUIVOS PÚBLICOS
===================================================== */

/*
   IMPORTANTE:

   O express.static NÃO é colocado antes das rotas
   administrativas.

   Isso impede que /admin/index.html seja aberto
   diretamente sem passar pela autenticação.
*/

app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        ),
        {
            index: false
        }
    )
);

/* =====================================================
   PÁGINA PRINCIPAL DO CONVITE
===================================================== */

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "index.html"
            )
        );

    }
);

/* =====================================================
   ARQUIVOS CSS / JS DO ADMIN
===================================================== */

/*
   Os arquivos dentro de:

   public/admin/

   ficam disponíveis através de:

   /admin-assets/

   Exemplos:

   /admin-assets/login.css
   /admin-assets/login.js
   /admin-assets/admin.css
   /admin-assets/admin.js
*/

app.use(
    "/admin-assets",
    express.static(
        path.join(
            __dirname,
            "public",
            "admin"
        )
    )
);


/* =====================================================
   PÁGINA DE LOGIN
===================================================== */

app.get(
    "/admin-login",
    (req, res) => {

        if (
            req.session &&
            req.session.adminLogado === true
        ) {

            return res.redirect(
                "/admin"
            );

        }

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "admin",
                "login.html"
            ),
            erro => {

                if (erro) {

                    console.error(
                        "Erro ao abrir login.html:",
                        erro
                    );

                    return res.status(500).json({

                        sucesso: false,

                        mensagem:
                            "Não foi possível abrir a página de login."

                    });

                }

            }
        );

    }
);


/* =====================================================
   PÁGINA DO PAINEL ADMIN
===================================================== */

app.get(
    "/admin",
    (req, res) => {

        /*
           Verifica a sessão ANTES de entregar
           o index.html.
        */

        if (
            !req.session ||
            req.session.adminLogado !== true
        ) {

            console.log(
                "Acesso ao painel negado. Redirecionando para login."
            );

            return res.redirect(
                "/admin-login"
            );

        }

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "admin",
                "index.html"
            ),
            erro => {

                if (erro) {

                    console.error(
                        "Erro ao abrir index.html:",
                        erro
                    );

                    return res.status(500).send(
                        "Não foi possível abrir o painel administrativo."
                    );

                }

            }
        );

    }
);


/* =====================================================
   LOGIN ADMIN
===================================================== */

app.post(
    "/api/admin/login",
    async (req, res) => {

        try {

            console.log(
                "Tentativa de login recebida."
            );


            const {
                username,
                password
            } = req.body;


            if (
                typeof username !== "string" ||
                typeof password !== "string"
            ) {

                return res.status(400).json({

                    sucesso: false,

                    mensagem:
                        "Digite usuário e senha."

                });

            }


            const usuario =
                username.trim();


            if (
                !usuario ||
                !password
            ) {

                return res.status(400).json({

                    sucesso: false,

                    mensagem:
                        "Digite usuário e senha."

                });

            }


            if (
                usuario !== ADMIN_USERNAME
            ) {

                console.log(
                    "Usuário incorreto."
                );

                return res.status(401).json({

                    sucesso: false,

                    mensagem:
                        "Usuário ou senha incorretos."

                });

            }


            console.log(
                "Usuário correto. Verificando senha..."
            );


            const senhaCorreta =
                await bcrypt.compare(
                    password,
                    ADMIN_PASSWORD_HASH
                );


            if (!senhaCorreta) {

                console.log(
                    "Senha incorreta."
                );

                return res.status(401).json({

                    sucesso: false,

                    mensagem:
                        "Usuário ou senha incorretos."

                });

            }


            console.log(
                "Senha correta. Criando sessão..."
            );


            req.session.adminLogado =
                true;

            req.session.adminUsername =
                ADMIN_USERNAME;


            req.session.save(
                erro => {

                    if (erro) {

                        console.error(
                            "Erro ao salvar sessão:",
                            erro
                        );

                        return res.status(500).json({

                            sucesso: false,

                            mensagem:
                                "Erro ao criar sessão."

                        });

                    }


                    console.log(
                        "Login realizado com sucesso."
                    );


                    return res.json({

                        sucesso: true,

                        mensagem:
                            "Login realizado com sucesso."

                    });

                }
            );

        } catch (erro) {

            console.error(
                "ERRO NO LOGIN:",
                erro
            );

            return res.status(500).json({

                sucesso: false,

                mensagem:
                    "Erro interno do servidor."

            });

        }

    }
);


/* =====================================================
   VERIFICAR SESSÃO
===================================================== */

app.get(
    "/api/admin/sessao",
    (req, res) => {

        if (
            req.session &&
            req.session.adminLogado === true
        ) {

            return res.json({

                logado: true,

                autenticado: true,

                sucesso: true,

                username:
                    req.session.adminUsername ||
                    ADMIN_USERNAME

            });

        }

        return res.status(401).json({

            logado: false,

            autenticado: false,

            sucesso: false

        });

    }
);


/* =====================================================
   LOGOUT
===================================================== */

app.post(
    "/api/admin/logout",
    (req, res) => {

        req.session.destroy(
            erro => {

                if (erro) {

                    console.error(
                        "Erro no logout:",
                        erro
                    );

                    return res.status(500).json({

                        sucesso: false,

                        mensagem:
                            "Erro ao sair."

                    });

                }

                res.clearCookie(
                    "connect.sid"
                );

                return res.json({

                    sucesso: true,

                    mensagem:
                        "Logout realizado."

                });

            }
        );

    }
);


/* =====================================================
   API DE TESTE
===================================================== */

app.get(
    "/api/teste",
    (req, res) => {

        res.json({

            sucesso: true,

            mensagem:
                "Backend funcionando!"

        });

    }
);


/* =====================================================
   ================= PRESENÇAS =========================
===================================================== */


/* =====================================================
   CONFIRMAR / ATUALIZAR PRESENÇA
===================================================== */

app.post(
    "/api/rsvp",
    (req, res) => {

        try {

            const {
                nome,
                status
            } = req.body;


            if (
                typeof nome !== "string" ||
                nome.trim() === ""
            ) {

                return res.status(400).json({

                    sucesso: false,

                    mensagem:
                        "Digite seu nome."

                });

            }


            const nomeLimpo =
                nome.trim();


            if (
                nomeLimpo.length > 30
            ) {

                return res.status(400).json({

                    sucesso: false,

                    mensagem:
                        "O nome deve ter no máximo 30 caracteres."

                });

            }


            if (
                status !== "confirmed" &&
                status !== "declined"
            ) {

                return res.status(400).json({

                    sucesso: false,

                    mensagem:
                        "Status de presença inválido."

                });

            }


            const pessoaExistente =
                db.prepare(`

                    SELECT id

                    FROM presencas

                    WHERE nome = ?

                    COLLATE NOCASE

                `).get(
                    nomeLimpo
                );


            if (
                pessoaExistente
            ) {

                db.prepare(`

                    UPDATE presencas

                    SET

                        nome = ?,

                        status = ?,

                        data = CURRENT_TIMESTAMP

                    WHERE id = ?

                `).run(

                    nomeLimpo,

                    status,

                    pessoaExistente.id

                );

            } else {

                db.prepare(`

                    INSERT INTO presencas

                    (
                        nome,
                        status
                    )

                    VALUES
                    (
                        ?,
                        ?
                    )

                `).run(

                    nomeLimpo,

                    status

                );

            }


            res.json({

                sucesso: true,

                mensagem:

                    status === "confirmed"

                        ? `Presença confirmada! Até lá, ${nomeLimpo}!`

                        : `Tudo certo, ${nomeLimpo}. Obrigado por avisar.`

            });

        } catch (erro) {

            console.error(
                "Erro ao salvar presença:",
                erro
            );

            res.status(500).json({

                sucesso: false,

                mensagem:
                    "Erro interno do servidor."

            });

        }

    }
);


/* =====================================================
   LISTAR PRESENÇAS
===================================================== */

app.get(
    "/api/presencas",
    (req, res) => {

        try {

            const presencas =
                db.prepare(`

                    SELECT

                        id,
                        nome,
                        status,
                        data

                    FROM presencas

                    ORDER BY id DESC

                `).all();


            res.json(
                presencas
            );

        } catch (erro) {

            console.error(
                "Erro ao buscar presenças:",
                erro
            );

            res.status(500).json({

                sucesso: false,

                mensagem:
                    "Erro ao buscar presenças."

            });

        }

    }
);


/* =====================================================
   ESTATÍSTICAS
===================================================== */

app.get(
    "/api/presencas/stats",
    (req, res) => {

        try {

            const resultado =
                db.prepare(`

                    SELECT

                        SUM(

                            CASE

                                WHEN status = 'confirmed'

                                THEN 1

                                ELSE 0

                            END

                        ) AS confirmados,

                        SUM(

                            CASE

                                WHEN status = 'declined'

                                THEN 1

                                ELSE 0

                            END

                        ) AS recusados

                    FROM presencas

                `).get();


            res.json({

                confirmados:
                    resultado.confirmados || 0,

                recusados:
                    resultado.recusados || 0

            });

        } catch (erro) {

            console.error(
                "Erro nas estatísticas:",
                erro
            );

            res.status(500).json({

                sucesso: false,

                mensagem:
                    "Erro ao buscar estatísticas."

            });

        }

    }
);


/* =====================================================
   ================= PRESENTES =========================
===================================================== */


/* =====================================================
   LISTAR PRESENTES
===================================================== */

app.get(
    "/api/presentes",
    (req, res) => {

        try {

            const presentes =
                db.prepare(`

                    SELECT

                        p.id,

                        p.nome,

                        p.icone,

                        e.id AS escolha_id,

                        e.nome_pessoa,

                        e.data

                    FROM presentes p

                    LEFT JOIN escolhas_presentes e

                        ON e.presente_id = p.id

                    ORDER BY p.id ASC

                `).all();


            const resultado = [];


            for (
                const presente of presentes
            ) {

                let item =
                    resultado.find(
                        p =>
                            p.id ===
                            presente.id
                    );


                if (!item) {

                    item = {

                        id:
                            presente.id,

                        name:
                            presente.nome,

                        icon:
                            presente.icone,

                        people: []

                    };


                    resultado.push(
                        item
                    );

                }


                if (
                    presente.nome_pessoa
                ) {

                    item.people.push({

                        id:
                            presente.escolha_id,

                        name:
                            presente.nome_pessoa,

                        date:
                            presente.data

                    });

                }

            }


            res.json(
                resultado
            );

        } catch (erro) {

            console.error(
                "Erro ao buscar presentes:",
                erro
            );

            res.status(500).json({

                sucesso: false,

                mensagem:
                    "Erro ao buscar presentes."

            });

        }

    }
);


/* =====================================================
   ESCOLHER PRESENTE
===================================================== */

app.post(
    "/api/presentes/escolher",
    (req, res) => {

        try {

            const {
                presenteId,
                nome
            } = req.body;


            if (
                typeof nome !== "string" ||
                nome.trim() === ""
            ) {

                return res.status(400).json({

                    sucesso: false,

                    mensagem:
                        "Digite seu nome."

                });

            }


            const nomeLimpo =
                nome.trim();


            if (
                nomeLimpo.length > 30
            ) {

                return res.status(400).json({

                    sucesso: false,

                    mensagem:
                        "O nome deve ter no máximo 30 caracteres."

                });

            }


            if (
                !Number.isInteger(
                    presenteId
                )
            ) {

                return res.status(400).json({

                    sucesso: false,

                    mensagem:
                        "Presente inválido."

                });

            }


            const presente =
                db.prepare(`

                    SELECT

                        id,
                        nome

                    FROM presentes

                    WHERE id = ?

                `).get(
                    presenteId
                );


            if (!presente) {

                return res.status(404).json({

                    sucesso: false,

                    mensagem:
                        "Esse presente não existe."

                });

            }


            const escolhaExistente =
                db.prepare(`

                    SELECT id

                    FROM escolhas_presentes

                    WHERE

                        presente_id = ?

                        AND nome_pessoa = ?

                        COLLATE NOCASE

                `).get(

                    presenteId,

                    nomeLimpo

                );


            if (
                escolhaExistente
            ) {

                return res.status(400).json({

                    sucesso: false,

                    mensagem:
                        "Você já escolheu este presente."

                });

            }


            db.prepare(`

                INSERT INTO escolhas_presentes

                (
                    presente_id,
                    nome_pessoa
                )

                VALUES
                (
                    ?,
                    ?
                )

            `).run(

                presenteId,

                nomeLimpo

            );


            console.log(
                "Novo presente escolhido:",
                presente.nome,
                "-",
                nomeLimpo
            );


            res.json({

                sucesso: true,

                mensagem:
                    `${nomeLimpo}, sua escolha foi registrada!`

            });

        } catch (erro) {

            console.error(
                "Erro ao escolher presente:",
                erro
            );

            res.status(500).json({

                sucesso: false,

                mensagem:
                    "Erro ao registrar presente."

            });

        }

    }
);


/* =====================================================
   REMOVER ESCOLHA
===================================================== */

app.delete(
    "/api/presentes/escolher",
    (req, res) => {

        try {

            const {
                presenteId,
                nome
            } = req.body;


            if (
                !Number.isInteger(
                    presenteId
                )
            ) {

                return res.status(400).json({

                    sucesso: false,

                    mensagem:
                        "Presente inválido."

                });

            }


            if (
                typeof nome !== "string" ||
                nome.trim() === ""
            ) {

                return res.status(400).json({

                    sucesso: false,

                    mensagem:
                        "Nome inválido."

                });

            }


            const resultado =
                db.prepare(`

                    DELETE FROM escolhas_presentes

                    WHERE

                        presente_id = ?

                        AND nome_pessoa = ?

                        COLLATE NOCASE

                `).run(

                    presenteId,

                    nome.trim()

                );


            if (
                resultado.changes === 0
            ) {

                return res.status(404).json({

                    sucesso: false,

                    mensagem:
                        "Essa escolha não foi encontrada."

                });

            }


            res.json({

                sucesso: true,

                mensagem:
                    "Sua escolha foi removida."

            });

        } catch (erro) {

            console.error(
                "Erro ao remover presente:",
                erro
            );

            res.status(500).json({

                sucesso: false,

                mensagem:
                    "Erro ao remover escolha."

            });

        }

    }
);


/* =====================================================
   ================= MENSAGENS =========================
===================================================== */


/* =====================================================
   ENVIAR MENSAGEM
===================================================== */

app.post(
    "/api/mensagens",
    (req, res) => {

        try {

            const {
                nome,
                texto
            } = req.body;


            if (
                typeof nome !== "string" ||
                nome.trim() === ""
            ) {

                return res.status(400).json({

                    sucesso: false,

                    mensagem:
                        "Digite seu nome."

                });

            }


            if (
                typeof texto !== "string" ||
                texto.trim() === ""
            ) {

                return res.status(400).json({

                    sucesso: false,

                    mensagem:
                        "Escreva uma mensagem."

                });

            }


            const nomeLimpo =
                nome.trim();


            const textoLimpo =
                texto.trim();


            if (
                nomeLimpo.length > 30
            ) {

                return res.status(400).json({

                    sucesso: false,

                    mensagem:
                        "O nome deve ter no máximo 30 caracteres."

                });

            }


            if (
                textoLimpo.length > 250
            ) {

                return res.status(400).json({

                    sucesso: false,

                    mensagem:
                        "A mensagem deve ter no máximo 250 caracteres."

                });

            }


            const resultado =
                db.prepare(`

                    INSERT INTO mensagens

                    (
                        nome,
                        texto
                    )

                    VALUES
                    (
                        ?,
                        ?
                    )

                `).run(

                    nomeLimpo,

                    textoLimpo

                );


            res.json({

                sucesso: true,

                id:
                    resultado.lastInsertRowid,

                mensagem:
                    "Mensagem enviada!"

            });

        } catch (erro) {

            console.error(
                "Erro ao salvar mensagem:",
                erro
            );

            res.status(500).json({

                sucesso: false,

                mensagem:
                    "Erro ao enviar mensagem."

            });

        }

    }
);


/* =====================================================
   LISTAR MENSAGENS
===================================================== */

app.get(
    "/api/mensagens",
    (req, res) => {

        try {

            const mensagens =
                db.prepare(`

                    SELECT

                        id,
                        nome,
                        texto,
                        data

                    FROM mensagens

                    ORDER BY id DESC

                `).all();


            res.json(
                mensagens
            );

        } catch (erro) {

            console.error(
                "Erro ao buscar mensagens:",
                erro
            );

            res.status(500).json({

                sucesso: false,

                mensagem:
                    "Erro ao buscar mensagens."

            });

        }

    }
);


/* =====================================================
   ================= ROTAS ADMIN =======================
===================================================== */


/* =====================================================
   ADMIN - RESUMO
===================================================== */

app.get(
    "/api/admin/resumo",
    requireAdmin,
    (req, res) => {

        try {

            const presencas =
                db.prepare(`

                    SELECT

                        COUNT(*) AS total,

                        SUM(

                            CASE

                                WHEN status = 'confirmed'

                                THEN 1

                                ELSE 0

                            END

                        ) AS confirmados,

                        SUM(

                            CASE

                                WHEN status = 'declined'

                                THEN 1

                                ELSE 0

                            END

                        ) AS recusados

                    FROM presencas

                `).get();


            const presentes =
                db.prepare(`

                    SELECT COUNT(*) AS total

                    FROM escolhas_presentes

                `).get();


            const mensagens =
                db.prepare(`

                    SELECT COUNT(*) AS total

                    FROM mensagens

                `).get();


            res.json({

                sucesso: true,

                convidados: {

                    total:
                        presencas.total || 0,

                    confirmados:
                        presencas.confirmados || 0,

                    recusados:
                        presencas.recusados || 0

                },

                presentes:
                    presentes.total || 0,

                mensagens:
                    mensagens.total || 0

            });

        } catch (erro) {

            console.error(
                "Erro no resumo:",
                erro
            );

            res.status(500).json({

                sucesso: false,

                mensagem:
                    "Erro ao buscar resumo."

            });

        }

    }
);


/* =====================================================
   ADMIN - CONVIDADOS
===================================================== */

app.get(
    "/api/admin/convidados",
    requireAdmin,
    (req, res) => {

        try {

            const convidados =
                db.prepare(`

                    SELECT

                        id,
                        nome,
                        status,
                        data

                    FROM presencas

                    ORDER BY

                        CASE

                            WHEN status = 'confirmed'

                            THEN 1

                            ELSE 2

                        END,

                        nome COLLATE NOCASE ASC

                `).all();


            res.json({

                sucesso: true,

                convidados:
                    convidados

            });

        } catch (erro) {

            console.error(
                "Erro ao buscar convidados:",
                erro
            );

            res.status(500).json({

                sucesso: false,

                mensagem:
                    "Erro ao buscar convidados."

            });

        }

    }
);


/* =====================================================
   ADMIN - PRESENTES
===================================================== */

app.get(
    "/api/admin/presentes",
    requireAdmin,
    (req, res) => {

        try {

            const presentes =
                db.prepare(`

                    SELECT

                        p.id,

                        p.nome,

                        p.icone,

                        e.id AS escolha_id,

                        e.nome_pessoa,

                        e.data

                    FROM presentes p

                    LEFT JOIN escolhas_presentes e

                        ON e.presente_id = p.id

                    ORDER BY

                        p.id ASC,

                        e.data ASC

                `).all();


            const resultado = [];


            presentes.forEach(
                presente => {

                    let item =
                        resultado.find(
                            p =>
                                p.id ===
                                presente.id
                        );


                    if (!item) {

                        item = {

                            id:
                                presente.id,

                            nome:
                                presente.nome,

                            icone:
                                presente.icone,

                            pessoas: []

                        };


                        resultado.push(
                            item
                        );

                    }


                    if (
                        presente.nome_pessoa
                    ) {

                        item.pessoas.push({

                            id:
                                presente.escolha_id,

                            nome:
                                presente.nome_pessoa,

                            data:
                                presente.data

                        });

                    }

                }
            );


            res.json({

                sucesso: true,

                presentes:
                    resultado

            });

        } catch (erro) {

            console.error(
                "Erro ao buscar presentes:",
                erro
            );

            res.status(500).json({

                sucesso: false,

                mensagem:
                    "Erro ao buscar presentes."

            });

        }

    }
);


/* =====================================================
   ADMIN - MENSAGENS
===================================================== */

app.get(
    "/api/admin/mensagens",
    requireAdmin,
    (req, res) => {

        try {

            const mensagens =
                db.prepare(`

                    SELECT

                        id,
                        nome,
                        texto,
                        data

                    FROM mensagens

                    ORDER BY id DESC

                `).all();


            res.json({

                sucesso: true,

                mensagens:
                    mensagens

            });

        } catch (erro) {

            console.error(
                "Erro ao buscar mensagens:",
                erro
            );

            res.status(500).json({

                sucesso: false,

                mensagem:
                    "Erro ao buscar mensagens."

            });

        }

    }
);


/* =====================================================
   ADMIN - EXCLUIR CONVIDADO
===================================================== */

app.delete(
    "/api/admin/convidados/:id",
    requireAdmin,
    (req, res) => {

        try {

            const id =
                Number(
                    req.params.id
                );


            if (
                !Number.isInteger(id)
            ) {

                return res.status(400).json({

                    sucesso: false,

                    mensagem:
                        "ID inválido."

                });

            }


            const resultado =
                db.prepare(`

                    DELETE FROM presencas

                    WHERE id = ?

                `).run(id);


            if (
                resultado.changes === 0
            ) {

                return res.status(404).json({

                    sucesso: false,

                    mensagem:
                        "Convidado não encontrado."

                });

            }


            res.json({

                sucesso: true,

                mensagem:
                    "Convidado removido."

            });

        } catch (erro) {

            console.error(
                "Erro ao remover convidado:",
                erro
            );

            res.status(500).json({

                sucesso: false,

                mensagem:
                    "Erro ao remover convidado."

            });

        }

    }
);


/* =====================================================
   ADMIN - BANCO
===================================================== */

app.get(
    "/api/banco",
    requireAdmin,
    (req, res) => {

        try {

            const presencas =
                db.prepare(`

                    SELECT COUNT(*) AS total

                    FROM presencas

                `).get();


            const escolhas =
                db.prepare(`

                    SELECT COUNT(*) AS total

                    FROM escolhas_presentes

                `).get();


            const mensagens =
                db.prepare(`

                    SELECT COUNT(*) AS total

                    FROM mensagens

                `).get();


            res.json({

                banco:
                    "SQLite",

                presencas:
                    presencas.total,

                escolhasPresentes:
                    escolhas.total,

                mensagens:
                    mensagens.total

            });

        } catch (erro) {

            console.error(
                "Erro ao consultar banco:",
                erro
            );

            res.status(500).json({

                sucesso: false,

                mensagem:
                    "Erro ao consultar banco."

            });

        }

    }
);


/* =====================================================
   ROTA 404
===================================================== */

app.use(
    (req, res) => {

        if (
            req.path.startsWith("/api/")
        ) {

            return res.status(404).json({

                sucesso: false,

                mensagem:
                    "Rota não encontrada."

            });

        }


        res.status(404).send(
            "Página não encontrada."
        );

    }
);


/* =====================================================
   TRATAMENTO DE ERROS
===================================================== */

app.use(
    (erro, req, res, next) => {

        console.error(
            "ERRO NÃO TRATADO:",
            erro
        );

        res.status(500).json({

            sucesso: false,

            mensagem:
                "Erro interno do servidor."

        });

    }
);


/* =====================================================
   INICIAR SERVIDOR
===================================================== */

app.listen(
    PORT,
    () => {

        console.log("");

        console.log(
            "======================================"
        );

        console.log(
            "      CHÁ DE CASA NOVA - BACKEND"
        );

        console.log(
            "======================================"
        );

        console.log("");

        console.log(
            `Servidor: http://localhost:${PORT}`
        );

        console.log(
            `Site: http://localhost:${PORT}/`
        );

        console.log(
            `Login admin: http://localhost:${PORT}/admin-login`
        );

        console.log(
            `Painel admin: http://localhost:${PORT}/admin`
        );

        console.log("");

        console.log(
            "API teste: http://localhost:${PORT}/api/teste"
        );

        console.log(
            "Login admin: http://localhost:${PORT}/api/admin/login"
        );

        console.log(
            "Sessão admin: http://localhost:${PORT}/api/admin/sessao"
        );

        console.log("");

        console.log(
            "Servidor iniciado com sucesso!"
        );

        console.log("");

    }
);