/* =====================================================
   CHÁ DE CASA NOVA
   ADMIN.JS
   SISTEMA ADMINISTRATIVO
===================================================== */


/* =====================================================
   ELEMENTOS DE LOGIN
===================================================== */

const loginScreen =
    document.getElementById("loginScreen");

const adminPanel =
    document.getElementById("adminPanel");

const loginForm =
    document.getElementById("loginForm");

const adminUsername =
    document.getElementById("adminUsername");

const adminPassword =
    document.getElementById("adminPassword");

const loginError =
    document.getElementById("loginError");

const logoutButton =
    document.getElementById("logoutButton");


/* =====================================================
   ELEMENTOS DO RESUMO
===================================================== */

const totalGuests =
    document.getElementById("totalGuests");

const confirmedGuests =
    document.getElementById("confirmedGuests");

const declinedGuests =
    document.getElementById("declinedGuests");

const chosenGifts =
    document.getElementById("chosenGifts");

const totalMessages =
    document.getElementById("totalMessages");


/* =====================================================
   ELEMENTOS DO PAINEL
===================================================== */

const guestsTable =
    document.getElementById("guestsTable");

const emptyGuests =
    document.getElementById("emptyGuests");

const giftsGrid =
    document.getElementById("giftsGrid");

const messagesGrid =
    document.getElementById("messagesGrid");

const emptyMessages =
    document.getElementById("emptyMessages");

const guestSearch =
    document.getElementById("guestSearch");

const refreshButton =
    document.getElementById("refreshButton");

const lastUpdate =
    document.getElementById("lastUpdate");


/* =====================================================
   VARIÁVEIS
===================================================== */

let convidadosAtuais = [];


/* =====================================================
   ESCAPAR HTML
===================================================== */

function escapeHTML(text) {

    const element =
        document.createElement("div");

    element.textContent =
        text ?? "";

    return element.innerHTML;

}


/* =====================================================
   MOSTRAR LOGIN
===================================================== */

function showLogin() {

    if (loginScreen) {

        loginScreen.style.display =
            "flex";

    }


    if (adminPanel) {

        adminPanel.style.display =
            "none";

    }

}


/* =====================================================
   MOSTRAR PAINEL
===================================================== */

function showAdminPanel() {

    if (loginScreen) {

        loginScreen.style.display =
            "none";

    }


    if (adminPanel) {

        adminPanel.style.display =
            "block";

    }

}


/* =====================================================
   ERRO DE LOGIN
===================================================== */

function showLoginError(message) {

    if (!loginError) {

        alert(message);

        return;

    }


    loginError.textContent =
        message;

    loginError.style.display =
        "block";

}


/* =====================================================
   ESCONDER ERRO
===================================================== */

function hideLoginError() {

    if (!loginError) {

        return;

    }


    loginError.textContent =
        "";

    loginError.style.display =
        "none";

}


/* =====================================================
   ATUALIZAR HORÁRIO
===================================================== */

