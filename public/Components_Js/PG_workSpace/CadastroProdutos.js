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
  // ELEMENTOS DOM - PRODUTOS
  // ==========================
  const produtosContainer = document.getElementById("produtos-container");
  const btnToggleLista = document.getElementById("btn-toggle-lista");
  const blocoListaProdutos = document.getElementById("bloco-lista-produtos");
  const checkTodosProdutos = document.getElementById("check-todos-produtos");
  const btnSelecionarTodos = document.getElementById("btn-selecionar-todos");
  const btnDesmarcarTodos = document.getElementById("btn-deselecionar-todos");
  const btnExcluirSelecionados = document.getElementById("btn-excluir-selecionados");

  const formProduto = document.getElementById("form-produto");
  const nomeInput = document.getElementById("nome-produto");
  const inputPreco = document.getElementById("preco-produto");
  const descricaoInput = document.getElementById("descricao-produto");
  const categoriaInput = document.getElementById("categoria");
  const categoriaExibida = document.getElementById("categoria-exibida");
  const categoriaContainer = document.querySelector(".categoria-selecionada");

  // ==========================
  // ELEMENTOS DOM - CATEGORIAS
  // ==========================
  const modal = document.getElementById("modal-categoria");
  const listaCategorias = document.getElementById("lista-categorias");
  const btnAbrirModal = document.getElementById("btn-abrir-modal");
  const btnFecharModal = document.getElementById("btn-fechar-modal");
  const btnConfirmarCategorias = document.getElementById("btn-confirmar-categorias");
  const btnSelecionarTodosModal = document.getElementById("btn-selecionar-todos-modal");
  const btnDesmarcarTodosModal = document.getElementById("btn-deselecionar-todos-modal");
  const btnExcluirSelecionadosModal = document.getElementById("btn-excluir-selecionados-modal");

  // ==========================
  // UTILITÁRIOS
  // ==========================
  const primeiraLetraMaiuscula = (texto) =>
    texto ? texto.split(" ").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ") : "";

  const atualizarInputCategorias = () => {
    const ids = Array.from(categoriaExibida.querySelectorAll(".tag")).map((t) => t.dataset.id);
    categoriaInput.value = ids.join(",");
  };

  const adicionarTag = (id, nome) => {
  const tagsExistentes = Array.from(categoriaExibida.querySelectorAll(".tag"));
  
  // Bloquear mais de uma categoria
  if (tagsExistentes.length >= 1) {
    return alert("⚠️ Apenas uma categoria por vez.");
  }

  if (tagsExistentes.some((t) => t.dataset.id === id)) return;

  const placeholder = categoriaExibida.querySelector(".placeholder");
  if (placeholder) placeholder.remove();

  const tag = document.createElement("span");
  tag.classList.add("tag");
  tag.dataset.id = id;
  tag.textContent = nome;

  const btnRemover = document.createElement("span");
  btnRemover.textContent = " ✖";
  btnRemover.style.cursor = "pointer";
  btnRemover.addEventListener("click", () => {
    tag.remove();
    const checkbox = document.querySelector(`.categoria-checkbox[value="${id}"]`);
    if (checkbox) checkbox.checked = false;

    if (!categoriaExibida.querySelectorAll(".tag").length) {
      categoriaExibida.innerHTML = `<span class="placeholder">Nenhuma categoria selecionada</span>`;
      categoriaContainer.classList.remove("ativa");
    }
    atualizarInputCategorias();
  });

  tag.appendChild(btnRemover);
  categoriaExibida.appendChild(tag);
  categoriaContainer.classList.add("ativa");
  atualizarInputCategorias();
};





  // ==========================
  // FUNÇÕES CATEGORIAS
  // ==========================
  const criarItemCategoria = (cat) => {
    const li = document.createElement("li");
    li.classList.add("categoria-item");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = cat.id;
    checkbox.classList.add("categoria-checkbox");

    const spanNome = document.createElement("span");
    spanNome.textContent = cat.nome;
    spanNome.classList.add("categoria-nome");
    spanNome.style.cursor = "pointer";

    spanNome.addEventListener("click", () => {
      checkbox.checked = !checkbox.checked;
      spanNome.classList.toggle("selecionado", checkbox.checked);
    });
    checkbox.addEventListener("change", () => spanNome.classList.toggle("selecionado", checkbox.checked));

    const btnEditar = document.createElement("button");
    btnEditar.textContent = "✏️";
    btnEditar.title = "Editar categoria";
    btnEditar.addEventListener("click", async (e) => {
      e.stopPropagation();
      const novoNome = prompt("Digite o novo nome da categoria:", cat.nome);
      if (!novoNome?.trim()) return;
      await fetch(`http://localhost:8080/api/categorias/${cat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nome: novoNome.trim() }),
      });
      await carregarCategorias();
      aplicarCategoriasSelecionadas();
    });

    const btnExcluir = document.createElement("button");
    btnExcluir.textContent = "🗑️";
    btnExcluir.title = "Excluir categoria";
    btnExcluir.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (!confirm(`Deseja realmente excluir "${cat.nome}"?`)) return;
      await fetch(`http://localhost:8080/api/categorias/${cat.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await carregarCategorias();
      aplicarCategoriasSelecionadas();
    });

    li.append(checkbox, spanNome, btnEditar, btnExcluir);
    return li;
  };

  const carregarCategorias = async () => {
    listaCategorias.innerHTML = "";
    try {
      const res = await fetch("http://localhost:8080/api/categorias", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao carregar categorias.");
      const categorias = await res.json();

      categorias.forEach((cat) => {
        const li = criarItemCategoria(cat);
        const tagExistente = Array.from(categoriaExibida.querySelectorAll(".tag")).find(
          (t) => t.dataset.id == cat.id
        );
        const checkbox = li.querySelector(".categoria-checkbox");
        const spanNome = li.querySelector(".categoria-nome");
        checkbox.checked = !!tagExistente;
        spanNome.classList.toggle("selecionado", checkbox.checked);
        listaCategorias.appendChild(li);
      });
    } catch (err) {
      alert(err.message);
      console.error(err);
    }
  };

  const aplicarCategoriasSelecionadas = () => {
    categoriaExibida.innerHTML = "";
    const selecionadas = Array.from(document.querySelectorAll(".categoria-checkbox:checked"));
    if (selecionadas.length) {
      categoriaContainer.classList.add("ativa");
      selecionadas.forEach((cb) => adicionarTag(cb.value, cb.nextElementSibling.textContent));
    } else {
      categoriaContainer.classList.remove("ativa");
      categoriaExibida.innerHTML = `<span class="placeholder">Nenhuma categoria selecionada</span>`;
    }
    atualizarInputCategorias();
  };

  btnAbrirModal?.addEventListener("click", async () => {
    modal.style.display = "block";
    await carregarCategorias();
  });
  btnFecharModal?.addEventListener("click", () => (modal.style.display = "none"));
  btnConfirmarCategorias?.addEventListener("click", () => {
    aplicarCategoriasSelecionadas();
    modal.style.display = "none";
  });

  btnSelecionarTodosModal?.addEventListener("click", () => {
    document.querySelectorAll(".categoria-checkbox").forEach(cb => cb.checked = true);
  });
  btnDesmarcarTodosModal?.addEventListener("click", () => {
    document.querySelectorAll(".categoria-checkbox").forEach(cb => cb.checked = false);
  });
  btnExcluirSelecionadosModal?.addEventListener("click", async () => {
    const selecionadas = Array.from(document.querySelectorAll(".categoria-checkbox:checked"));
    if (!selecionadas.length) return alert("Nenhuma categoria selecionada.");
    if (!confirm(`Deseja realmente excluir ${selecionadas.length} categoria(s)?`)) return;

    try {
      for (const cb of selecionadas) {
        const id = cb.value;
        await fetch(`http://localhost:8080/api/categorias/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      alert("✅ Categorias excluídas com sucesso!");
      await carregarCategorias();
      aplicarCategoriasSelecionadas();
    } catch (err) {
      alert(err.message);
      console.error(err);
    }
  });

  // ==========================
  // FUNÇÕES PRODUTOS
  // ==========================
  const criarProdutoItem = (prod) => {
    const item = document.createElement("div");
    item.className = "produto-item";
    item.innerHTML = `
      <div><input type="checkbox" class="produto-checkbox" value="${prod.id}"></div>
      <div>${prod.id}</div>
      <div>${prod.nome}</div>
      <div>R$ ${prod.preco.toFixed(2).replace('.', ',')}</div>
      <div>${prod.descricao || "-"}</div>
      <div>${prod.categoria?.nome || "Sem categoria"}</div>
      <div class="acoes">
        <button class="btn-editar" data-id="${prod.id}">✏️</button>
        <button class="btn-excluir" data-id="${prod.id}">🗑️</button>
      </div>
    `;
    vincularEventosProduto(item, prod);
    return item;
  };

  const vincularEventosProduto = (item, prod) => {
    const btnEditar = item.querySelector(".btn-editar");
    const btnExcluir = item.querySelector(".btn-excluir");

    btnEditar.addEventListener("click", async () => {
      const novoNome = prompt("Digite o novo nome do produto:", prod.nome);
      if (!novoNome?.trim()) return;
      const novoPreco = parseFloat(prompt("Digite o novo preço:", prod.preco));
      if (isNaN(novoPreco)) return alert("Preço inválido.");
      const novaDescricao = prompt("Digite a nova descrição:", prod.descricao);

      const payload = {
        nome: novoNome.trim(),
        preco: novoPreco,
        descricao: novaDescricao,
        categoria: { id: prod.categoria?.id || 1 },
        usuario: { id: parseInt(usuarioId) },
      };

      try {
        const res = await fetch(`http://localhost:8080/api/produtos/${prod.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Erro ao atualizar produto.");
        alert("✅ Produto atualizado com sucesso!");
        listarProdutosFiltrados();
      } catch (err) {
        alert(err.message);
        console.error(err);
      }
    });

    btnExcluir.addEventListener("click", async () => {
      if (!confirm(`Deseja realmente excluir "${prod.nome}"?`)) return;
      try {
        const res = await fetch(`http://localhost:8080/api/produtos/${prod.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erro ao excluir produto.");
        alert("✅ Produto excluído com sucesso!");
        listarProdutosFiltrados();
      } catch (err) {
        alert(err.message);
        console.error(err);
      }
    });
  };

  const listarProdutosFiltrados = async () => {
    const categoriaIds = categoriaInput.value.split(",").filter(Boolean);
    try {
      const res = await fetch("http://localhost:8080/api/produtos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao carregar produtos.");
      let produtos = await res.json();
      if (categoriaIds.length) produtos = produtos.filter((p) => categoriaIds.includes(String(p.categoria?.id)));
      produtosContainer.innerHTML = "";
      produtos.forEach((prod) => produtosContainer.appendChild(criarProdutoItem(prod)));
    } catch (err) {
      alert(err.message);
      console.error(err);
    }
  };

  // =========================
  // FORMULÁRIO PRODUTO
  // ==========================
  formProduto?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nome = nomeInput.value.trim();
    const precoStr = inputPreco.value.trim();
    const descricao = descricaoInput.value.trim();
    const categoriaId = categoriaInput.value.split(",")[0] || 1;

    if (!nome) return alert("⚠️ O campo nome é obrigatório.");
    if (!precoStr) return alert("⚠️ O campo de preço é obrigatório.");

    const preco = parseFloat(precoStr.replace(/\./g, "").replace(",", "."));
    if (isNaN(preco)) return alert("⚠️ Preço inválido!");

    const payload = {
      nome,
      preco,
      descricao,
      categoria: { id: parseInt(categoriaId) },
      usuario: { id: parseInt(usuarioId) },
    };

    try {
      const res = await fetch("http://localhost:8080/api/produtos", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message);

      produtosContainer.appendChild(criarProdutoItem(data));
      alert("✅ Produto cadastrado com sucesso!");
      formProduto.reset();
      categoriaExibida.innerHTML = `<span class="placeholder">Nenhuma categoria selecionada</span>`;
      categoriaContainer.classList.remove("ativa");
      categoriaInput.value = "";
    } catch (err) {
      alert("Erro de conexão. Tente novamente.");
      console.error(err);
    }
  });

  // ==========================
  // BOTÕES LISTA PRODUTOS
  // ==========================
  btnToggleLista?.addEventListener("click", () => {
    const aberto = blocoListaProdutos.style.display === "block";
    blocoListaProdutos.style.display = aberto ? "none" : "block";
    btnToggleLista.textContent = aberto ? "📦 Mostrar Produtos" : "❌ Fechar Lista de Produtos";
  });

  btnSelecionarTodos?.addEventListener("click", () => {
    produtosContainer.querySelectorAll(".produto-checkbox").forEach(cb => cb.checked = true);
    checkTodosProdutos.checked = true;
  });

  btnDesmarcarTodos?.addEventListener("click", () => {
    produtosContainer.querySelectorAll(".produto-checkbox").forEach(cb => cb.checked = false);
    checkTodosProdutos.checked = false;
  });

  checkTodosProdutos?.addEventListener("change", () => {
    const marcado = checkTodosProdutos.checked;
    produtosContainer.querySelectorAll(".produto-checkbox").forEach(cb => cb.checked = marcado);
  });

  btnExcluirSelecionados?.addEventListener("click", async () => {
    const selecionados = Array.from(produtosContainer.querySelectorAll(".produto-checkbox:checked"));
    if (!selecionados.length) return alert("Nenhum produto selecionado.");
    if (!confirm(`Deseja realmente excluir ${selecionados.length} produto(s)?`)) return;

    try {
      for (const cb of selecionados) {
        const id = cb.value;
        await fetch(`http://localhost:8080/api/produtos/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      alert("✅ Produtos excluídos com sucesso!");
      listarProdutosFiltrados();
    } catch (err) {
      alert(err.message);
      console.error(err);
    }
  });

  // ==========================
  // INICIALIZAÇÃO
  // ==========================
  listarProdutosFiltrados();
  aplicarCategoriasSelecionadas();
});
