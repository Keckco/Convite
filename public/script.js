/* =====================================================
   CHÁ DE CASA NOVA
   FRONTEND
===================================================== */


/* =====================================================
   GOOGLE MAPS
===================================================== */

/*
    Local do evento:

    Arena Ball
    Rua Salgado Filho, 1227 - Centro
    União da Vitória - PR

    O link abaixo abre diretamente a busca
    desse endereço no Google Maps.
*/

const googleMapsURL =
    "https://www.google.com/maps/search/?api=1&query=Arena+Ball%2C+Rua+Salgado+Filho%2C+1227%2C+Centro%2C+Uni%C3%A3o+da+Vit%C3%B3ria%2C+PR";


const mapsButton =
    document.getElementById("mapsButton");


if (mapsButton) {

    mapsButton.href =
        googleMapsURL;

}



/* =====================================================
   CONFIGURAÇÕES
===================================================== */

const STORAGE_KEYS = {

    guestName:
        "chaCasaNova_guestName"

};



/* =====================================================
   ELEMENTOS
===================================================== */

const giftsContainer =
    document.getElementById("giftsContainer");


const modal =
    document.getElementById("nameModal");


const selectedGift =
    document.getElementById("selectedGift");


const guestName =
    document.getElementById("guestName");


const closeModal =
    document.getElementById("closeModal");


const confirmGift =
    document.getElementById("confirmGift");


const toast =
    document.getElementById("toast");


const presenceName =
    document.getElementById("presenceName");


const confirmPresence =
    document.getElementById("confirmPresence");


const declinePresence =
    document.getElementById("declinePresence");


const presenceStatus =
    document.getElementById("presenceStatus");


const confirmedCount =
    document.getElementById("confirmedCount");


const declinedCount =
    document.getElementById("declinedCount");


const messageName =
    document.getElementById("messageName");


const guestMessage =
    document.getElementById("guestMessage");


const sendMessage =
    document.getElementById("sendMessage");


const characterCount =
    document.getElementById("characterCount");


const messagesContainer =
    document.getElementById("messagesContainer");



/* =====================================================
   ESTADO
===================================================== */

let currentGift = null;


/*
    Os presentes vêm do backend.
*/

const gifts = [];



/* =====================================================
   TESTE DO BACKEND
===================================================== */

fetch("/api/teste")

    .then(resposta => {

        if (!resposta.ok) {

            throw new Error(
                "Erro ao acessar o backend."
            );

        }

        return resposta.json();

    })

    .then(dados => {

        console.log(
            "Backend:",
            dados.mensagem
        );

    })

    .catch(erro => {

        console.error(
            "Erro ao acessar backend:",
            erro
        );

    });



/* =====================================================
   PRESENTES
===================================================== */


/* =====================================================
   CARREGAR PRESENTES
===================================================== */

async function loadGifts() {

    try {

        const resposta =
            await fetch("/api/presentes");


        if (!resposta.ok) {

            throw new Error(
                "Erro ao carregar presentes."
            );

        }


        const dados =
            await resposta.json();


        gifts.length = 0;


        dados.forEach(presente => {

            gifts.push({

                id:
                    presente.id,

                name:
                    presente.name,

                icon:
                    presente.icon,

                people:
                    presente.people.map(
                        pessoa =>
                            pessoa.name
                    )

            });

        });


        renderGifts();


    } catch (erro) {

        console.error(
            "Erro ao carregar presentes:",
            erro
        );


        showToast(
            "Não foi possível carregar a lista de presentes."
        );

    }

}



/* =====================================================
   RENDERIZAR PRESENTES
===================================================== */

function renderGifts() {

    if (!giftsContainer) {

        return;

    }


    giftsContainer.innerHTML = "";


    const savedGuestName =
        localStorage.getItem(
            STORAGE_KEYS.guestName
        );


    gifts.forEach(gift => {

        const card =
            document.createElement("article");


        card.className =
            "gift-card reveal";


        let peopleHTML = "";


        if (gift.people.length === 0) {

            peopleHTML = `

                <span class="no-people">

                    Ninguém escolheu ainda

                </span>

            `;

        } else {

            gift.people.forEach(person => {

                peopleHTML += `

                    <span class="person">

                        ✓
                        ${escapeHTML(person)}

                    </span>

                `;

            });

        }


        const userAlreadySelected =
            savedGuestName &&
            gift.people.some(
                person =>
                    person.toLowerCase() ===
                    savedGuestName.toLowerCase()
            );


        if (userAlreadySelected) {

            card.classList.add(
                "selected-by-user"
            );

        }


        const buttonText =
            userAlreadySelected
                ? "↩ Remover minha escolha"
                : "Eu vou levar";


        const buttonClass =
            userAlreadySelected
                ? "gift-button remove"
                : "gift-button";


        card.innerHTML = `

            <div class="gift-icon">

                ${gift.icon}

            </div>


            <h3>

                ${escapeHTML(gift.name)}

            </h3>


            <p class="gift-count">

                ${gift.people.length}

                ${
                    gift.people.length === 1
                        ? "pessoa vai levar"
                        : "pessoas vão levar"
                }

            </p>


            <div class="gift-people">

                ${peopleHTML}

            </div>


            <button
                type="button"
                class="${buttonClass}"
                data-gift-id="${gift.id}"
            >

                ${buttonText}

            </button>

        `;


        const button =
            card.querySelector(
                ".gift-button"
            );


        button.addEventListener(
            "click",
            () => {

                if (userAlreadySelected) {

                    removeGiftChoice(
                        gift.id,
                        savedGuestName
                    );

                } else {

                    openGiftModal(
                        gift.id
                    );

                }

            }
        );


        giftsContainer.appendChild(card);

    });


    observeReveal();

}



