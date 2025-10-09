document.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("email-reset");
  const botaoEnviar = document.getElementById("botao-enviar-link");

  if (!emailInput || !botaoEnviar) {
    console.error("Elementos de redefinição de senha não encontrados.");
    return;
  }

  botaoEnviar.addEventListener("click", async () => {
    const email = emailInput.value.trim();

    if (!email) {
      alert("⚠️ Por favor, insira seu e-mail.");
      return;
    }

    // Desativa botão e mostra loading
    botaoEnviar.disabled = true;
    const originalTexto = botaoEnviar.textContent;
    botaoEnviar.textContent = "Enviando... ⏳";

    try {
      const response = await fetch("http://localhost:8080/usuario/solicitar-reset-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        // Mensagem de sucesso no próprio botão
        botaoEnviar.textContent = "✔ E-mail enviado!";
        botaoEnviar.style.backgroundColor = "#4CAF50";
        botaoEnviar.style.color = "#fff";

        emailInput.value = "";

        // Alerta para o usuário
        alert("Verifique seu e-mail 📩\nA senha só poderá ser redefinida novamente após 2 minutos.");

        // Redefine botão após 1.5s
        setTimeout(() => {
          botaoEnviar.disabled = false;
          botaoEnviar.textContent = originalTexto;
          botaoEnviar.style.backgroundColor = "";
          botaoEnviar.style.color = "";
        }, 1500);

      } else {
        let errorMessage = "⚠️ Não foi possível enviar o e-mail.";
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json().catch(() => ({}));
          errorMessage = errorData.message || errorMessage;
        } else {
          const errorText = await response.text().catch(() => "");
          if (errorText) errorMessage = errorText;
        }

        throw new Error(errorMessage);
      }

    } catch (error) {
      console.error("Erro ao enviar requisição:", error);
      alert("❌ " + error.message);

      // Reativa botão e restaura texto
      botaoEnviar.disabled = false;
      botaoEnviar.textContent = originalTexto;
      botaoEnviar.style.backgroundColor = "";
      botaoEnviar.style.color = "";
    }
  });
});
