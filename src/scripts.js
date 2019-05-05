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

// configurações constantes e retorno do tabuleiro modificável
const config = {
  position: 'start',
  draggable: true,
  onDragStart: movimentoComeca,
  onDrop: aoLargar,
  onSnapEnd: movimentoTermina,
}
tabuleiro = ChessBoard('tabuleiro', config);