/* =====================================================
   MODAL DE PRESENTE
===================================================== */

function openGiftModal(id) {

    currentGift =
        gifts.find(
            gift =>
                gift.id === id
        );


    if (!currentGift) {

        return;

    }


    selectedGift.textContent =
        currentGift.name;


    const savedName =
        localStorage.getItem(
            STORAGE_KEYS.guestName
        );


    guestName.value =
        savedName || "";


    modal.classList.add(
        "active"
    );


    setTimeout(
        () => {

            guestName.focus();

        },
        300
    );

}


function closeGiftModal() {

    modal.classList.remove(
        "active"
    );

    currentGift = null;

}


if (closeModal) {

    closeModal.addEventListener(
        "click",
        closeGiftModal
    );

}


if (modal) {

    modal.addEventListener(
        "click",
        event => {

            if (event.target === modal) {

                closeGiftModal();

            }

        }
    );

}



/* =====================================================
   ESCOLHER PRESENTE
===================================================== */

if (confirmGift) {

    confirmGift.addEventListener(
        "click",
        async () => {

            if (!currentGift) {

                return;

            }


            const name =
                guestName.value.trim();


            if (!name) {

                showToast(
                    "Digite seu nome primeiro."
                );

                guestName.focus();

                return;

            }


            confirmGift.disabled =
                true;


            try {

                const resposta =
                    await fetch(
                        "/api/presentes/escolher",
                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    presenteId:
                                        currentGift.id,

                                    nome:
                                        name

                                })

                        }
                    );


                const dados =
                    await resposta.json();


                if (!resposta.ok) {

                    throw new Error(
                        dados.mensagem ||
                        "Erro ao escolher presente."
                    );

                }


                localStorage.setItem(
                    STORAGE_KEYS.guestName,
                    name
                );


                closeGiftModal();


                await loadGifts();


                showToast(
                    `✓ ${name}, sua escolha foi registrada!`
                );


                createConfetti();


            } catch (erro) {

                console.error(
                    "Erro ao escolher presente:",
                    erro
                );


                showToast(
                    erro.message ||
                    "Não foi possível registrar sua escolha."
                );


            } finally {

                confirmGift.disabled =
                    false;

            }

        }
    );

}



/* =====================================================
   REMOVER PRESENTE
===================================================== */

async function removeGiftChoice(
    giftId,
    name
) {

    try {

        const resposta =
            await fetch(
                "/api/presentes/escolher",
                {

                    method:
                        "DELETE",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            presenteId:
                                giftId,

                            nome:
                                name

                        })

                }
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.mensagem ||
                "Erro ao remover escolha."
            );

        }


        await loadGifts();


        showToast(
            "Sua escolha foi removida."
        );


    } catch (erro) {

        console.error(
            "Erro ao remover presente:",
            erro
        );


        showToast(
            erro.message ||
            "Não foi possível remover sua escolha."
        );

    }

}



/* =====================================================
   PRESENÇA
===================================================== */

async function confirmPresenceAction(status) {

    const name =
        presenceName.value.trim();


    if (!name) {

        showToast(
            "Digite seu nome primeiro."
        );

        presenceName.focus();

        return;

    }


    confirmPresence.disabled =
        true;

    declinePresence.disabled =
        true;


    try {

        const resposta =
            await fetch(
                "/api/rsvp",
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            nome:
                                name,

                            status:
                                status

                        })

                }
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.mensagem ||
                "Erro ao confirmar presença."
            );

        }


        localStorage.setItem(
            STORAGE_KEYS.guestName,
            name
        );


        updatePresenceUI(
            name,
            status
        );


        await updatePresenceStats();


        showToast(
            dados.mensagem
        );


        if (status === "confirmed") {

            createConfetti();

        }


    } catch (erro) {

        console.error(
            "Erro ao enviar confirmação:",
            erro
        );


        showToast(
            erro.message ||
            "Não foi possível enviar sua confirmação."
        );


    } finally {

        confirmPresence.disabled =
            false;

        declinePresence.disabled =
            false;

    }

}


