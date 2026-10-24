// O endereço do webhook fica público no site estático. Configure aqui a URL
// de teste do Webhook.site ou a URL POST do webhook do seu fluxo no n8n.
const CONTACT_WEBHOOK_URL = "https://webhook.site/be1d446c-4d91-4ad3-9779-a9e6c8b71a86";

const navigation = document.querySelector("#menu_principal");
const menuButton = navigation?.querySelector(".menu-toggle");
const menuLinks = navigation?.querySelectorAll("#menu_item .link");

if (navigation && menuButton) {
    const setMenuOpen = (isOpen) => {
        navigation.classList.toggle("menu-open", isOpen);
        menuButton.setAttribute("aria-expanded", String(isOpen));
        menuButton.setAttribute(
            "aria-label",
            isOpen ? "Fechar menu" : "Abrir menu"
        );
    };

    menuButton.addEventListener("click", () => {
        setMenuOpen(!navigation.classList.contains("menu-open"));
    });

    menuLinks?.forEach((link) => {
        link.addEventListener("click", () => setMenuOpen(false));
    });

    const mobileMenuQuery = window.matchMedia("(max-width: 760px)");
    setMenuOpen(mobileMenuQuery.matches);
    mobileMenuQuery.addEventListener("change", (event) => {
        setMenuOpen(event.matches);
    });

    document.addEventListener("click", (event) => {
        if (!navigation.contains(event.target)) {
            setMenuOpen(false);
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && navigation.classList.contains("menu-open")) {
            setMenuOpen(false);
            menuButton.focus();
        }
    });
}

const contactForm = document.querySelector("#form-contato");
const formStatus = document.querySelector("#form-status");

if (contactForm && formStatus) {
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton?.textContent ?? "Enviar";

    const showFormStatus = (message, type) => {
        formStatus.textContent = message;
        formStatus.classList.remove("sucesso", "erro");
        formStatus.classList.add(type);
    };

    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!contactForm.reportValidity()) {
            return;
        }

        if (!CONTACT_WEBHOOK_URL.trim()) {
            showFormStatus(
                "Os dados estão válidos, mas falta configurar a URL do webhook em script.js.",
                "erro"
            );
            return;
        }

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Enviando...";
        }
        formStatus.textContent = "";
        formStatus.classList.remove("sucesso", "erro");

        try {
            // Converte os dados do formulário para objeto e depois para JSON (ideal para Webhook.site / n8n)
            const formData = new FormData(contactForm);
            const dadosObjeto = Object.fromEntries(formData.entries());

            const response = await fetch(CONTACT_WEBHOOK_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dadosObjeto),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            contactForm.reset();
            showFormStatus("Mensagem enviada com sucesso!", "sucesso");
        } catch (error) {
            console.error("Detalhe do erro:", error);
            showFormStatus(
                "Não foi possível enviar. Confira a URL do webhook e se ele aceita requisições do site (CORS).",
                "erro"
            );
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        }
    });
}