document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-redefinir-senha-nova");
  const novaSenhaInput = document.getElementById("nova-senha-novo");
  const confirmarSenhaInput = document.getElementById("confirmar-senha-novo");
  const toggleNovaSenha = document.getElementById("toggleNovaSenha");
  const toggleConfirmarSenha = document.getElementById("toggleConfirmarSenha");

  // Seleciona o botão pela classe
  const botaoRedefinir = document.querySelector("button.botao-cadastrar-novo");

  // --- Toggle Nova Senha ---
  toggleNovaSenha.addEventListener("click", () => {
    const icone = toggleNovaSenha.querySelector("i");
    novaSenhaInput.type = novaSenhaInput.type === "password" ? "text" : "password";
    icone.classList.toggle("bi-eye-fill");
    icone.classList.toggle("bi-eye-slash-fill");
  });

  // --- Toggle Confirmar Senha ---
  toggleConfirmarSenha.addEventListener("click", () => {
    const icone = toggleConfirmarSenha.querySelector("i");
    confirmarSenhaInput.type = confirmarSenhaInput.type === "password" ? "text" : "password";
    icone.classList.toggle("bi-eye-fill");
    icone.classList.toggle("bi-eye-slash-fill");
  });

  // --- Captura o token enviado por e-mail ---
  const token = new URLSearchParams(window.location.search).get("token");

  // --- Submit do formulário ---
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const novaSenha = novaSenhaInput.value.trim();
    const confirmarSenha = confirmarSenhaInput.value.trim();

    if (!novaSenha || !confirmarSenha) {
      alert("⚠️ Preencha todos os campos.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      alert("⚠️ As senhas não coincidem.");
      return;
    }

    if (!token) {
      alert("⚠️ Token não encontrado. Verifique o link enviado por e-mail.");
      return;
    }

    // --- Desativa botão e mostra loading ---
    botaoRedefinir.disabled = true;
    const originalTexto = botaoRedefinir.textContent;
    botaoRedefinir.textContent = "Redefinindo... ⏳";

    try {
      const response = await fetch("http://localhost:8080/usuario/redefinir-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, novaSenha }),
      });

      const textoResposta = await response.text();

      if (response.ok) {
        // Mostra mensagem de sucesso no próprio botão
        botaoRedefinir.textContent = "✔ Senha redefinida!";
        botaoRedefinir.style.backgroundColor = "#4CAF50";
        botaoRedefinir.style.color = "#fff";

        // Limpa campos
        novaSenhaInput.value = "";
        confirmarSenhaInput.value = "";

        // Mensagem informativa ao usuário
        alert("Senha redefinida com sucesso! Você será redirecionado à tela de login ✔️");

        // Redirecionamento após 1 segundo
        setTimeout(() => {
          window.location.href = "/API_html/01_PG_login.html";
        }, 1000);
      } else {
        botaoRedefinir.disabled = false;
        botaoRedefinir.textContent = originalTexto;
        botaoRedefinir.style.backgroundColor = "";
        botaoRedefinir.style.color = "";
        alert("⚠️ Sessão expirada — reenvie o e-mail para continuar. " + textoResposta);
      }
    } catch (error) {
      botaoRedefinir.disabled = false;
      botaoRedefinir.textContent = originalTexto;
      botaoRedefinir.style.backgroundColor = "";
      botaoRedefinir.style.color = "";
      alert("❌ Erro de conexão. Tente novamente mais tarde.");
      console.error("Erro:", error);
    }
  });
});
