/* =====================================================
   CHÁ DE CASA NOVA
   BACKEND - SERVER.JS
   BANCO: POSTGRESQL
===================================================== */

const express = require("express");
const path = require("path");
const { Pool } = require("pg");
const session = require("express-session");
const bcrypt = require("bcryptjs");


/* =====================================================
   CONFIGURAÇÕES
===================================================== */

const app = express();

const PORT = process.env.PORT || 3000;

const SESSION_SECRET =
    process.env.SESSION_SECRET ||
    "cha-de-casa-nova-chave-secreta-troque-esta-chave";

const DATABASE_URL =
    process.env.DATABASE_URL;


/* =====================================================
   VERIFICAÇÃO DO BANCO
===================================================== */

if (!DATABASE_URL) {

    console.error(
        "ERRO: DATABASE_URL não foi configurada."
    );

    process.exit(1);

}


/* =====================================================
   ADMINISTRADOR
===================================================== */

const ADMIN_USERNAME = "admin";

const ADMIN_PASSWORD_HASH =
    "$2b$12$3nDHztfxZEgHhW3Bf.6mpuunAxV8cX/eZTR7cCOiyB4K2k6fqxkG6";


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

app.set("trust proxy", 1);

app.use(
    session({

        secret:
            SESSION_SECRET,

        resave:
            false,

        saveUninitialized:
            false,

        cookie: {

            httpOnly:
                true,

            secure:
                process.env.NODE_ENV === "production",

            sameSite:
                "lax",

            maxAge:
                1000 *
                60 *
                60 *
                8

        }

    })
);


/* =====================================================
   POSTGRESQL
===================================================== */

const pool = new Pool({

    connectionString:
        DATABASE_URL,

    ssl:
        process.env.NODE_ENV === "production"
            ? {
                rejectUnauthorized: false
            }
            : false

});


pool.on(
    "error",
    erro => {

        console.error(
            "Erro inesperado no PostgreSQL:",
            erro
        );

    }
);


/* =====================================================
   INICIALIZAÇÃO DO BANCO
===================================================== */

