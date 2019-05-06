// definindo um objeto de tabuleiro e um de partida para interagir com
const partida = new Chess();
let tabuleiro;

// impede que o computador jogue se:
// não for a vez das brancas
// o jogo acabou
const movimentoComeca = function(source, piece, position, orientation) {
  if (partida.in_checkmate() === true || partida.in_draw() === true ||
    piece.search(/^b/) !== -1) {
    return false;
  }
};

// aqui fica a
const fazMovimento = function() {
  var possibleMoves = partida.moves();

  // partida over
  if (possibleMoves.length === 0) return;

  var randomIndex = Math.floor(Math.random() * possibleMoves.length);
  partida.move(possibleMoves[randomIndex]);
  tabuleiro.position(partida.fen());
};

const aoLargar = function(origem, destino) {
  //  movimento realizado é legal? Se não for, desfaz
  var move = partida.move({
    from: origem,
    to: destino,
    promotion: 'q'
  });
  if (move === null) return 'snapback';

  // chama a IA para jogar no turno das peças pretas
  window.setTimeout(fazMovimento, 250);
};

// atualiza o tabuleiro depois da jogada
const movimentoTermina = function() { tabuleiro.position(partida.fen()); };


// Função minimax com limite de profundidade + função heurística
const minimaxProfundidade = function(partida, profundidade, maximiza){
  
  // Está no fundo? Se sim, faz a avaliação heurística
  if(profundidade == 0){
    return -avaliacao(partida.board());
  }

  // Monta todas as possibilidades de jogadas que a IA pode fazer
  var possibilidades = partida.moves();
  
  // É max? Se sim, maximiza o resultado.
  // Se não, minimiza o resultado.
  if (maximiza){

    // Seta alfa para o menor valor possível 
    alfa = -9999;

    // Percorre toda a lista de possibilidades
    for(var i = 0; i < possibilidades; i++){
      partida.ugly_move(possibilidades[i]);
      alfa = Math.max(alfa, minimaxProfundidade(possibilidades[i], profundidade - 1, !maximiza));
      partida.undo();
    }
    return alfa;

  }else{

    // Seta alfa para o maior valor possível 
    alfa = 9999;

    // Percorre toda a lista de possibilidades
    for(var i = 0; i < possibilidades; i++){
      partida.ugly_move(possibilidades[i]);
      alfa = Math.min(alfa, minimaxProfundidade(possibilidades[i], profundidade - 1, !maximiza ));
      partida.undo();
    }
    return alfa;
  }
};

const avaliacao = function(tabuleiro){
  const oito = 8;
  var total = 0;

  for (var i = 0; i < oito; i++){
    for(var j = 0; j < oito; j++){
      total += valorPeca(tabuleiro[i][j]); 
    }
  }
  return total;

};

const valorPeca = function(peca){
  if(peca == null){
    return 0;
  }
  var valor;
  switch(peca.type){
    case 'p':
      valor = 10;
      break;
    
    case 'r':
      valor = 50;
      break;
    
    case 'n':
      valor = 30;
      break;

    case 'b':
      valor = 30;
      break;

    case 'q':
      valor = 90;
      break;

    case 'k':
      valor = 900;
      break;

    default:
      valor = "Peça incomum: "+ peca.type;
  }

  return peca.color == 'w' ? valor : -valor;
};

// configurações constantes e retorno do tabuleiro modificável
const config = {
  position: 'start',
  draggable: true,
  onDragStart: movimentoComeca,
  onDrop: aoLargar,
  onSnapEnd: movimentoTermina,
}
tabuleiro = ChessBoard('tabuleiro', config);