function updateLastUpdate() {

    if (!lastUpdate) {

        return;

    }


    const agora =
        new Date();


    lastUpdate.textContent =
        "Atualizado às " +
        agora.toLocaleTimeString(
            "pt-BR",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

}


/* =====================================================
   VERIFICAR SESSÃO
===================================================== */

async function checkAdminSession() {

    try {

        const resposta =
            await fetch(
                "/api/admin/sessao",
                {
                    method: "GET",
                    credentials: "same-origin"
                }
            );


        if (!resposta.ok) {

            showLogin();

            return false;

        }


        const dados =
            await resposta.json();


        if (
            dados.logado === true ||
            dados.autenticado === true ||
            dados.sucesso === true
        ) {

            showAdminPanel();

            await loadAdminData();

            return true;

        }


        showLogin();

        return false;


    } catch (erro) {

        console.error(
            "Erro ao verificar sessão:",
            erro
        );

        showLogin();

        return false;

    }

}


/* =====================================================
   LOGIN
===================================================== */

async function loginAdmin(event) {

    event.preventDefault();

    hideLoginError();


    const username =
        adminUsername
            ? adminUsername.value.trim()
            : "";


    const password =
        adminPassword
            ? adminPassword.value
            : "";


    if (!username) {

        showLoginError(
            "Digite o usuário."
        );

        if (adminUsername) {

            adminUsername.focus();

        }

        return;

    }


    if (!password) {

        showLoginError(
            "Digite a senha."
        );

        if (adminPassword) {

            adminPassword.focus();

        }

        return;

    }


    const submitButton =
        loginForm
            ? loginForm.querySelector(
                'button[type="submit"]'
            )
            : null;


    if (submitButton) {

        submitButton.disabled =
            true;

        submitButton.dataset.originalText =
            submitButton.textContent;

        submitButton.textContent =
            "Entrando...";

    }


    try {

        const resposta =
            await fetch(
                "/api/admin/login",
                {

                    method: "POST",

                    credentials:
                        "same-origin",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            username:
                                username,

                            password:
                                password

                        })

                }
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.mensagem ||
                "Usuário ou senha incorretos."
            );

        }


        if (
            dados.sucesso !== true
        ) {

            throw new Error(
                dados.mensagem ||
                "Não foi possível realizar o login."
            );

        }


        if (adminPassword) {

            adminPassword.value =
                "";

        }


        showAdminPanel();

        await loadAdminData();


    } catch (erro) {

        console.error(
            "Erro no login:",
            erro
        );

        showLoginError(
            erro.message ||
            "Erro ao realizar login."
        );


    } finally {

        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.textContent =
                submitButton.dataset.originalText ||
                "Entrar";

        }

    }

}


/* =====================================================
   LOGOUT
===================================================== */

async function logoutAdmin() {

    try {

        const resposta =
            await fetch(
                "/api/admin/logout",
                {

                    method: "POST",

                    credentials:
                        "same-origin"

                }
            );


        if (!resposta.ok) {

            throw new Error(
                "Erro ao sair."
            );

        }


        showLogin();


        if (adminUsername) {

            adminUsername.value =
                "";

        }


        if (adminPassword) {

            adminPassword.value =
                "";

        }


        hideLoginError();


    } catch (erro) {

        console.error(
            "Erro ao fazer logout:",
            erro
        );

        alert(
            "Não foi possível sair."
        );

    }

}


/* =====================================================
   CARREGAR TODOS OS DADOS
===================================================== */

async function loadAdminData() {

    try {

        await Promise.all([

            loadSummary(),

            loadGuests(),

            loadGifts(),

            loadMessages()

        ]);


        updateLastUpdate();


    } catch (erro) {

        console.error(
            "Erro ao carregar dados administrativos:",
            erro
        );

    }

}


/* =====================================================
   RESUMO
===================================================== */

async function loadSummary() {

    try {

        const resposta =
            await fetch(
                "/api/admin/resumo",
                {
                    credentials:
                        "same-origin"
                }
            );


        if (
            resposta.status === 401 ||
            resposta.status === 403
        ) {

            showLogin();

            return;

        }


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.mensagem ||
                "Erro ao carregar resumo."
            );

        }


        if (totalGuests) {

            totalGuests.textContent =
                dados.convidados?.total || 0;

        }


        if (confirmedGuests) {

            confirmedGuests.textContent =
                dados.convidados?.confirmados || 0;

        }


        if (declinedGuests) {

            declinedGuests.textContent =
                dados.convidados?.recusados || 0;

        }


        if (chosenGifts) {

            chosenGifts.textContent =
                dados.presentes || 0;

        }


        if (totalMessages) {

            totalMessages.textContent =
                dados.mensagens || 0;

        }


    } catch (erro) {

        console.error(
            "Erro ao carregar resumo:",
            erro
        );

    }

}


/* =====================================================
   CONVIDADOS
===================================================== */

