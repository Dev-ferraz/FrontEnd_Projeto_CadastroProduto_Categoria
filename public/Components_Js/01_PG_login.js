document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const senhaInput = document.getElementById("senha-login");
  const botaoLogin = document.querySelector("button[type='submit']");
  const toggleSenha = document.getElementById("toggleSenhaLogin"); // 👈 ícone do olho

  // ===============================
  // TOGGLE DE SENHA (mostrar/ocultar)
  // ===============================
  if (toggleSenha && senhaInput) {
    toggleSenha.addEventListener("click", () => {
      const tipo = senhaInput.getAttribute("type");

      if (tipo === "password") {
        senhaInput.setAttribute("type", "text");
        toggleSenha.innerHTML = '<i class="bi bi-eye-slash-fill"></i>'; // olho fechado
      } else {
        senhaInput.setAttribute("type", "password");
        toggleSenha.innerHTML = '<i class="bi bi-eye-fill"></i>'; // olho aberto
      }
    });
  }

  // ===============================
  // SUBMISSÃO DO FORMULÁRIO DE LOGIN
  // ===============================
  if (form && botaoLogin) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = emailInput.value.trim();
      const senha = senhaInput.value;

      if (!email || !senha) {
        alert("⚠️ Por favor, preencha todos os campos.");
        return;
      }

      const loginData = { email, password: senha };

      // desativa o botão e mostra loading
      botaoLogin.disabled = true;
      const originalTexto = botaoLogin.textContent;
      botaoLogin.textContent = "Entrando... ⏳";

      try {
        const response = await fetch("http://localhost:8080/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loginData),
        });

        if (!response.ok) {
          const errorMsg = await response.text();
          throw new Error(errorMsg || "Erro na autenticação");
        }

        const data = await response.json();

        // salva token e dados do usuário
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuarioId", data.usuarioId);
        localStorage.setItem("usuarioNome", data.nome);
        localStorage.setItem("tokenCriadoEm", Date.now());

        botaoLogin.textContent = `✔ Bem-vindo(a), ${data.nome}!`;
        botaoLogin.style.backgroundColor = "#4CAF50";
        botaoLogin.style.color = "#fff";

        emailInput.value = "";
        senhaInput.value = "";

        setTimeout(() => {
          window.location.href = "/API_html/07_PG_workspace.html";
        }, 1000);
      } catch (error) {
        console.error("Erro na autenticação:", error);
        alert(error.message);

        botaoLogin.disabled = false;
        botaoLogin.textContent = originalTexto;
        botaoLogin.style.backgroundColor = "";
        botaoLogin.style.color = "";

        senhaInput.value = "";
        senhaInput.focus();
      }
    });
  }
});
