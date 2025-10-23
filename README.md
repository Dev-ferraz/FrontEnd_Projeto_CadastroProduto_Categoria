### 💻 Frontend

Toda execução é possível dentro do **VS Code**, utilizando o terminal integrado.

---

#### Tecnologias utilizadas

- **Linguagem:** TypeScript  
- **Versão do TypeScript:** 5.9.3  
- **Runtime:** Node.js v22.20.0  
- **VS Code:** [Baixar VS Code](https://code.visualstudio.com/Download)  
- **Gerenciador de pacotes:** npm  
- **Framework Front-end:** Vue.js / React / Angular (ajuste conforme seu uso)  
- **Integração:** Consumo de API REST via HTTP (Axios / Fetch)  
- **Estilização:** CSS moderno e responsivo

---

#### 📥 Instalação do TypeScript 5.9.3

```bash
# Instalar TypeScript globalmente
npm install -g typescript@5.9.3

# Verificar a versão instalada
tsc --version

📥 Instalação do Node.js v22.20.0

Windows:

Baixe o instalador MSI diretamente: Node.js v22.20.0 MSI / https://nodejs.org/dist/v22.20.0/

Execute o instalador e siga os passos na tela.

Verifique a instalação no terminal ou PowerShell:

node -v
npm -v


⚠️ **Observação:** O Docker Compose já está configurado para expor o frontend na porta correta (localhost:5174).  
Você poderá acessar a aplicação diretamente em:  

- [Login](http://localhost:5174/api_html/01_pg_login.html)  
- [Novo Usuário](http://localhost:5174/api_html/02_pg_newUsuario.html)  
- [Verificar Cadastro](http://localhost:5174/api_html/03_pg_verificarCadastro.html)  
- [Recuperar Senha](http://localhost:5174/api_html/04_pg_recuperarSenha.html)  
- [Redefinir Senha](http://localhost:5174/api_html/05_pg_redefinirSenha.html)  
- [Workspace Principal](http://localhost:5174/api_html/07_pg_workspace.html)  
- [Cadastro de Categorias](http://localhost:5174/api_html/pg_workSpace/CadastroCategorias.html)  
- [Cadastro de Produtos](http://localhost:5173/api_html/pg_workSpace/CadastroProdutos.html)  
- [Usuário](http://localhost:8080/usuario)  

**💻 Comando para rodar o frontend (TypeScript) na raiz do projeto:**
```bash
# 1. Instalar dependências
npm install

# 2. Rodar o servidor de desenvolvimento
npm run dev