async function loadGuests() {

    if (!guestsTable) {

        return;

    }


    try {

        const resposta =
            await fetch(
                "/api/admin/convidados",
                {
                    credentials:
                        "same-origin"
                }
            );


        if (
            resposta.status === 401 ||
            resposta.status === 403
        ) {

            showLogin();

            return;

        }


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.mensagem ||
                "Erro ao carregar convidados."
            );

        }


        convidadosAtuais =
            dados.convidados || [];


        renderGuests(
            convidadosAtuais
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar convidados:",
            erro
        );


        guestsTable.innerHTML =
            "";


        if (emptyGuests) {

            emptyGuests.style.display =
                "block";

            emptyGuests.querySelector("p").textContent =
                "Não foi possível carregar os convidados.";

        }

    }

}


/* =====================================================
   MOSTRAR CONVIDADOS
===================================================== */

function renderGuests(
    convidados
) {

    guestsTable.innerHTML =
        "";


    if (
        !convidados ||
        convidados.length === 0
    ) {

        if (emptyGuests) {

            emptyGuests.style.display =
                "block";

        }

        return;

    }


    if (emptyGuests) {

        emptyGuests.style.display =
            "none";

    }


    convidados.forEach(
        convidado => {

            const row =
                document.createElement(
                    "tr"
                );


            const confirmado =
                convidado.status ===
                "confirmed";


            row.innerHTML = `

                <td>

                    <span class="guest-name">

                        ${escapeHTML(
                            convidado.nome
                        )}

                    </span>

                </td>


                <td>

                    <span class="status ${
                        confirmado
                            ? "confirmed"
                            : "declined"
                    }">

                        ${
                            confirmado
                                ? "✓ Confirmado"
                                : "✕ Não poderá ir"
                        }

                    </span>

                </td>


                <td>

                    <span class="gift-name">

                        —

                    </span>

                </td>

            `;


            guestsTable.appendChild(
                row
            );

        }
    );

}


/* =====================================================
   PESQUISAR CONVIDADOS
===================================================== */

function searchGuests() {

    const termo =
        guestSearch
            ? guestSearch.value
                .trim()
                .toLowerCase()
            : "";


    if (!termo) {

        renderGuests(
            convidadosAtuais
        );

        return;

    }


    const filtrados =
        convidadosAtuais.filter(
            convidado =>
                convidado.nome
                    .toLowerCase()
                    .includes(termo)
        );


    renderGuests(
        filtrados
    );

}


/* =====================================================
   PRESENTES
===================================================== */

async function loadGifts() {

    if (!giftsGrid) {

        return;

    }


    try {

        const resposta =
            await fetch(
                "/api/admin/presentes",
                {
                    credentials:
                        "same-origin"
                }
            );


        if (
            resposta.status === 401 ||
            resposta.status === 403
        ) {

            showLogin();

            return;

        }


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.mensagem ||
                "Erro ao carregar presentes."
            );

        }


        const presentes =
            dados.presentes || [];


        giftsGrid.innerHTML =
            "";


        if (
            presentes.length === 0
        ) {

            giftsGrid.innerHTML = `

                <div class="no-person">

                    Nenhum presente cadastrado.

                </div>

            `;

            return;

        }


        presentes.forEach(
            presente => {

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "gift-admin-card";


                const pessoas =
                    presente.pessoas || [];


                let pessoasHTML =
                    "";


                if (
                    pessoas.length === 0
                ) {

                    pessoasHTML = `

                        <span class="no-person">

                            Ninguém escolheu ainda.

                        </span>

                    `;

                } else {

                    pessoas.forEach(
                        pessoa => {

                            pessoasHTML += `

                                <span class="person-tag">

                                    ✓
                                    ${escapeHTML(
                                        pessoa.nome
                                    )}

                                </span>

                            `;

                        }
                    );

                }


                card.innerHTML = `

                    <div class="gift-admin-top">

                        <div class="gift-admin-title">

                            <span class="gift-admin-icon">

                                ${escapeHTML(
                                    presente.icone
                                )}

                            </span>


                            <span>

                                ${escapeHTML(
                                    presente.nome
                                )}

                            </span>

                        </div>


                        <span class="gift-admin-count">

                            ${pessoas.length}
                            ${
                                pessoas.length === 1
                                    ? "pessoa"
                                    : "pessoas"
                            }

                        </span>

                    </div>


                    <div class="people-list">

                        ${pessoasHTML}

                    </div>

                `;


                giftsGrid.appendChild(
                    card
                );

            }
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar presentes:",
            erro
        );


        giftsGrid.innerHTML = `

            <div class="no-person">

                Não foi possível carregar os presentes.

            </div>

        `;

    }

}


