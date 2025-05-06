const PEDIDO_KEY = 'pedidoAtual';
document.addEventListener('DOMContentLoaded', function() {
    const pedidoJSON = sessionStorage.getItem(PEDIDO_KEY);
    console.log(pedidoJSON)
    
    if (!pedidoJSON) {
        mostrarMensagemErro('Nenhum pedido encontrado.');
        return;
    }

    try {
        const pedido = JSON.parse(pedidoJSON);
        exibirPedido(pedido);
    } catch (error) {
        console.error('Erro ao processar pedido:', error);
        mostrarMensagemErro('Erro ao carregar o pedido.');
    }

    configurarBotoes();
});

function exibirPedido(pedido) {
    const container = document.querySelector('.conta');
    container.innerHTML = '';
    
    ['hamburgueres', 'acompanhamentos', 'bebidas'].forEach(categoria => {
        if (pedido.pedidos[categoria]?.length > 0) {
            const tituloCategoria = document.createElement('h2');
            tituloCategoria.className = 'categoria-titulo';
            tituloCategoria.textContent = formatarTituloCategoria(categoria);
            container.appendChild(tituloCategoria);
            
            adicionarItens(container, pedido.pedidos[categoria]);
        }
    });

    if (pedido.totalGeral > 0) {
        const totalDiv = document.createElement('div');
        totalDiv.className = 'conta-total';
        totalDiv.innerHTML = `
            <p>Total a pagar: <span>R$ ${pedido.totalGeral.toFixed(2)}</span></p>
            <p>Itens: ${pedido.itensTotais}</p>
            <p>Data: ${pedido.data}</p>
        `;
        container.appendChild(totalDiv);
    }
}

function adicionarItens(container, itens) {
    itens.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'conta-item';
        itemDiv.innerHTML = `
            <p class="coluna_nome">${item.nome}</p>
            <p class="coluna_quantidade">${item.quantidade}x</p>
            <p class="coluna_preco">R$ ${item.precoTotal.toFixed(2)}</p>
        `;
        container.appendChild(itemDiv);
    });
}

function formatarTituloCategoria(categoria) {
    const titulos = {
        'hamburgueres': 'Hambúrguere:',
        'acompanhamentos': 'Acompanhamentos:',
        'bebidas': 'Bebidas:'
    };
    return titulos[categoria] || categoria;
}

function mostrarMensagemErro(mensagem) {
    document.querySelector('.conta').innerHTML = `
        <p class="mensagem-erro">${mensagem}</p>
        <button onclick="window.location.href='../index.html'">Voltar ao cardápio</button>
    `;
}

function configurarBotoes() {
    const botoes = document.querySelectorAll('.buttons_volta_prosseguir');
    botoes[0].addEventListener('click', voltarParaCardapio);
    botoes[1].addEventListener('click', finalizarCompra);
}

function voltarParaCardapio() {
    window.history.back();
}

function finalizarCompra() {
    if (confirm('Tem certeza que deseja finalizar a compra?')) {
        sessionStorage.removeItem(PEDIDO_KEY);
        window.location.href = './pagamento.html';
    }
}