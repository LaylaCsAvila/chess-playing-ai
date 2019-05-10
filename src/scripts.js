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

var contadorDePosicoes;

// aqui fica a IA
const fazMovimento = function() {
  var possibleMoves = partida.ugly_moves();

  // partida terminada
  if (possibleMoves.length === 0) return;
  contadorDePosicoes = 0;

  var profundidade = parseInt($('#search-depth').find(':selected').text());

  var d = new Date().getTime();

  var MelhorJogada = minimaxRaiz(partida, profundidade, true);

  var d2 = new Date().getTime();
  var tempoDeJogada = (d2 - d);
  var posicoesPorSeg = ( contadorDePosicoes * 1000 / tempoDeJogada);

  $('#position-count').text(contadorDePosicoes);
  $('#time').text(tempoDeJogada/1000 + 's');
  $('#positions-per-s').text(posicoesPorSeg);
  
  partida.ugly_move(MelhorJogada);
  tabuleiro.position(partida.fen());
};

// função raiz do minimax, que retorna a melhor jogada encontrada
var minimaxRaiz =function(partida, profundidade, EhJogadorMax) {

  var possibilidades = partida.ugly_moves();
  var MelhorJogada = -9999;
  var MelhorJogadaEncontrada;

  for(var i = 0; i < possibilidades.length; i++) {
      var jogada = possibilidades[i];
      partida.ugly_move(jogada);
      // inicia os valores de alpha e beta com o mínimo e máximo
      var alpha = -10000;
      var beta = 10000;
      var valor = minimaxPoda(partida, profundidade - 1, alpha, beta, !EhJogadorMax);
      //var valor = minimaxProfundidade(partida, profundidade-1, !EhJogadorMax);
      partida.undo();
      if(valor >= MelhorJogada) {
          MelhorJogada = valor;
          MelhorJogadaEncontrada = jogada;
      }
  }
  return MelhorJogadaEncontrada;
};

// Função minimax com poda 
const minimaxPoda = function(partida, profundidade, alpha, beta, EhJogadorMax){
  contadorDePosicoes++;
  // Está no fundo? Se sim, faz a avaliação de utilidade
  if(profundidade == 0){
    return -avaliaTabuleiro(partida.board() );
  }

  // Monta todas as possibilidades de jogadas que a IA pode fazer
  var possibilidades = partida.ugly_moves();
  // É max? Se sim, maximiza o resultado.
  // Se não, minimiza o resultado.
  if (EhJogadorMax){

    // Seta MelhorJogada para o menor valor possível 
    var MelhorJogada = -9999;
     
    // Percorre toda a lista de possibilidades
    for(var i = 0; i < possibilidades.length; i++){
      partida.ugly_move(possibilidades[i]);
      MelhorJogada = Math.max(MelhorJogada, minimaxPoda(partida, profundidade - 1, alpha, beta, !EhJogadorMax));
      partida.undo();      
      alpha = Math.max(alpha, MelhorJogada);
      if (beta <= alpha) {
          return MelhorJogada;
      }
    }
    return MelhorJogada;

  }else{

    // Seta MelhorJogada para o maior valor possível 
    var MelhorJogada = 9999;

    // Percorre toda a lista de possibilidades
    for(var i = 0; i < possibilidades.length; i++){
      partida.ugly_move(possibilidades[i]);
      MelhorJogada = Math.min(MelhorJogada, minimaxPoda(partida, profundidade - 1, alpha, beta, !EhJogadorMax));
      partida.undo();      
      beta = Math.min(beta, MelhorJogada);
      if (beta <= alpha) {
          return MelhorJogada;
      }
    }
    return MelhorJogada;
  }
};

// Função minimax com limite de profundidade + função heurística
const minimaxProfundidade = function(partida, profundidade, EhJogadorMax){
  contadorDePosicoes++;
  // Está no fundo? Se sim, faz a avaliação heurística
  if(profundidade == 0){
    return -avaliaTabuleiro(partida.board() );
  }

  // Monta todas as possibilidades de jogadas que a IA pode fazer
  var possibilidades = partida.ugly_moves();
  
  // É max? Se sim, maximiza o resultado.
  // Se não, minimiza o resultado.
  if (EhJogadorMax){

    // Seta MelhorJogada para o menor valor possível 
    var MelhorJogada = -9999;

    // Percorre toda a lista de possibilidades
    for(var i = 0; i < possibilidades.length; i++){
      partida.ugly_move(possibilidades[i]);
      MelhorJogada = Math.max(MelhorJogada, minimaxProfundidade(partida, profundidade - 1, !EhJogadorMax));
      partida.undo();
    }
    return MelhorJogada;

  }else{

    // Seta MelhorJogada para o maior valor possível 
    var MelhorJogada = 9999;

    // Percorre toda a lista de possibilidades
    for(var i = 0; i < possibilidades.length; i++){
      partida.ugly_move(possibilidades[i]);
      MelhorJogada = Math.min(MelhorJogada, minimaxProfundidade(partida, profundidade - 1, !EhJogadorMax));
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
