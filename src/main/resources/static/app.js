const API = "/api/funcionarios";
const form = document.getElementById("formFuncionario");
const mensagem = document.getElementById("mensagem");
const tabela = document.getElementById("listaFuncionarios");
const pesquisa = document.getElementById("pesquisa");
const btnEditar = document.getElementById("btnEditar");
const btnExcluir = document.getElementById("btnExcluir");
let funcionarios = [];
let selecionado = null;

function avisar(texto, tipo = "sucesso") {
  mensagem.textContent = texto;
  mensagem.className = `mensagem ${tipo}`;
}

function limparAviso() {
  mensagem.textContent = "";
  mensagem.className = "mensagem";
}

function cpfNumeros(valor) {
  return valor.replace(/\D/g, "");
}

function cpfValido(valor) {
  return cpfNumeros(valor).length === 11;
}

function escapar(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, caractere => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[caractere]));
}

function dinheiro(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function dataBR(valor) {
  if (!valor) return "";
  const partes = valor.split("-");
  return partes.length === 3
    ? `${partes[2]}/${partes[1]}/${partes[0]}`
    : valor;
}

async function requisicao(url, opcoes = {}) {
  const resposta = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...opcoes
  });

  if (!resposta.ok) {
    let detalhe = "Não foi possível concluir a operação.";

    try {
      const corpo = await resposta.json();
      detalhe = corpo.erro || corpo.message ||
        (corpo.errors && corpo.errors.map(e => e.defaultMessage).join(" ")) ||
        detalhe;
    } catch (_) {}

    throw new Error(detalhe);
  }

  if (resposta.status === 204) return null;
  return resposta.json();
}

async function carregar() {
  try {
    funcionarios = await requisicao(API);
    desenharTabela();
  } catch (erro) {
    tabela.innerHTML = `<tr><td colspan="7" class="vazio">Não foi possível carregar. Confira se o servidor e o banco de dados estão funcionando.</td></tr>`;
    avisar(erro.message, "erro");
  }
}

function desenharTabela() {
  const termo = pesquisa.value.trim().toLocaleLowerCase("pt-BR");

  const lista = funcionarios.filter(f =>
    `${f.nome} ${f.cpf} ${f.cargo} ${f.status}`
      .toLocaleLowerCase("pt-BR")
      .includes(termo)
  );

  if (!lista.length) {
    tabela.innerHTML = '<tr><td colspan="7" class="vazio">Nenhum funcionário encontrado.</td></tr>';
    return;
  }

  tabela.innerHTML = lista.map(f => `<tr data-id="${f.id}" class="${Number(selecionado) === Number(f.id) ? "selecionado" : ""}">
    <td>${f.id}</td>
    <td>${escapar(f.nome)}</td>
    <td>${escapar(f.cpf)}</td>
    <td>${dataBR(f.dataNascimento)}</td>
    <td>${escapar(f.cargo)}</td>
    <td>${dinheiro(f.salarioBase)}</td>
    <td class="${f.status === "ATIVO" ? "status-ativo" : "status-inativo"}">${f.status === "ATIVO" ? "Ativo" : "Inativo"}</td>
  </tr>`).join("");
}

function dadosFormulario() {
  return {
    nome: document.getElementById("nome").value.trim(),
    cpf: cpfNumeros(document.getElementById("cpf").value),
    dataNascimento: document.getElementById("dataNascimento").value,
    cargo: document.getElementById("cargo").value.trim(),
    salarioBase: Number(document.getElementById("salarioBase").value),
    status: document.getElementById("status").value
  };
}

