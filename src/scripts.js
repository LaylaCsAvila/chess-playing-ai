// definindo um objeto de tabuleiro e um de partida para interagir com
const partida = new Chess();
let tabuleiro;

let minimaxTipo = 1;

// impede que o humano jogue se:
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

const jogoAutomatico = function() {
  let counter = 2;
  // chama a IA para jogar
    window.setTimeout(fazMovimento(minimaxTipo), 250);
    
    if (minimaxTipo == 1) minimaxTipo = 2;
    else minimaxTipo = 1;
    
    if (!partida.in_checkmate() || !partida.in_draw()){
      window.setTimeout(jogoAutomatico,500);
    }
}

// atualiza o tabuleiro depois da jogada
const movimentoTermina = function() { tabuleiro.position(partida.fen()); };

var contadorDePosicoes;

// aqui fica a IA
const fazMovimento = function(minimaxTipo) {
  var possibleMoves = partida.ugly_moves();

  // partida terminada
  if (possibleMoves.length === 0) return;
  contadorDePosicoes = 0;

  var profundidade = parseInt($('#search-depth').find(':selected').text());
  //const minimaxTipo = parseInt($('#search-function').find(':selected').val());

  var d = new Date().getTime();

  var MelhorJogada = minimaxRaiz(partida, profundidade, true, minimaxTipo);

  var d2 = new Date().getTime();
  var tempoDeJogada = (d2 - d);
  var posicoesPorSeg = ( contadorDePosicoes * 1000 / tempoDeJogada);

  $('#position-count').text(contadorDePosicoes);
  $('#time').text(tempoDeJogada/1000 + 's');
  $('#positions-per-s').text(posicoesPorSeg);

  partida.ugly_move(MelhorJogada);
  tabuleiro.position(partida.fen());
};

// função raiz do minimax, que retorna a melhor jogada encontrada depois de decidir
// qual algoritmo usar
var minimaxRaiz =function(partida, profundidade, EhJogadorMax, qualMinMax) {
  var possibilidades = partida.ugly_moves();
  var MelhorJogada = -9999;
  var MelhorJogadaEncontrada;

  for(var i = 0; i < possibilidades.length; i++) {
      var jogada = possibilidades[i];
      partida.ugly_move(jogada);
      // inicia os valores de alpha e beta com o mínimo e máximo
      var alpha = -10000;
      var beta = 10000;
      let valor;
      if(qualMinMax === 1) {
        valor = minimaxPoda(partida, profundidade - 1, alpha, beta, !EhJogadorMax);
      }
      if(qualMinMax === 2) {
        valor = minimaxProfundidade(partida, profundidade-1, !EhJogadorMax);
      }
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
    return avaliaTabuleiro(partida.board() );
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



var avaliaTabuleiro = function (tabuleiro) {
  var avaliacaoTotal = 0;
  for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
          avaliacaoTotal = avaliacaoTotal + valorPeca(tabuleiro[i][j], i ,j);
      }
  }
  return avaliacaoTotal;
};

var reverteMatriz = function(matriz) {
  return matriz.slice().reverse();
};

