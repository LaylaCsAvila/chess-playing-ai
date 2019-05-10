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
  var profundidade = 2;
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
      // inicia os valores de alpha e beta com valores altos negativos e positivos
      var alpha = -9999;
      var beta = 9999;
      //var valor = minimaxPoda(partida, alpha, beta, !EhJogadorMax);
      var valor = minimaxProfundidade(partida, profundidade, true);
      partida.undo();
      if(valor >= MelhorJogada) {
          MelhorJogada = valor;
          MelhorJogadaEncontrada = jogada;
      }
  }
  return MelhorJogadaEncontrada;
};

// Função minimax com poda 
const minimaxPoda = function(partida, alpha, beta, EhJogadorMax){
  
  // Está no fundo? Se sim, faz a avaliação heurística
  if(partida.in_checkmate() === true || partida.in_draw() === true){
    console.log("chegou ao fundo");
    return -avaliaTabuleiro(partida.board());
  }

  // Monta todas as possibilidades de jogadas que a IA pode fazer
  var possibilidades = partida.moves();
  console.log("Eh jogador max? ", EhJogadorMax);
  // É max? Se sim, maximiza o resultado.
  // Se não, minimiza o resultado.
  if (EhJogadorMax){

    // Seta MelhorJogada para o menor valor possível 
    var MelhorJogada = -9999;

    console.log("ehjogadormax");
    // Percorre toda a lista de possibilidades
    for(var i = 0; i < possibilidades.length; i++){
      partida.move(possibilidades[i]);
      MelhorJogada = Math.max(MelhorJogada, minimaxPoda(partida, alpha, beta, !EhJogadorMax));
      partida.undo();      
      alpha = Math.max(alpha, MelhorJogada);
      if (beta <= alpha) {
          return MelhorJogada;
      }
    }
    return MelhorJogada;

  }else{
    
    console.log("N ehjogadormax");

    // Seta MelhorJogada para o maior valor possível 
    var MelhorJogada = 9999;

    // Percorre toda a lista de possibilidades
    for(var i = 0; i < possibilidades.length; i++){
      partida.move(possibilidades[i]);
      console.log("! Eh jogador max? ", !EhJogadorMax);
      MelhorJogada = Math.min(MelhorJogada, minimaxPoda(partida, alpha, beta, !EhJogadorMax));
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
  // Está no fundo? Se sim, faz a avaliação heurística
  if(profundidade == 0){
    return -avaliaTabuleiro(partida.board() );
  }

  // Monta todas as possibilidades de jogadas que a IA pode fazer
  var possibilidades = partida.moves();
  
  // É max? Se sim, maximiza o resultado.
  // Se não, minimiza o resultado.
  if (EhJogadorMax){

    // Seta MelhorJogada para o menor valor possível 
    var MelhorJogada = -9999;

    // Percorre toda a lista de possibilidades
    for(var i = 0; i < possibilidades.length; i++){
      partida.move(possibilidades[i]);
      MelhorJogada = Math.max(MelhorJogada, minimaxProfundidade(partida, profundidade - 1, !EhJogadorMax));
      partida.undo();
    }
    return MelhorJogada;

  }else{

    // Seta MelhorJogada para o maior valor possível 
    var MelhorJogada = 9999;

    // Percorre toda a lista de possibilidades
    for(var i = 0; i < possibilidades.length; i++){
      partida.move(possibilidades[i]);
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