/* =====================================================
   MENSAGENS
===================================================== */

async function loadMessages() {

    if (!messagesGrid) {

        return;

    }


    try {

        const resposta =
            await fetch(
                "/api/admin/mensagens",
                {
                    credentials:
                        "same-origin"
                }
            );


        if (
            resposta.status === 401 ||
            resposta.status === 403
        ) {

            showLogin();

            return;

        }


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.mensagem ||
                "Erro ao carregar mensagens."
            );

        }


        const mensagens =
            dados.mensagens || [];


        messagesGrid.innerHTML =
            "";


        if (
            mensagens.length === 0
        ) {

            if (emptyMessages) {

                emptyMessages.style.display =
                    "block";

            }

            return;

        }


        if (emptyMessages) {

            emptyMessages.style.display =
                "none";

        }


        mensagens.forEach(
            mensagem => {

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "message-card";


                let dataFormatada =
                    "";


                if (
                    mensagem.data
                ) {

                    const data =
                        new Date(
                            mensagem.data
                        );


                    if (
                        !isNaN(
                            data.getTime()
                        )
                    ) {

                        dataFormatada =
                            data.toLocaleString(
                                "pt-BR"
                            );

                    }

                }


                card.innerHTML = `

                    <div class="message-author">

                        ❤️
                        ${escapeHTML(
                            mensagem.nome
                        )}

                    </div>


                    <p class="message-text">

                        ${escapeHTML(
                            mensagem.texto
                        )}

                    </p>


                    ${
                        dataFormatada
                            ? `
                                <div class="message-date">

                                    ${escapeHTML(
                                        dataFormatada
                                    )}

                                </div>
                            `
                            : ""
                    }

                `;


                messagesGrid.appendChild(
                    card
                );

            }
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar mensagens:",
            erro
        );


        messagesGrid.innerHTML =
            "";


        if (emptyMessages) {

            emptyMessages.style.display =
                "block";

            emptyMessages.querySelector("p").textContent =
                "Não foi possível carregar as mensagens.";

        }

    }

}


/* =====================================================
   ATUALIZAR PAINEL
===================================================== */

async function refreshAdmin() {

    const originalText =
        refreshButton
            ? refreshButton.textContent
            : "";


    if (refreshButton) {

        refreshButton.disabled =
            true;

        refreshButton.textContent =
            "Atualizando...";

    }


    try {

        await loadAdminData();

    } finally {

        if (refreshButton) {

            refreshButton.disabled =
                false;

            refreshButton.textContent =
                originalText ||
                "↻ Atualizar";

        }

    }

}


/* =====================================================
   EVENTOS
===================================================== */


/* LOGIN */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        loginAdmin
    );

}


/* LOGOUT */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        logoutAdmin
    );

}


/* ATUALIZAR */

if (refreshButton) {

    refreshButton.addEventListener(
        "click",
        refreshAdmin
    );

}


/* PESQUISA */

if (guestSearch) {

    guestSearch.addEventListener(
        "input",
        searchGuests
    );

}


/* LIMPAR ERRO DE LOGIN */

if (adminUsername) {

    adminUsername.addEventListener(
        "input",
        hideLoginError
    );

}


if (adminPassword) {

    adminPassword.addEventListener(
        "input",
        hideLoginError
    );

}


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

async function initAdmin() {

    if (loginScreen) {

        loginScreen.style.display =
            "none";

    }


    if (adminPanel) {

        adminPanel.style.display =
            "none";

    }


    await checkAdminSession();

}


initAdmin();