var avalPeaoBranca =
  [
      [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
      [5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0],
      [1.0,  1.0,  2.0,  3.0,  3.0,  2.0,  1.0,  1.0],
      [0.5,  0.5,  1.0,  2.5,  2.5,  1.0,  0.5,  0.5],
      [0.0,  0.0,  0.0,  2.0,  2.0,  0.0,  0.0,  0.0],
      [0.5, -0.5, -1.0,  0.0,  0.0, -1.0, -0.5,  0.5],
      [0.5,  1.0, 1.0,  -2.0, -2.0,  1.0,  1.0,  0.5],
      [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]
  ];

var avalPeaolPreta = reverteMatriz(avalPeaoBranca);

var avalCavalo =
  [
      [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
      [-4.0, -2.0,  0.0,  0.0,  0.0,  0.0, -2.0, -4.0],
      [-3.0,  0.0,  1.0,  1.5,  1.5,  1.0,  0.0, -3.0],
      [-3.0,  0.5,  1.5,  2.0,  2.0,  1.5,  0.5, -3.0],
      [-3.0,  0.0,  1.5,  2.0,  2.0,  1.5,  0.0, -3.0],
      [-3.0,  0.5,  1.0,  1.5,  1.5,  1.0,  0.5, -3.0],
      [-4.0, -2.0,  0.0,  0.5,  0.5,  0.0, -2.0, -4.0],
      [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0]
  ];

var avalBispoBranca = [
  [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
  [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
  [ -1.0,  0.0,  0.5,  1.0,  1.0,  0.5,  0.0, -1.0],
  [ -1.0,  0.5,  0.5,  1.0,  1.0,  0.5,  0.5, -1.0],
  [ -1.0,  0.0,  1.0,  1.0,  1.0,  1.0,  0.0, -1.0],
  [ -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0],
  [ -1.0,  0.5,  0.0,  0.0,  0.0,  0.0,  0.5, -1.0],
  [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]
];

var avalBispoPreta = reverteMatriz(avalBispoBranca);

var avalTorreBranca = [
  [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
  [  0.5,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  0.5],
  [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
  [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
  [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
  [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
  [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
  [  0.0,   0.0, 0.0,  0.5,  0.5,  0.0,  0.0,  0.0]
];

var avalTorrePreta = reverteMatriz(avalTorreBranca);

var avalRainha =
  [
  [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
  [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
  [ -1.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
  [ -0.5,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
  [  0.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
  [ -1.0,  0.5,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
  [ -1.0,  0.0,  0.5,  0.0,  0.0,  0.0,  0.0, -1.0],
  [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]
];

var avalReiBranca = [

  [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [ -2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
  [ -1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
  [  2.0,  2.0,  0.0,  0.0,  0.0,  0.0,  2.0,  2.0 ],
  [  2.0,  3.0,  1.0,  0.0,  0.0,  1.0,  3.0,  2.0 ]
];

var avalReiPreta = reverteMatriz(avalReiBranca);


var valorPeca = function (peca, x, y) {
    if (peca === null) {
        return 0;
    }
    var pegaValorAbsoluto = function (peca, ehBranca, x ,y) {
        if (peca.type === 'p') {
            return 10 + ( ehBranca ? avalPeaoBranca[y][x] : avalPeaolPreta[y][x] );
        } else if (peca.type === 'r') {
            return 50 + ( ehBranca ? avalTorreBranca[y][x] : avalTorrePreta[y][x] );
        } else if (peca.type === 'n') {
            return 30 + avalCavalo[y][x];
        } else if (peca.type === 'b') {
            return 30 + ( ehBranca ? avalBispoBranca[y][x] : avalBispoPreta[y][x] );
        } else if (peca.type === 'q') {
            return 90 + avalRainha[y][x];
        } else if (peca.type === 'k') {
            return 900 + ( ehBranca ? avalReiBranca[y][x] : avalReiPreta[y][x] );
        }
        throw "Peça desconhecida : " + peca.type;
    };

    var valorAbsoluto = pegaValorAbsoluto(peca, peca.color === 'w', x ,y);
    return peca.color === 'w' ? valorAbsoluto : -valorAbsoluto;
};

// reinicia o tabuleiro e limpa os dados de jogo
const reiniciar = function() {
  $('#position-count').text('0');
  $('#time').text('0s');
  $('#positions-per-s').text('0');  
  partida.reset();
  tabuleiro.start();
}

// configurações constantes e retorno do tabuleiro modificável
const config = {
  draggable: true,
  position: 'start',
  onDragStart: movimentoComeca,
  onDrop: aoLargar,
  onSnapEnd: movimentoTermina,
}
tabuleiro = ChessBoard('tabuleiro', config);
$('#jogoInicio').on('click', jogoAutomatico);
$('#jogoLimpar').on('click', reiniciar);