async function inicializarBanco() {

    console.log(
        "Conectando ao PostgreSQL..."
    );


    await pool.query(
        "SELECT NOW()"
    );


    console.log(
        "Banco de dados conectado."
    );


    /* =================================================
       TABELA DE PRESENÇAS
    ================================================= */

    await pool.query(`

        CREATE TABLE IF NOT EXISTS presencas (

            id SERIAL PRIMARY KEY,

            nome TEXT NOT NULL UNIQUE,

            status TEXT NOT NULL,

            data TIMESTAMP DEFAULT CURRENT_TIMESTAMP

        )

    `);


    /* =================================================
       ÍNDICE PARA NOME SEM DIFERENÇA DE MAIÚSCULAS
    ================================================= */

    await pool.query(`

        CREATE UNIQUE INDEX IF NOT EXISTS
        presencas_nome_lower_unique

        ON presencas (
            LOWER(nome)
        )

    `);


    /* =================================================
       TABELA DE PRESENTES
    ================================================= */

    await pool.query(`

        CREATE TABLE IF NOT EXISTS presentes (

            id INTEGER PRIMARY KEY,

            nome TEXT NOT NULL,

            icone TEXT NOT NULL,

            categoria TEXT NOT NULL
                DEFAULT 'basico'

        )

    `);


    /* =================================================
       GARANTIR COLUNA CATEGORIA
    ================================================= */

    await pool.query(`

        ALTER TABLE presentes

        ADD COLUMN IF NOT EXISTS
        categoria TEXT NOT NULL
        DEFAULT 'basico'

    `);


    console.log(
        "Estrutura de presentes atualizada."
    );


    /* =================================================
       TABELA DE ESCOLHAS
    ================================================= */

    await pool.query(`

        CREATE TABLE IF NOT EXISTS escolhas_presentes (

            id SERIAL PRIMARY KEY,

            presente_id INTEGER NOT NULL,

            nome_pessoa TEXT NOT NULL,

            data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            UNIQUE (
                presente_id,
                nome_pessoa
            ),

            FOREIGN KEY (
                presente_id
            )
            REFERENCES presentes(id)

            ON DELETE CASCADE

        )

    `);


    /* =================================================
       ÍNDICE PARA NOME SEM DIFERENÇA DE MAIÚSCULAS
    ================================================= */

    await pool.query(`

        CREATE UNIQUE INDEX IF NOT EXISTS
        escolhas_presentes_nome_lower_unique

        ON escolhas_presentes (
            presente_id,
            LOWER(nome_pessoa)
        )

    `);


    /* =================================================
       TABELA DE MENSAGENS
    ================================================= */

    await pool.query(`

        CREATE TABLE IF NOT EXISTS mensagens (

            id SERIAL PRIMARY KEY,

            nome TEXT NOT NULL,

            texto TEXT NOT NULL,

            data TIMESTAMP DEFAULT CURRENT_TIMESTAMP

        )

    `);


    /* =================================================
       PRESENTES PADRÃO
    ================================================= */

    const presentesPadrao = [

        {
            id: 1,
            nome: "Jogo de copos",
            icone: "🥤",
            categoria: "basico"
        },

        {
            id: 2,
            nome: "Ralador",
            icone: "🧀",
            categoria: "basico"
        },

        {
            id: 3,
            nome: "Cortador de legumes",
            icone: "🥕",
            categoria: "basico"
        },

        {
            id: 4,
            nome: "Jogo de peneira",
            icone: "🥣",
            categoria: "basico"
        },

        {
            id: 5,
            nome: "Escorredor de macarrão",
            icone: "🍝",
            categoria: "basico"
        },

        {
            id: 6,
            nome: "Escorredor de arroz",
            icone: "🍚",
            categoria: "basico"
        },

        {
            id: 7,
            nome: "Tábua de corte",
            icone: "🔪",
            categoria: "basico"
        },

        {
            id: 8,
            nome: "Pano de louça",
            icone: "🧺",
            categoria: "basico"
        },

        {
            id: 9,
            nome: "Toalha de banho",
            icone: "🛁",
            categoria: "basico"
        },

        {
            id: 10,
            nome: "Toalha de rosto",
            icone: "🧖",
            categoria: "basico"
        },

        {
            id: 11,
            nome: "Forma de bolo",
            icone: "🍰",
            categoria: "basico"
        },

        {
            id: 12,
            nome: "Potes plásticos",
            icone: "🥡",
            categoria: "basico"
        },

        {
            id: 13,
            nome: "Marinex (tigela de vidro)",
            icone: "🥣",
            categoria: "basico"
        },

        {
            id: 14,
            nome: "Escorredor de louça",
            icone: "🍽️",
            categoria: "basico"
        },

        {
            id: 15,
            nome: "Chaleira",
            icone: "🫖",
            categoria: "basico"
        },

        {
            id: 16,
            nome: "Jarra de vidro",
            icone: "🫗",
            categoria: "basico"
        },

        {
            id: 17,
            nome: "Garrafa térmica para café",
            icone: "☕",
            categoria: "basico"
        },

        {
            id: 18,
            nome: "Kit de jogo de utensílios para cozinha",
            icone: "🍴",
            categoria: "basico"
        },

        {
            id: 19,
            nome: "Descanso de panela",
            icone: "🍳",
            categoria: "basico"
        },

        {
            id: 20,
            nome: "Chaleira elétrica",
            icone: "⚡",
            categoria: "avancado"
        },

        {
            id: 21,
            nome: "Mixer",
            icone: "🥤",
            categoria: "avancado"
        },

        {
            id: 22,
            nome: "Air fryer",
            icone: "🍟",
            categoria: "avancado"
        },

        {
            id: 23,
            nome: "Mop",
            icone: "🧹",
            categoria: "avancado"
        },

        {
            id: 24,
            nome: "Sanduicheira",
            icone: "🥪",
            categoria: "avancado"
        },

        {
            id: 25,
            nome: "Cafeteira ou máquina de café",
            icone: "☕",
            categoria: "avancado"
        },

        {
            id: 26,
            nome: "Varal de chão",
            icone: "👕",
            categoria: "avancado"
        },

        {
            id: 27,
            nome: "Panela de pressão",
            icone: "🍲",
            categoria: "avancado"
        },

        {
            id: 28,
            nome: "Pipoqueira ou panela de pipoca",
            icone: "🍿",
            categoria: "avancado"
        },

        {
            id: 29,
            nome: "Kit de ferramentas",
            icone: "🛠️",
            categoria: "avancado"
        }

    ];


    /* =================================================
       INSERIR / ATUALIZAR PRESENTES
    ================================================= */

    for (
        const presente
        of presentesPadrao
    ) {

        await pool.query(

            `

            INSERT INTO presentes

            (
                id,
                nome,
                icone,
                categoria
            )

            VALUES
            (
                $1,
                $2,
                $3,
                $4
            )

            ON CONFLICT (id)

            DO UPDATE SET

                nome = EXCLUDED.nome,

                icone = EXCLUDED.icone,

                categoria = EXCLUDED.categoria

            `,

            [

                presente.id,

                presente.nome,

                presente.icone,

                presente.categoria

            ]

        );

    }


    console.log(
        "Lista de presentes atualizada."
    );

}


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
   PÁGINA PRINCIPAL
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
   ARQUIVOS DO ADMIN
