var rpio = require('rpio');

class Matrix {
  constructor({ brightness = 15, slaveAddress = 0x70, baudRate = 10000 } = {}) {
    this.wBuffer = [];
    this.current = [];

    rpio.i2cBegin();
    rpio.i2cSetSlaveAddress(slaveAddress);
    rpio.i2cSetBaudRate(baudRate);

    // Turn on the oscillator
    rpio.i2cWrite(Buffer.from([0x20 | 0x01]));

    // Turn display on
    rpio.i2cWrite(Buffer.from([0x01 | 0x80]));

    // Initial Clear
    for (var x = 0; x < 16; x++) {
      rpio.i2cWrite(Buffer.from([x, 0]));
    }

    this.brightness = brightness;
  }

  set brightness(level) {
    if (level > 15) level = 15;
    if (level < 0) level = 0;

    rpio.i2cWrite(Buffer.from([0xe0 | level]));
    this.brightnessLevel = level;
  }

  get brightness() {
    return this.brightnessLevel;
  }

  setLED(y, x, value) {
    var led = y * 16 + ((x + 7) % 8);

    var pos = Math.floor(led / 8);
    var offset = led % 8;

    if (value) this.write_buffer[pos] |= 1 << offset;
    else this.write_buffer[pos] &= ~(1 << offset);
  }

  writeArray(array) {
    this.currentArray = array;
    this.clearBuffer();

    var x = 0;
    var y = 0;

    for (var i in array) {
      this.setLED(y, x, array[i]);
      x++;
      if (x >= 8) {
        y++;
        x = 0;
      }
    }

    this.writeBuffer();
  }

  writeAnimation(array, speed) {
    var self = this;
    var oldBuffer = this.wBuffer.slice();

    for (var i in array) {
      self.writeAnimation2(i, array[i], speed);
    }

    setTimeout(function () {
      self.clearBuffer();
      self.writeBuffer();
    }, array.length * speed + speed);

    setTimeout(function () {
      self.wBuffer = oldBuffer.slice();
      self.writeBuffer();
    }, array.length * speed + 1000);
  }

  writeAnimation2(i, data, speed) {
    var self = this;

    setTimeout(function () {
      self.writeArray(data);
    }, speed * i);
  }

  writeBuffer() {
    for (var i in this.wBuffer) {
      rpio.i2cWrite(Buffer.from([i, this.wBuffer[i]]));
    }
  }

  clearBuffer() {
    for (var i in this.wBuffer) {
      this.wBuffer[i] = 0;
    }
  }
}

let smily = [
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 1, 0, 0, 0, 0, 1, 0],
  [1, 0, 1, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 1, 0, 1],
  [1, 0, 0, 1, 1, 0, 0, 1],
  [0, 1, 0, 0, 0, 0, 1, 0],
  [0, 0, 1, 1, 1, 1, 0, 0]
];

let matrix = new Matrix({
  brightness: 15,
  slaveAddress: 0x70,
  bautrate: 10000
});

matrix.writeArray(smily);

// var Matrix = function(data) {

// 	if (typeof data == 'undefined') data = {}

// 	this.brightness = data.brightness || 15;
// 	this.write_buffer = [];
// 	this.current_array = [];

// 	rpio.i2cBegin();
// 	rpio.i2cSetSlaveAddress(data.slaveAddress || 0x70);
// 	rpio.i2cSetBaudRate(data.bautrate || 10000);

// 	// Turn on the oscillator
// 	rpio.i2cWrite(Buffer.from([(0x20 | 0x01)]));

// 	// Turn display on
// 	rpio.i2cWrite(Buffer.from([(0x01 | 0x80)]));

// 	// Initial Clear
// 	for (var x = 0; x < 16; x++) {
// 		rpio.i2cWrite(Buffer.from([x, 0]));
// 	}

// 	// Set display to full brightness.
// 	rpio.i2cWrite(Buffer.from([(0xE0 | this.brightness)]));
// }

// Matrix.prototype.setBrightness = function(b) {

// 	if (b > 15) b = 15;
// 	if (b < 0) b = 0;

// 	rpio.i2cWrite(Buffer.from([(0xE0 | b)]));
// }

// Matrix.prototype.setLED = function(y, x, value) {
// 	var led = y * 16 + ((x + 7) % 8);

// 	var pos = Math.floor(led / 8);
// 	var offset = led % 8;

// 	if (value)
// 		this.write_buffer[pos] |= (1 << offset);
// 	else
// 		this.write_buffer[pos] &= ~(1 << offset);
// }

// Matrix.prototype.writeArray = function(_array) {
// 	this.current_array = _array;
// 	this.clearBuffer();

// 	var x = 0;
// 	var y = 0;

// 	for (var i in _array) {
// 		this.setLED(y, x, _array[i]);

// 		x++;

// 		if (x >= 8) {
// 			y++;
// 			x = 0;
// 		}

// 	}

// 	this.writeBuffer();
// }

// Matrix.prototype.writeAnimation = function(_array, speed) {
// 	var self = this;
// 	var old_buffer = this.write_buffer.slice();

// 	for (var i in _array) {
// 		self.writeAnimation2(i, _array[i], speed);
// 	}

// 	setTimeout(function() {

// 		self.clearBuffer();
// 		self.writeBuffer();

// 	}, _array.length * speed + speed);

// 	setTimeout(function() {

// 		self.write_buffer = old_buffer.slice();
// 		self.writeBuffer();

// 	}, _array.length * speed + 1000);
// }

// Matrix.prototype.writeAnimation2 = function(i, data, speed) {
// 	var self = this;

// 	setTimeout(function() {
// 		self.writeArray(data);
// 	}, speed * i);
// }

// Matrix.prototype.writeBuffer = function() {
// 	for (var i in this.write_buffer) {
// 		rpio.i2cWrite(Buffer.from([i, this.write_buffer[i]]));
// 	}
// }

// Matrix.prototype.clearBuffer = function() {
// 	for (var i in this.write_buffer) {
// 		this.write_buffer[i] = 0;
// 	}
// }
