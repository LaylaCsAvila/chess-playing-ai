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

// aqui fica a IA
const fazMovimento = function() {
  var possibleMoves = partida.moves();

  // partida terminada
  if (possibleMoves.length === 0) return;

  // var randomIndex = Math.floor(Math.random() * possibleMoves.length);
  var profundidade = 3;
  var MelhorJogada = minimaxRaiz(partida, profundidade, true);
  partida.move(MelhorJogada);
  tabuleiro.position(partida.fen());
};

// função raiz do minimax, que retorna a melhor jogada encontrada
var minimaxRaiz =function(partida, profundidade, EhJogadorMax) {

  var possibilidades = partida.moves();
  var MelhorJogada = -9999;
  var MelhorJogadaEncontrada;

  for(var i = 0; i < possibilidades.length; i++) {
      var jogada = possibilidades[i];
      partida.move(jogada);
      var valor = minimax(partida, profundidade - 1, !EhJogadorMax);
      partida.undo();
      if(valor >= MelhorJogada) {
          MelhorJogada = valor;
          MelhorJogadaEncontrada = jogada;
      }
  }
  return MelhorJogadaEncontrada;
};

// Função minimax com limite de profundidade + função heurística
const minimax = function(partida, profundidade, EhJogadorMax){
  
  // Está no fundo? Se sim, faz a avaliação heurística
  if(profundidade == 0){
    return -avaliaTabuleiro(partida.board());
  }

  // Monta todas as possibilidades de jogadas que a IA pode fazer
  var possibilidades = partida.moves();
  
  // É max? Se sim, maximiza o resultado.
  // Se não, minimiza o resultado.
  if (EhJogadorMax){

    // Seta MelhorJogada para o menor valor possível 
    var MelhorJogada = -9999;

    // Percorre toda a lista de possibilidades
    for(var i = 0; i < possibilidades; i++){
      partida.move(possibilidades[i]);
      MelhorJogada = Math.max(MelhorJogada, minimax(partida, profundidade - 1, !EhJogadorMax));
      partida.undo();
    }
    return MelhorJogada;

  }else{

    // Seta MelhorJogada para o maior valor possível 
    var MelhorJogada = 9999;

    // Percorre toda a lista de possibilidades
    for(var i = 0; i < possibilidades; i++){
      partida.move(possibilidades[i]);
      MelhorJogada = Math.min(MelhorJogada, minimax(partida, profundidade - 1, !EhJogadorMax));
      partida.undo();
    }
    return MelhorJogada;
  }
};

const avaliaTabuleiro = function(tabuleiro){
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
