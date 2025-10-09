document.addEventListener("DOMContentLoaded", () => {
  // ==========================
  // CONFIGURAÇÃO DE SESSÃO
  // ==========================
  const token = localStorage.getItem("token");
  const tokenCriadoEm = localStorage.getItem("tokenCriadoEm");
  const usuarioId = localStorage.getItem("usuarioId");
  const TEMPO_SESSAO = 5 * 60 * 1000; // 5 minutos
  const AVISO_ANTES = 30 * 1000; // 30 segundos

  function encerrarSessao(mensagem = "⚠️ Sua sessão expirou. Faça login novamente.") {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenCriadoEm");
    alert(mensagem);
    window.location.href = "/API_html/01_PG_login.html";
  }

  if (!token || !tokenCriadoEm) return encerrarSessao();
  const expiracao = parseInt(tokenCriadoEm) + TEMPO_SESSAO;
  const agora = Date.now();
  const tempoRestante = expiracao - agora;

  if (tempoRestante <= 0) return encerrarSessao();

  setTimeout(() => alert("⚠️ Sua sessão vai expirar em 30 segundos!"), Math.max(0, tempoRestante - AVISO_ANTES));
  setTimeout(() => encerrarSessao(), tempoRestante);

  // ==========================
  // FORMULÁRIO DE CATEGORIA
  // ==========================
  const form = document.querySelector("#form-categoria");
  const nomeInput = document.querySelector("#nome");
  const botaoCadastrar = document.querySelector("button.btn-cadastrar"); 

  function primeiraLetraMaiuscula(texto) {
    if (!texto) return "";
    return texto
      .split(" ")
      .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
      .join(" ");
  }

  nomeInput.addEventListener("input", () => {
    if (/[^a-zA-ZÀ-ÿ\s]/.test(nomeInput.value)) {
      alert("⚠️ Atenção: apenas caracteres são válidos!");
      nomeInput.value = nomeInput.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
    }

    if (nomeInput.value.length === 1) {
      nomeInput.value = nomeInput.value.toUpperCase();
    } else {
      nomeInput.value = primeiraLetraMaiuscula(nomeInput.value);
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const nomeCategoria = nomeInput.value.trim();
    if (!nomeCategoria) return alert("⚠️ Por favor, preencha o nome da categoria.");

    botaoCadastrar.disabled = true;
    const originalTexto = botaoCadastrar.textContent;
    botaoCadastrar.textContent = "Cadastrando... ⏳";

    try {
      const response = await fetch("http://localhost:8080/api/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nome: nomeCategoria }),
      });

      let responseData;
      try { responseData = await response.json(); } catch { responseData = await response.text(); }

      if (!response.ok) {
        let msgErro = typeof responseData === "string" ? responseData : responseData?.message || "Erro ao cadastrar categoria.";
        if (msgErro.includes("já existe") || msgErro.includes("Existe")) msgErro = "⚠️ Essa categoria já foi cadastrada!";
        throw new Error(msgErro);
      }

      botaoCadastrar.textContent = "✔ Categoria cadastrada!";
      botaoCadastrar.style.backgroundColor = "#4CAF50";
      botaoCadastrar.style.color = "#fff";

      alert(`🏷️ Categoria "${responseData.nome}"\n💾 Cadastrada com sucesso! ✔`);
      nomeInput.value = "";

      setTimeout(() => {
        botaoCadastrar.disabled = false;
        botaoCadastrar.textContent = originalTexto;
        botaoCadastrar.style.backgroundColor = "";
        botaoCadastrar.style.color = "";
      }, 1500);

    } catch (error) {
      alert(error.message);
      console.error("Erro ao cadastrar categoria:", error);
      botaoCadastrar.disabled = false;
      botaoCadastrar.textContent = originalTexto;
      botaoCadastrar.style.backgroundColor = "";
      botaoCadastrar.style.color = "";
    }
  });
});
