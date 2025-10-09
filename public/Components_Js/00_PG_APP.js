// 06_PG_boas_vindas.js

document.addEventListener("DOMContentLoaded", () => {
    console.log("📌 Página Boas-Vindas carregada com sucesso!");

    // Botão de login
    const botaoLogin = document.querySelector(".botao-boas-vindas");

    if (botaoLogin) {
        botaoLogin.addEventListener("click", () => {
            console.log("🔑 Redirecionando para tela de login...");
            window.location.href = "/Way_burgers/01_PG_login.html";
        });
    }

    // Inicialização do AOS (caso queira fazer via JS)
    if (typeof AOS !== "undefined") {
        AOS.init({
            duration: 2000,
            disable: "mobile"
        });
    }

    // (Opcional) Redirecionar automaticamente após 5 segundos
    /*
    setTimeout(() => {
        console.log("⏳ Redirecionamento automático para tela de login...");
        window.location.href = "/Way_burgers/01_PG_login.html";
    }, 5000);
    */
});
