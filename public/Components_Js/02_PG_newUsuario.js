document.addEventListener("DOMContentLoaded", () => {
  // ----- Código para cadastro -----
  const formCadastro = document.querySelector("form.cadastro-form");
  const botaoCadastro = document.querySelector("button.botao-cadastrar");

  if (formCadastro && botaoCadastro) {
    formCadastro.addEventListener("submit", function(event) {
      event.preventDefault();

      const nomeInput = document.querySelector("input[name='nome']");
      const senhaInput = document.querySelector("input[name='senha']");
      const emailInput = document.querySelector("input[name='email']");

      if (!nomeInput || !senhaInput || !emailInput) {
        console.error("⚠️ Um ou mais campos de input não foram encontrados!");
        alert("Erro interno: ⚠️ Campos do formulário não encontrados. Atualize a página e tente novamente.");
        return;
      }

      const formData = {
        nome: nomeInput.value.trim(),
        senha: senhaInput.value,
        email: emailInput.value.trim()
      };

      async function cadastra(formData) {
        try {
          const response = await fetch("http://localhost:8080/usuario", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
          });

          if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`);
          }

          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            return await response.json();
          } else {
            return await response.text();
          }
        } catch (error) {
          console.error("⚠️Erro ao realizar a requisição:", error);
          throw error;
        }
      }

      // Desativa botão e mostra loading
      botaoCadastro.disabled = true;
      const originalTexto = botaoCadastro.textContent;
      botaoCadastro.textContent = "Cadastrando... ⏳";

      cadastra(formData)
        .then((response) => {
          console.log("Cadastro realizado com sucesso: ✔", response);

          // Mensagem no prompt antes de atualizar o botão
          alert("Usuário cadastrado com sucesso! Você será redirecionado para a tela de verificação. ✔️");

          // Limpa os campos
          nomeInput.value = "";
          senhaInput.value = "";
          emailInput.value = "";

          // Efeito visual de sucesso no botão
          botaoCadastro.textContent = "✔ Cadastrado!";
          botaoCadastro.style.backgroundColor = "#4CAF50"; // verde
          botaoCadastro.style.color = "#fff";

          // Redirecionamento após 1 segundo
          setTimeout(() => {
            window.location.href = "http://localhost:5174/API_html/03_PG_verificarCadastro.html";
          }, 1000);
        })
        .catch((error) => {
          console.error("Erro ao realizar o cadastro:", error);
          alert("⚠️Erro ao realizar o cadastro. Este e-mail pode já estar cadastrado. Tente usar um novo e-mail 📩");

          senhaInput.value = "";
          senhaInput.focus();

          // Reativa botão
          botaoCadastro.disabled = false;
          botaoCadastro.textContent = originalTexto;
          botaoCadastro.style.backgroundColor = ""; // remove estilo caso tenha sido alterado
          botaoCadastro.style.color = "";
        });
    });
  }

  // ----- Mostrar / Ocultar Senha -----
  const toggleSenha = document.getElementById("toggleSenha");
  const senhaInput = document.getElementById("senha");

  if (toggleSenha && senhaInput) {
    toggleSenha.addEventListener("click", function () {
      const icone = this.querySelector("i");

      if (senhaInput.type === "password") {
        senhaInput.type = "text";
        icone.classList.remove("bi-eye-fill");
        icone.classList.add("bi-eye-slash-fill");
      } else {
        senhaInput.type = "password";
        icone.classList.remove("bi-eye-slash-fill");
        icone.classList.add("bi-eye-fill");
      }
    });
  }
});