if (confirmPresence) {

    confirmPresence.addEventListener(
        "click",
        () => {

            confirmPresenceAction(
                "confirmed"
            );

        }
    );

}


if (declinePresence) {

    declinePresence.addEventListener(
        "click",
        () => {

            confirmPresenceAction(
                "declined"
            );

        }
    );

}



/* =====================================================
   STATUS DA PRESENÇA
===================================================== */

function updatePresenceUI(
    name,
    status
) {

    if (!presenceStatus) {

        return;

    }


    if (status === "confirmed") {

        presenceStatus.innerHTML = `

            ✓

            <strong>
                ${escapeHTML(name)}
            </strong>,

            sua presença está confirmada!

        `;

    } else {

        presenceStatus.innerHTML = `

            Tudo certo,

            <strong>
                ${escapeHTML(name)}
            </strong>.

            Obrigado por avisar.

        `;

    }

}



/* =====================================================
   ESTATÍSTICAS DE PRESENÇA
===================================================== */

async function updatePresenceStats() {

    try {

        const resposta =
            await fetch(
                "/api/presencas/stats"
            );


        if (!resposta.ok) {

            throw new Error(
                "Erro ao buscar estatísticas."
            );

        }


        const dados =
            await resposta.json();


        if (confirmedCount) {

            confirmedCount.textContent =
                dados.confirmados;

        }


        if (declinedCount) {

            declinedCount.textContent =
                dados.recusados;

        }


    } catch (erro) {

        console.error(
            "Erro ao carregar estatísticas:",
            erro
        );

    }

}



/* =====================================================
   MENSAGENS
===================================================== */

async function renderMessages() {

    if (!messagesContainer) {

        return;

    }


    try {

        const resposta =
            await fetch(
                "/api/mensagens"
            );


        if (!resposta.ok) {

            throw new Error(
                "Erro ao carregar mensagens."
            );

        }


        const mensagens =
            await resposta.json();


        messagesContainer.innerHTML =
            "";


        mensagens.forEach(message => {

            const element =
                document.createElement("article");


            element.className =
                "guest-message";


            element.innerHTML = `

                <strong>

                    ❤️

                    ${escapeHTML(
                        message.nome
                    )}

                </strong>


                <p>

                    ${escapeHTML(
                        message.texto
                    )}

                </p>

            `;


            messagesContainer.appendChild(
                element
            );

        });


    } catch (erro) {

        console.error(
            "Erro ao carregar mensagens:",
            erro
        );

    }

}



/* =====================================================
   CONTADOR DE CARACTERES
===================================================== */

if (guestMessage) {

    guestMessage.addEventListener(
        "input",
        () => {

            if (characterCount) {

                characterCount.textContent =
                    `${guestMessage.value.length} / 250`;

            }

        }
    );

}



/* =====================================================
   ENVIAR MENSAGEM
===================================================== */

if (sendMessage) {

    sendMessage.addEventListener(
        "click",
        async () => {

            const name =
                messageName.value.trim();


            const text =
                guestMessage.value.trim();


            if (!name) {

                showToast(
                    "Digite seu nome."
                );

                messageName.focus();

                return;

            }


            if (!text) {

                showToast(
                    "Escreva uma mensagem."
                );

                guestMessage.focus();

                return;

            }


            sendMessage.disabled =
                true;


            try {

                const resposta =
                    await fetch(
                        "/api/mensagens",
                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    nome:
                                        name,

                                    texto:
                                        text

                                })

                        }
                    );


                const dados =
                    await resposta.json();


                if (!resposta.ok) {

                    throw new Error(
                        dados.mensagem ||
                        "Erro ao enviar mensagem."
                    );

                }


                localStorage.setItem(
                    STORAGE_KEYS.guestName,
                    name
                );


                guestMessage.value =
                    "";


                if (characterCount) {

                    characterCount.textContent =
                        "0 / 250";

                }


                await renderMessages();


                showToast(
                    "❤️ Mensagem enviada!"
                );


                createConfetti();


            } catch (erro) {

                console.error(
                    "Erro ao enviar mensagem:",
                    erro
                );


                showToast(
                    erro.message ||
                    "Não foi possível enviar a mensagem."
                );


            } finally {

                sendMessage.disabled =
                    false;

            }

        }
    );

}



/* =====================================================
   NOME SALVO
===================================================== */

function loadSavedName() {

    const name =
        localStorage.getItem(
            STORAGE_KEYS.guestName
        );


    if (!name) {

        return;

    }


    if (presenceName) {

        presenceName.value =
            name;

    }


    if (messageName) {

        messageName.value =
            name;

    }

}



/* =====================================================
   TOAST
===================================================== */