===================================================== */

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
   LOGIN
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
            )
        );

    }
);


/* =====================================================
   PAINEL ADMIN
===================================================== */

app.get(
    "/admin",
    (req, res) => {

        if (
            !req.session ||
            req.session.adminLogado !== true
        ) {

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
            )
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

                return res.status(401).json({

                    sucesso: false,

                    mensagem:
                        "Usuário ou senha incorretos."

                });

            }


            const senhaCorreta =
                await bcrypt.compare(
                    password,
                    ADMIN_PASSWORD_HASH
                );


            if (!senhaCorreta) {

                return res.status(401).json({

                    sucesso: false,

                    mensagem:
                        "Usuário ou senha incorretos."

                });

            }


            req.session.adminLogado =
                true;


            req.session.adminUsername =
                ADMIN_USERNAME;


            req.session.save(
                erro => {

                    if (erro) {

                        console.error(
                            erro
                        );

                        return res.status(500).json({

                            sucesso: false,

                            mensagem:
                                "Erro ao criar sessão."

                        });

                    }


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
   API TESTE
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
   PRESENÇAS
===================================================== */

app.post(
    "/api/rsvp",
    async (req, res) => {

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
                await pool.query(

                    `

                    SELECT id

                    FROM presencas

                    WHERE LOWER(nome) = LOWER($1)

                    `,

                    [
                        nomeLimpo
                    ]

                );


            if (
                pessoaExistente.rows.length > 0
            ) {

                await pool.query(

                    `

                    UPDATE presencas

                    SET

                        nome = $1,

                        status = $2,

                        data = CURRENT_TIMESTAMP

                    WHERE id = $3

                    `,

                    [

                        nomeLimpo,

                        status,

                        pessoaExistente.rows[0].id

                    ]

                );

            } else {

                await pool.query(

                    `

                    INSERT INTO presencas

                    (
                        nome,
                        status
                    )

                    VALUES
                    (
                        $1,
                        $2
                    )

                    `,

                    [

                        nomeLimpo,

                        status

                    ]

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
    async (req, res) => {

        try {

            const resultado =
                await pool.query(`

                    SELECT

                        id,
                        nome,
                        status,
                        data

                    FROM presencas

                    ORDER BY id DESC

                `);


            res.json(
                resultado.rows
            );


        } catch (erro) {

            console.error(
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
    async (req, res) => {

        try {

            const resultado =
                await pool.query(`

                    SELECT

                        COUNT(*) FILTER (
                            WHERE status = 'confirmed'
                        ) AS confirmados,

                        COUNT(*) FILTER (
                            WHERE status = 'declined'
                        ) AS recusados

                    FROM presencas

                `);


            res.json({

                confirmados:
                    Number(
                        resultado.rows[0].confirmados
                    ) || 0,

                recusados:
                    Number(
                        resultado.rows[0].recusados
                    ) || 0

            });


        } catch (erro) {

            console.error(
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
   PRESENTES
===================================================== */

app.get(
    "/api/presentes",
    async (req, res) => {

        try {

            const resultado =
                await pool.query(`

                    SELECT

                        p.id,

                        p.nome,

                        p.icone,

                        p.categoria,

                        e.id AS escolha_id,

                        e.nome_pessoa,

                        e.data

                    FROM presentes p

                    LEFT JOIN escolhas_presentes e

                        ON e.presente_id = p.id

                    ORDER BY
                        p.id ASC

                `);


            const resultadoFinal = [];


            for (
                const presente
                of resultado.rows
            ) {

                let item =
                    resultadoFinal.find(
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

                        category:
                            presente.categoria,

                        people:
                            []

                    };


                    resultadoFinal.push(
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
                resultadoFinal
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
    async (req, res) => {

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
                await pool.query(

                    `

                    SELECT

                        id,
                        nome

                    FROM presentes

                    WHERE id = $1

                    `,

                    [
                        presenteId
                    ]

                );


            if (
                presente.rows.length === 0
            ) {

                return res.status(404).json({

                    sucesso: false,

                    mensagem:
                        "Esse presente não existe."

                });

            }


            const escolhaExistente =
                await pool.query(

                    `

                    SELECT id

                    FROM escolhas_presentes

                    WHERE

                        presente_id = $1

                        AND LOWER(nome_pessoa) =
                            LOWER($2)

                    `,

                    [

                        presenteId,

                        nomeLimpo

                    ]

                );


            if (
                escolhaExistente.rows.length > 0
            ) {

                return res.status(400).json({

                    sucesso: false,

                    mensagem:
                        "Você já escolheu este presente."

                });

            }


            await pool.query(

                `

                INSERT INTO escolhas_presentes

                (
                    presente_id,
                    nome_pessoa
                )

                VALUES
                (
                    $1,
                    $2
                )

                `,

                [

                    presenteId,

                    nomeLimpo

                ]

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
    async (req, res) => {

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
                await pool.query(

                    `

                    DELETE FROM escolhas_presentes

                    WHERE

                        presente_id = $1

                        AND LOWER(nome_pessoa) =
                            LOWER($2)

                    `,

                    [

                        presenteId,

                        nome.trim()

                    ]

                );


            if (
                resultado.rowCount === 0
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
   MENSAGENS
===================================================== */

app.post(
    "/api/mensagens",
    async (req, res) => {

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
                await pool.query(

                    `

                    INSERT INTO mensagens

                    (
                        nome,
                        texto
                    )

                    VALUES
                    (
                        $1,
                        $2
                    )

                    RETURNING id

                    `,

                    [

                        nomeLimpo,

                        textoLimpo

                    ]

                );


            res.json({

                sucesso: true,

                id:
                    resultado.rows[0].id,

                mensagem:
                    "Mensagem enviada!"

            });


        } catch (erro) {

            console.error(
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
    async (req, res) => {

        try {

            const resultado =
                await pool.query(`

                    SELECT

                        id,
                        nome,
                        texto,
                        data

                    FROM mensagens

                    ORDER BY id DESC

                `);


            res.json(
                resultado.rows
            );


        } catch (erro) {

            console.error(
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
   ADMIN - RESUMO
===================================================== */

app.get(
    "/api/admin/resumo",
    requireAdmin,
    async (req, res) => {

        try {

            const presencas =
                await pool.query(`

                    SELECT

                        COUNT(*) AS total,

                        COUNT(*) FILTER (
                            WHERE status = 'confirmed'
                        ) AS confirmados,

                        COUNT(*) FILTER (
                            WHERE status = 'declined'
                        ) AS recusados

                    FROM presencas

                `);


            const presentes =
                await pool.query(`

                    SELECT
                        COUNT(*) AS total

                    FROM escolhas_presentes

                `);


            const mensagens =
                await pool.query(`

                    SELECT
                        COUNT(*) AS total

                    FROM mensagens

                `);


            res.json({

                sucesso: true,

                convidados: {

                    total:
                        Number(
                            presencas.rows[0].total
                        ) || 0,

                    confirmados:
                        Number(
                            presencas.rows[0].confirmados
                        ) || 0,

                    recusados:
                        Number(
                            presencas.rows[0].recusados
                        ) || 0

                },

                presentes:
                    Number(
                        presentes.rows[0].total
                    ) || 0,

                mensagens:
                    Number(
                        mensagens.rows[0].total
                    ) || 0

            });


        } catch (erro) {

            console.error(
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
    async (req, res) => {

        try {

            const resultado =
                await pool.query(`

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

                        LOWER(nome) ASC

                `);


            res.json({

                sucesso: true,

                convidados:
                    resultado.rows

            });


        } catch (erro) {

            console.error(
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
    async (req, res) => {

        try {

            const resultado =
                await pool.query(`

                    SELECT

                        p.id,

                        p.nome,

                        p.icone,

                        p.categoria,

                        e.id AS escolha_id,

                        e.nome_pessoa,

                        e.data

                    FROM presentes p

                    LEFT JOIN escolhas_presentes e

                        ON e.presente_id = p.id

                    ORDER BY

                        CASE

                            WHEN p.categoria = 'basico'
                            THEN 1

                            ELSE 2

                        END,

                        p.id ASC,

                        e.data ASC

                `);


            const resultadoFinal = [];


            resultado.rows.forEach(
                presente => {

                    let item =
                        resultadoFinal.find(
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

                            categoria:
                                presente.categoria,

                            pessoas: []

                        };


                        resultadoFinal.push(
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
                    resultadoFinal

            });


        } catch (erro) {

            console.error(
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
    async (req, res) => {

        try {

            const resultado =
                await pool.query(`

                    SELECT

                        id,
                        nome,
                        texto,
                        data

                    FROM mensagens

                    ORDER BY id DESC

                `);


            res.json({

                sucesso: true,

                mensagens:
                    resultado.rows

            });


        } catch (erro) {

            console.error(
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
    async (req, res) => {

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
                await pool.query(

                    `

                    DELETE FROM presencas

                    WHERE id = $1

                    `,

                    [
                        id
                    ]

                );


            if (
                resultado.rowCount === 0
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
    async (req, res) => {

        try {

            const presencas =
                await pool.query(`

                    SELECT
                        COUNT(*) AS total

                    FROM presencas

                `);


            const escolhas =
                await pool.query(`

                    SELECT
                        COUNT(*) AS total

                    FROM escolhas_presentes

                `);


            const mensagens =
                await pool.query(`

                    SELECT
                        COUNT(*) AS total

                    FROM mensagens

                `);


            res.json({

                banco:
                    "PostgreSQL",

                presencas:
                    Number(
                        presencas.rows[0].total
                    ),

                escolhasPresentes:
                    Number(
                        escolhas.rows[0].total
                    ),

                mensagens:
                    Number(
                        mensagens.rows[0].total
                    )

            });


        } catch (erro) {

            console.error(
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
            req.path.startsWith(
                "/api/"
            )
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

async function iniciarServidor() {

    try {

        await inicializarBanco();


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
                    "Banco: PostgreSQL"
                );

                console.log(
                    "Servidor iniciado com sucesso!"
                );

                console.log("");

            }
        );


    } catch (erro) {

        console.error(
            ""
        );

        console.error(
            "======================================"
        );

        console.error(
            "ERRO AO INICIALIZAR O SERVIDOR"
        );

        console.error(
            "======================================"
        );

        console.error(
            erro
        );

        console.error("");

        process.exit(1);

    }

}


iniciarServidor();