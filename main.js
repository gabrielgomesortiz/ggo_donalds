// ========== VARIÁVEIS GLOBAIS ==========
const PEDIDO_KEY = 'pedidoAtual';
let lista_comidas = [];
let cardapioCompleto = {};
let pedidos = {
  hamburgueres: {},
  acompanhamentos: {},
  bebidas: {},
};
let categoriaAtual = "";

// ========== FUNÇÕES DE CARREGAMENTO ==========
window.onload = function() {
  categoriaAtual = "hamburgueres";
  carregarCSV("./CSVs/hamburgue.csv");
  carregarPedidoExistente();
};

function carregarPedidoExistente() {
  const pedidoSalvo = sessionStorage.getItem(PEDIDO_KEY);

  if (pedidoSalvo) {
    try {
      const pedido = JSON.parse(pedidoSalvo);
      
      for (const categoria in pedido.pedidos) {
        pedido.pedidos[categoria].forEach(item => {
          pedidos[categoria][item.id] = item.quantidade;
        });
      }
    } catch (e) {
      console.error('Erro ao carregar pedido:', e);
    }
  }
}

function carregarCSV(nomeArquivo) {
  fetch(nomeArquivo)
    .then((response) => {
      if (!response.ok) throw new Error(`Erro ao carregar ${nomeArquivo}: ${response.status}`);
      return response.text();
    })
    .then((data) => {
      lista_comidas += `${nomeArquivo}:\n${data}\n\n`;
      const itensCardapio = processarCSV(data, categoriaAtual);
      gerarCardapio(itensCardapio, categoriaAtual);
    })
    .catch((error) => {
      console.error("Erro ao carregar CSV:", error);
    });
}

// ========== FUNÇÕES DE INTERFACE ==========
function menu() {
  let listaMenu = document.querySelector(".menu__opcoes");
  let menu = document.querySelector("#menu");

  if (listaMenu.style.display === "block") {
    listaMenu.style.display = "none";
    menu.style.border = "none";
  } else {
    listaMenu.style.display = "block";
    menu.style.border = "1px solid black";
  }
}

function gerarCardapio(itens, categoria) {
  const cardapioContainer = document.querySelector(".cardapio");
  cardapioContainer.innerHTML = "";

  itens.forEach((item) => {
    const itemHTML = `
      <section class="item-cardapio">
        <img src="${item.caminho__img}" alt="${item.nome}" onerror="this.src='./assets/imagem-padrao.jpg'">
        <p>
          <strong>${item.nome}</strong><br>
          R$ ${item.preco}
        </p>
        <input type="number" data-id="${item.idUnico}" class="quantidade" min="0">
      </section>
    `;
    cardapioContainer.insertAdjacentHTML("beforeend", itemHTML);
  });

  document.querySelectorAll(".quantidade").forEach((input) => {
    input.addEventListener("change", atualizarQuantidade);
  });

  atualizarQuantidadesNosInputs();
}

function atualizarQuantidadesNosInputs() {
  document.querySelectorAll('.quantidade').forEach(input => {
    const idCompleto = input.dataset.id;
    const [categoria, idItem] = idCompleto.split('_');
    
    if (pedidos[categoria] && pedidos[categoria][idItem]) {
      input.value = pedidos[categoria][idItem];
    } else {
      input.value = "";
    }
  });
}

// ========== FUNÇÕES DE PEDIDO ==========
function atualizarQuantidade() {
  const idCompleto = this.dataset.id;
  const [categoria, idItem] = idCompleto.split("_");
  const quantidade = parseInt(this.value) || 0;
  atualizarPedido(categoria, idItem, quantidade);
}

function atualizarPedido(categoria, idItem, quantidade) {
  if (quantidade > 0) {
    pedidos[categoria][idItem] = quantidade;
  } else {
    delete pedidos[categoria][idItem];
  }
  console.log("Pedidos atualizados:", pedidos);
}

function temPedidos() {
  for (const categoria in pedidos) {
    if (Object.keys(pedidos[categoria]).length > 0) return true;
  }
  return false;
}

function gerarJSONPedido() {
  if (!temPedidos()) {
    alert("Por favor, adicione itens ao seu pedido antes de finalizar!");
    return false;
  }

  const pedidoFinal = {
    data: new Date().toLocaleString('pt-BR'),
    pedidos: {},
    totalGeral: 0,
    itensTotais: 0
  };

  for (const categoria in pedidos) {
    if (Object.keys(pedidos[categoria]).length === 0) continue;

    pedidoFinal.pedidos[categoria] = [];

    for (const idItem in pedidos[categoria]) {
      const idCompleto = `${categoria}_${idItem}`;
      const quantidade = pedidos[categoria][idItem];

      if (quantidade > 0 && cardapioCompleto[idCompleto]) {
        const itemInfo = cardapioCompleto[idCompleto];
        const precoTotal = parseFloat((itemInfo.preco * quantidade).toFixed(2));

        pedidoFinal.pedidos[categoria].push({
          id: idItem,
          nome: itemInfo.nome,
          precoUnitario: itemInfo.preco,
          quantidade: quantidade,
          precoTotal: precoTotal,
        });

        pedidoFinal.totalGeral += precoTotal;
        pedidoFinal.itensTotais += quantidade;
      }
    }
  }

  pedidoFinal.totalGeral = parseFloat(pedidoFinal.totalGeral.toFixed(2));
  sessionStorage.setItem(PEDIDO_KEY, JSON.stringify(pedidoFinal));  window.location.href = "./html/conta.html";
  return true;
}

// ========== EVENT LISTENERS ==========
document.querySelector(".cabecalho__nav").addEventListener("click", function(event) {
  const botaoClicado = event.target.closest(".comidas");

  if (botaoClicado.id === "hamburguer") {
    categoriaAtual = "hamburgueres";
    carregarCSV("./CSVs/hamburgue.csv");
  } else if (botaoClicado.id === "porcoes") {
    categoriaAtual = "acompanhamentos";
    carregarCSV("./CSVs/acompanhamentos.csv");
  } else if (botaoClicado.id === "bebidas") {
    categoriaAtual = "bebidas";
    carregarCSV("./CSVs/bebidas.csv");
  }
});

document.querySelector("form").addEventListener("submit", function(e) {
  e.preventDefault();
  gerarJSONPedido();
});

// ========== PROCESSAMENTO DE CSV ==========
function processarCSV(csvData, categoria) {
  const linhas = csvData.split("\n");
  const cabecalhos = linhas[0].split(";");
  const itens = [];

  for (let i = 1; i < linhas.length; i++) {
    if (!linhas[i].trim()) continue;

    const valores = linhas[i].split(";");
    const item = {};

    cabecalhos.forEach((cabecalho, index) => {
      item[cabecalho] = valores[index];
    });

    const idUnico = `${categoria}_${item.id}`;

    cardapioCompleto[idUnico] = {
      nome: item.nome,
      preco: parseFloat(item.preco),
      caminho_img: item.caminho__img,
      categoria: categoria,
    };

    itens.push({ ...item, idUnico });
  }

  return itens;
}