let toastTimeout;


function showToast(message) {

    if (!toast) {

        return;

    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimeout
    );


    toastTimeout =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3500
        );

}



/* =====================================================
   CONTADOR DO EVENTO
===================================================== */

/*
    DATA DO EVENTO

    5 de setembro de 2026
    às 15:00
    horário de Brasília (UTC-3)

    O "-03:00" é importante para que
    o navegador interprete corretamente
    o horário no Brasil.
*/

const eventDate =
    new Date(
        "2026-09-05T15:00:00-03:00"
    ).getTime();


function updateCountdown() {

    const now =
        Date.now();


    const distance =
        eventDate - now;


    const daysElement =
        document.getElementById(
            "days"
        );


    const hoursElement =
        document.getElementById(
            "hours"
        );


    const minutesElement =
        document.getElementById(
            "minutes"
        );


    const secondsElement =
        document.getElementById(
            "seconds"
        );


    /*
        Quando chegar no horário do evento,
        o contador fica zerado.
    */

    if (distance <= 0) {

        if (daysElement) {

            daysElement.textContent =
                "00";

        }


        if (hoursElement) {

            hoursElement.textContent =
                "00";

        }


        if (minutesElement) {

            minutesElement.textContent =
                "00";

        }


        if (secondsElement) {

            secondsElement.textContent =
                "00";

        }


        return;

    }


    const days =
        Math.floor(
            distance /
            (1000 * 60 * 60 * 24)
        );


    const hours =
        Math.floor(
            (
                distance /
                (1000 * 60 * 60)
            ) % 24
        );


    const minutes =
        Math.floor(
            (
                distance /
                (1000 * 60)
            ) % 60
        );


    const seconds =
        Math.floor(
            (
                distance /
                1000
            ) % 60
        );


    if (daysElement) {

        daysElement.textContent =
            String(days).padStart(
                2,
                "0"
            );

    }


    if (hoursElement) {

        hoursElement.textContent =
            String(hours).padStart(
                2,
                "0"
            );

    }


    if (minutesElement) {

        minutesElement.textContent =
            String(minutes).padStart(
                2,
                "0"
            );

    }


    if (secondsElement) {

        secondsElement.textContent =
            String(seconds).padStart(
                2,
                "0"
            );

    }

}



/*
    Atualiza imediatamente
    e depois a cada segundo.
*/

updateCountdown();


setInterval(
    updateCountdown,
    1000
);



/* =====================================================
   REVEAL
===================================================== */

function observeReveal() {

    const elements =
        document.querySelectorAll(
            ".reveal"
        );


    if (elements.length === 0) {

        return;

    }


    const observer =
        new IntersectionObserver(

            entries => {

                entries.forEach(
                    entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target
                                .classList
                                .add(
                                    "visible"
                                );


                            observer.unobserve(
                                entry.target
                            );

                        }

                    }
                );

            },

            {
                threshold:
                    0.12
            }

        );


    elements.forEach(
        element => {

            observer.observe(
                element
            );

        }
    );

}



/* =====================================================
   CONFETES
===================================================== */

function createConfetti() {

    const pieces =
        45;


    for (
        let i = 0;
        i < pieces;
        i++
    ) {

        const confetti =
            document.createElement(
                "div"
            );


        confetti.className =
            "confetti";


        confetti.style.left =
            Math.random() *
            100 +
            "%";


        confetti.style.animationDuration =
            (
                Math.random() *
                2 +
                2
            ) +
            "s";


        confetti.style.animationDelay =
            (
                Math.random() *
                0.5
            ) +
            "s";


        confetti.style.transform =
            `rotate(${Math.random() * 360}deg)`;


        const size =
            Math.random() *
            8 +
            5;


        confetti.style.width =
            size +
            "px";


        confetti.style.height =
            size *
            1.5 +
            "px";


        confetti.style.background =
            getRandomConfettiColor();


        document.body.appendChild(
            confetti
        );


        setTimeout(
            () => {

                confetti.remove();

            },
            4000
        );

    }

}


function getRandomConfettiColor() {

    const colors = [

        "#8c6a4a",
        "#b79774",
        "#62472f",
        "#d6bfa5",
        "#77706a",
        "#292522"

    ];


    return colors[
        Math.floor(
            Math.random() *
            colors.length
        )
    ];

}



/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(text) {

    const element =
        document.createElement(
            "div"
        );


    element.textContent =
        text ?? "";


    return element.innerHTML;

}



/* =====================================================
   ESC PARA FECHAR MODAL
===================================================== */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            modal &&
            modal.classList.contains(
                "active"
            )
        ) {

            closeGiftModal();

        }

    }
);



/* =====================================================
   INICIALIZAÇÃO
===================================================== */

loadGifts();

loadSavedName();

updatePresenceStats();

renderMessages();

observeReveal();