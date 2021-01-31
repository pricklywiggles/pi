var five = require('johnny-five'),
    board = new five.Board(),
    Matrix8x8 = require('node-led').Matrix8x8;

board.on('ready', function() {
  console.log('Connected to Arduino, ready.');

  var opts = {
    address: 0x70
  };

  var matrix = new Matrix8x8(board, opts);

  var smile = [
    0b00111100,
    0b01000010,
    0b10100101,
    0b10000001,
    0b10100101,
    0b10011001,
    0b01000010,
    0b00111100
  ];

  matrix.drawBitmap(smile);

});