function validar(dados) {
  if (
    !dados.nome ||
    !dados.cpf ||
    !dados.dataNascimento ||
    !dados.cargo ||
    !document.getElementById("salarioBase").value ||
    !dados.status
  ) {
    return "Preencha todos os campos.";
  }

  if (dados.nome.length > 120) {
    return "O nome deve ter no máximo 120 caracteres.";
  }

  if (!cpfValido(dados.cpf)) {
    return "O CPF deve conter exatamente 11 números.";
  }

  if (new Date(`${dados.dataNascimento}T00:00:00`) >= new Date(new Date().toDateString())) {
    return "A data de nascimento deve ser anterior a hoje.";
  }

  if (dados.cargo.length > 80) {
    return "O cargo deve ter no máximo 80 caracteres.";
  }

  if (
    !Number.isFinite(dados.salarioBase) ||
    dados.salarioBase < 0 ||
    !/^\d{1,10}(\.\d{1,2})?$/.test(String(document.getElementById("salarioBase").value))
  ) {
    return "Informe um salário válido, sem valor negativo e com até duas casas decimais.";
  }

  return "";
}

function limparFormulario() {
  form.reset();
  document.getElementById("id").value = "";
  selecionado = null;
  btnEditar.disabled = true;
  btnExcluir.disabled = true;
  document.getElementById("btnCadastrar").disabled = false;
  desenharTabela();
  limparAviso();
}

function selecionar(id) {
  const f = funcionarios.find(item => Number(item.id) === Number(id));
  if (!f) return;

  selecionado = f.id;
  document.getElementById("id").value = f.id;
  document.getElementById("nome").value = f.nome;
  document.getElementById("cpf").value = f.cpf;
  document.getElementById("dataNascimento").value = f.dataNascimento;
  document.getElementById("cargo").value = f.cargo;
  document.getElementById("salarioBase").value = f.salarioBase;
  document.getElementById("status").value = f.status;

  btnEditar.disabled = false;
  btnExcluir.disabled = false;
  document.getElementById("btnCadastrar").disabled = true;

  desenharTabela();
  limparAviso();
}

form.addEventListener("submit", async evento => {
  evento.preventDefault();
  limparAviso();

  const dados = dadosFormulario();
  const erro = validar(dados);

  if (erro) return avisar(erro, "erro");

  try {
    await requisicao(API, {
      method: "POST",
      body: JSON.stringify(dados)
    });

    limparFormulario();
    await carregar();
    avisar("Funcionário cadastrado com sucesso.");
  } catch (erroApi) {
    avisar(erroApi.message, "erro");
  }
});

document.getElementById("btnEditar").addEventListener("click", async () => {
  if (!selecionado) return;

  const dados = dadosFormulario();
  const erro = validar(dados);

  if (erro) return avisar(erro, "erro");

  try {
    await requisicao(`${API}/${selecionado}`, {
      method: "PUT",
      body: JSON.stringify(dados)
    });

    limparFormulario();
    await carregar();
    avisar("Funcionário atualizado com sucesso.");
  } catch (erroApi) {
    avisar(erroApi.message, "erro");
  }
});

document.getElementById("btnExcluir").addEventListener("click", async () => {
  if (!selecionado) return;

  const f = funcionarios.find(item => Number(item.id) === Number(selecionado));

  if (!f || !confirm(`Deseja excluir o funcionário ${f.nome}?`)) return;

  try {
    await requisicao(`${API}/${selecionado}`, {
      method: "DELETE"
    });

    limparFormulario();
    await carregar();
    avisar("Funcionário excluído com sucesso.");
  } catch (erroApi) {
    avisar(erroApi.message, "erro");
  }
});

document.getElementById("btnLimpar").addEventListener("click", limparFormulario);

tabela.addEventListener("click", evento => {
  const linha = evento.target.closest("tr[data-id]");
  if (linha) selecionar(linha.dataset.id);
});

pesquisa.addEventListener("input", desenharTabela);

document.getElementById("cpf").addEventListener("input", evento => {
  const numeros = cpfNumeros(evento.target.value).slice(0, 11);

  evento.target.value = numeros.length > 9
    ? `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`
    : numeros.length > 6
      ? `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`
      : numeros.length > 3
        ? `${numeros.slice(0, 3)}.${numeros.slice(3)}`
        : numeros;
});

carregar();
