/* =====================================================
   LOGIN DO ADMINISTRADOR
===================================================== */

const loginForm =
    document.getElementById("loginForm");

const usernameInput =
    document.getElementById("username");

const passwordInput =
    document.getElementById("password");

const loginButton =
    document.getElementById("loginButton");

const loginError =
    document.getElementById("loginError");


/* =====================================================
   VERIFICAR SE OS ELEMENTOS EXISTEM
===================================================== */

if (!loginForm) {

    console.error(
        "ERRO: #loginForm não foi encontrado."
    );

}


/* =====================================================
   ENVIAR LOGIN
===================================================== */

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const username =
            usernameInput.value.trim();

        const password =
            passwordInput.value;


        /* ---------------------------------------------
           LIMPAR MENSAGEM
        --------------------------------------------- */

        loginError.textContent = "";


        /* ---------------------------------------------
           VALIDAR CAMPOS
        --------------------------------------------- */

        if (
            !username ||
            !password
        ) {

            loginError.textContent =
                "Preencha usuário e senha.";

            return;

        }


        /* ---------------------------------------------
           BOTÃO
        --------------------------------------------- */

        loginButton.disabled =
            true;

        loginButton.textContent =
            "Entrando...";


        try {

            /* -----------------------------------------
               FAZER LOGIN
            ----------------------------------------- */

            const resposta =
                await fetch(
                    "/api/admin/login",
                    {

                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        credentials:
                            "same-origin",

                        body:
                            JSON.stringify({

                                username:
                                    username,

                                password:
                                    password

                            })

                    }
                );


            /* -----------------------------------------
               LER RESPOSTA
            ----------------------------------------- */

            const dados =
                await resposta.json();


            console.log(
                "Resposta do login:",
                dados
            );


            /* -----------------------------------------
               LOGIN INCORRETO
            ----------------------------------------- */

            if (
                !resposta.ok ||
                !dados.sucesso
            ) {

                loginError.textContent =
                    dados.mensagem ||
                    "Usuário ou senha incorretos.";

                return;

            }


            /* -----------------------------------------
               LOGIN CORRETO
            ----------------------------------------- */

            loginError.textContent =
                "";


            console.log(
                "Login realizado com sucesso."
            );


            /*
               IMPORTANTE:

               Usamos /admin e não /admin/
            */

            window.location.href =
                "/admin";


        } catch (erro) {

            console.error(
                "Erro ao fazer login:",
                erro
            );


            loginError.textContent =
                "Não foi possível conectar ao servidor.";


        } finally {

            loginButton.disabled =
                false;

            loginButton.textContent =
                "Entrar";

        }

    }
);