var Card = require("./card.js");

// Helper method
function setPlayerLose(player) {
  player.status = "lose";
  if (player.hand[0]) {
    this.discard.push(player.hand[0]);
  }
}

// Engine object
function Engine() {
  this.pack = this._shufflePack(this._createPack());
  this.discard = [];
  this.immunePlayers = [];
}

Engine.prototype._createPack = function() {
  var pack = [];
  
  var cardTypes = Card.types();
  for (var i = 0; i < cardTypes.length; i++) {
    var c = new Card(cardTypes[i]);
    for (var j = 0; j < Card.countInDeck(c.value); j++) {
      pack.push(new Card(cardTypes[j]))
    }
  }
  
  return pack;
}

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
  this.discard = [];
}

Engine.prototype.drawCard = function(player) {
  var newCard = this.pack.pop();
  player.hand.push(newCard);
  return newCard;
}

Engine.prototype.play = function(targetPlayer, sourcePlayer, action) {
  var card = new Card(action.cardCode);
  this.discard.push(card);
  
  // Remove the sourcePlayer from the immune list if they were previously on it.
  // If targetPlayer is on the immune list, do nothing this turn.
  var targetImmune = false;
  for (var i = 0; i < this.immunePlayers.length; i++) {
    var player = this.immunePlayers[i];
    if (player.id == sourcePlayer.id) {
      this.immunePlayers.splice(i, 1);
    }
    if (player.id == targetPlayer.id) {
      targetImmune = true;
    }
  }
  
  if (targetImmune) {
    return;
  }
  
  // Guard - Guess the card
  if (card.shortCode == "g") {
    var guess = action.guess;
    var targetPlayerCard = targetPlayer.hand[0];
    if (guess == targetPlayerCard) {
      targetPlayer.status = "lose";
      this.discard.push(targetPlayerCard);
    }
  }
  
  // Courtier - Show sourcePlayer targetPlayer's cards
  if (card.shortCode == "c") {
    // ??
  }
  
  // Diplomat - Compare hands, higher wins
  if (card.shortCode == "d") {
    var targetPlayerCard = targetPlayer.hand[0];
    var sourcePlayerCard = sourcePlayer.hand[0];
    
    if (targetPlayerCard.value > sourcePlayerCard.value) {
      setPlayerLose(sourcePlayer);
    } else if (sourcePlayerCard.value < targetPlayerCard.value) {
      setPlayerLose(targetPlayer);
    }
  }
  
  // Shugenja - invincible
  if (card.shortCode == "s") {
    sourcePlayer.status = "immune";
    this.immunePlayers.push(sourcePlayer);
  }
  
  // Hatamoto - targetPlayer drops all cards and picks a new one
  if (card.shortCode == "h") {
    while(targetPlayer.hand.length > 0) {
      this.discard.push(targetPlayer.hand.pop());
    }
    targetPlayer.hand.push(this.pack.pop());
  }
  
  // Manipulator - swap hands
  if (card.shortCode == "m") {
    var targetHand = targetPlayer.hand.slice();
    targetPlayer.hand = sourcePlayer.hand;
    sourcePlayer.hand = targetHand;
  }
  
  // Sensei - does nothing
  
  // Princess - auto lose
  if (card.shortCode == "p") {
    setPlayerLose(sourcePlayer);
  }
  
}

module.exports = Engine;