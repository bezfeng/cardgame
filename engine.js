var Card = require("./card.js");

function Engine() {
  this.pack = this._shufflePack(this._createPack());
}

Engine.prototype._createPack = function() {
  var pack = [];
  
  var cardTypes = Card.types();
  for (int i = 0; i < cardTypes.length; i++) {
    var c = new Card(cardTypes[i]);
    for (int i = 0; i < Card.countInDeck(c.value); i++) {
      pack.push(new Card(cardTypes[i]))
    }
  }
  
  return pack;
}

// Shuffles the pack - based on the Fisher-Yates algorithm
Engine.prototype._shufflePack = function(pack) {
  var i = pack.length, j, tempi, tempj;
  if (i === 0) return false;
  while (--i) {
    j = Math.floor(Math.random() * (i + 1));
    tempi = pack[i]; tempj = pack[j]; pack[i] = tempj; pack[j] = tempi;
  }
  return pack;
}

Engine.prototype.reset = function() {
  this.pack = this._shufflePack(this._createPack());
}

Engine.prototype.drawCard = function() {
  return this.pack.pop();
}

module.exports = Engine;