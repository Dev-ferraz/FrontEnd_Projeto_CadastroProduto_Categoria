// ==========================
// GLOBAL.JS - Comportamentos unificados
// ==========================

document.addEventListener("DOMContentLoaded", () => {

  // ==========================
  // SESSÃO
  // ==========================
  const TEMPO_SESSAO = 5 * 60 * 1000; // 5 minutos


  const AVISO_ANTES = 30 * 1000;       // 30 segundos antes
  const token = validarSessao(TEMPO_SESSAO, AVISO_ANTES);

  // ==========================
  // FUNÇÕES GLOBAIS
  // ==========================
  function validarSessao(tempoSessao, avisoAntes) {
    const token = localStorage.getItem("token");
    const tokenCriadoEm = localStorage.getItem("tokenCriadoEm");

    function encerrarSessao(msg = "Sua sessão expirou. Faça login novamente.") {
      localStorage.removeItem("token");
      localStorage.removeItem("tokenCriadoEm");
      alert(`⚠️ ${msg}`);
      window.location.href = "/API_html/01_PG_login.html";
    }

    if (!token || !tokenCriadoEm) { encerrarSessao(); return null; }

    const expiracao = parseInt(tokenCriadoEm) + tempoSessao;
    const agora = Date.now();
    const tempoRestante = expiracao - agora;

    if (tempoRestante <= 0) { encerrarSessao(); return null; }

    setTimeout(() => alert("⚠️Sua sessão vai expirar em 30 segundos!"), tempoRestante - avisoAntes);
    setTimeout(() => encerrarSessao(), tempoRestante);

    return token;
  }

  function capitalizarInput(input) {
    if (!input) return;
    input.addEventListener("input", () => {
      const cursorPos = input.selectionStart;
      input.value = input.value
        .split(" ")
        .map(p => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ");
      input.setSelectionRange(cursorPos, cursorPos);
    });
  }

  function converterPrecoParaFloat(valorStr) {
    if (!valorStr) return 0;
    valorStr = valorStr.replace(/\./g, '').replace(',', '.');
    const preco = parseFloat(valorStr);
    return isNaN(preco) ? 0 : preco;
  }

  // ==========================
  // FORMULÁRIO DE CATEGORIA
  // ==========================
  const formCategoria = document.querySelector("#form-categoria");
  const nomeCategoriaInput = document.querySelector("#nome");
  capitalizarInput(nomeCategoriaInput);

  if (formCategoria) {
    formCategoria.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nomeCategoria = nomeCategoriaInput.value.trim();
      if (!nomeCategoria) { alert("⚠️ Por favor, preencha o nome da categoria."); return; }

      try {
        const response = await fetch("http://localhost:8080/api/categorias", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ nome: nomeCategoria })
        });

        if (response.status === 401) { 
          alert("⚠️ Sua sessão expirou."); 
          localStorage.removeItem("token"); 
          window.location.href = "/API_html/01_PG_login.html"; 
          return; 
        }

        let data;
        try { data = await response.json(); } catch { data = await response.text(); }
        if (!response.ok) {
          let msgErro = typeof data === "string" ? data : data?.message || "Erro ao cadastrar categoria.";
          if (msgErro.includes("já existe") || msgErro.includes("Existe")) msgErro = "⚠️ Essa categoria já foi cadastrada!";
          throw new Error(msgErro);
        }

        alert(`Categoria "${data.nome}" cadastrada com sucesso!✔`);
        nomeCategoriaInput.value = "";

      } catch (err) { alert(err.message); console.error(err); }
    });
  }

  // ==========================
  // FORMULÁRIO DE PRODUTO
  // ==========================
  const formProduto = document.querySelector("#form-produto");
  if (formProduto) {
    const nomeProdutoInput = document.querySelector("#nome-produto");
    const precoProdutoInput = document.querySelector("#preco-produto");
    const descricaoProdutoInput = document.querySelector("#descricao-produto");
    const contadorDescricao = document.querySelector("#contador-descricao");

    const categoriaInput = document.querySelector("#categoria");
    const categoriaContainer = document.querySelector(".categoria-selecionada");
    const categoriaExibida = document.querySelector("#categoria-exibida");

    const modal = document.querySelector("#modal-categoria");
    const listaCategorias = document.querySelector("#lista-categorias");
    const btnSelecionarTodos = document.querySelector("#btn-selecionar-todos");
    const btnDeselecionarTodos = document.querySelector("#btn-deselecionar-todos");
    const btnExcluirSelecionados = document.querySelector("#btn-excluir-selecionados");
    const btnConfirmarCategorias = document.querySelector("#btn-confirmar-categorias");
    const btnFecharModal = document.getElementById("btn-fechar-modal");

    const usuarioId = localStorage.getItem("usuarioId");

    // Capitalizar inputs
    capitalizarInput(nomeProdutoInput);
    capitalizarInput(descricaoProdutoInput);

    // Contador de descrição
    descricaoProdutoInput?.addEventListener("input", () => {
      const cursorPos = descricaoProdutoInput.selectionStart;
      descricaoProdutoInput.value = descricaoProdutoInput.value
        .split(" ")
        .map(p => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ");
      descricaoProdutoInput.setSelectionRange(cursorPos, cursorPos);

      const max = descricaoProdutoInput.getAttribute("maxlength") || 255;
      const atual = descricaoProdutoInput.value.length;
      if (contadorDescricao) {
        contadorDescricao.textContent = `${atual} / ${max}`;
        contadorDescricao.style.color = (atual >= max) ? "red" : "#888";
      }
    });

    // Formatação preço
    precoProdutoInput?.addEventListener("input", (e) => {
      const valorOriginal = e.target.value;
      const numeros = valorOriginal.replace(/\D/g, "");
      let numero = (parseInt(numeros || "0") / 100).toFixed(2);
      let partes = numero.split(".");
      partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      e.target.value = partes.join(",");
    });

    // Submit produto
    formProduto.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!token || !usuarioId) { alert("⚠️ Você precisa estar logado."); return; }

      const nomeProduto = nomeProdutoInput.value.trim();
      const precoValor = converterPrecoParaFloat(precoProdutoInput.value);
      const descricaoProduto = descricaoProdutoInput.value.trim();
      const categoriaIds = categoriaInput.value.split(",").filter(Boolean);

      if (!nomeProduto || !descricaoProduto || !precoValor || categoriaIds.length === 0) {
        alert("⚠️ Preencha todos os campos.");
        return;
      }

      const produtoPayload = {
        nome: nomeProduto,
        preco: precoValor,
        descricao: descricaoProduto,
        usuario: { id: parseInt(usuarioId) },
        categoria: { id: parseInt(categoriaIds[0]) }
      };

      try {
        const response = await fetch("http://localhost:8080/api/produtos", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify(produtoPayload)
        });

        let data;
        try { data = await response.json(); } catch { data = await response.text(); }

        if (!response.ok) {
          let msgErro = typeof data === "string" ? data : data?.message || "Erro ao cadastrar produto.";
          if (msgErro.includes("já existe") || msgErro.includes("Existe")) msgErro = "⚠️ Esse produto já foi cadastrado!";
          throw new Error(msgErro);
        }

        const categoriaNomes = Array.from(categoriaExibida.querySelectorAll(".tag")).map(t => t.textContent.replace('✖','').trim());
        const categoriaNome = categoriaNomes.length ? categoriaNomes.join(', ') : "Não informado";
        const precoFormatado = precoValor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

        alert(`✅ Produto cadastrado com sucesso!\n\n🏷️ Categoria: ${categoriaNome}\n📌 Nome: ${data.nome}\n💰 Preço: ${precoFormatado}\n📝 Descrição: ${data.descricao || descricaoProduto}`);

        // Limpar campos
        nomeProdutoInput.value = "";
        precoProdutoInput.value = "";
        descricaoProdutoInput.value = "";
        contadorDescricao.textContent = "0 / 255";
        categoriaInput.value = "";
        categoriaExibida.innerHTML = '<span class="placeholder">Nenhuma categoria selecionada</span>';
        categoriaContainer.classList.remove("ativa");

      } catch (err) { alert(err.message); console.error(err); }
    });
  }

  // ==========================
  // LOGOUT MANUAL
  // ==========================
  window.logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenCriadoEm");
    window.location.href = "/API_html/01_PG_login.html";
  };
});
