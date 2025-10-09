document.addEventListener("DOMContentLoaded", () => {
  const formValidar = document.getElementById("validarForm");
  const botaoValidar = document.querySelector("button.cadastrado-verificao");

  if (formValidar && botaoValidar) {
    formValidar.addEventListener("submit", async (event) => {
      event.preventDefault();

      const codigoInput = document.getElementById("codigo");
      const codigo = codigoInput.value.trim();

      if (!codigo) {
        alert("Por favor, insira o código de verificação.");
        return;
      }

      // Desativa botão e mostra loading
      botaoValidar.disabled = true;
      const originalTexto = botaoValidar.textContent;
      botaoValidar.textContent = "Validando... ⏳";

      try {
        const response = await fetch(`http://localhost:8080/usuario/verificarCadastro/${encodeURIComponent(codigo)}`, {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          }
        });

        if (response.ok) {
          // Limpa input
          codigoInput.value = "";

          // Efeito visual de sucesso no botão
          botaoValidar.textContent = "✔ Código Validado!";
          botaoValidar.style.backgroundColor = "#4CAF50";
          botaoValidar.style.color = "#fff";

          // ✅ Mensagem de confirmação para o usuário
          alert("Verificação realizada com sucesso. Você será redirecionado à tela de login ✔️");

          // Redirecionamento após 1 segundo
          setTimeout(() => {
            window.location.href = "/API_html/01_PG_login.html";
          }, 1000);

        } else if (response.status === 404) {
          alert("Código inválido. Verifique e tente novamente.");

          // Reativa botão
          botaoValidar.disabled = false;
          botaoValidar.textContent = originalTexto;
          botaoValidar.style.backgroundColor = "";
          botaoValidar.style.color = "";

        } else {
          alert("Erro ao validar o código. Tente novamente mais tarde.");
          botaoValidar.disabled = false;
          botaoValidar.textContent = originalTexto;
          botaoValidar.style.backgroundColor = "";
          botaoValidar.style.color = "";
        }
      } catch (error) {
        console.error("Erro ao validar o código:", error);
        alert("Erro de conexão com o servidor. Tente novamente mais tarde.");

        botaoValidar.disabled = false;
        botaoValidar.textContent = originalTexto;
        botaoValidar.style.backgroundColor = "";
        botaoValidar.style.color = "";
      }
    });
  }
});
