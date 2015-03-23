var Card = require("./card.js");

// Engine object
function Engine() {
  this.reset();
  this.lostStatus = "Lost";
  this.immuneStatus = "Immune";
}

Engine.prototype._createPack = function() {
  var pack = [];
  
  var cardTypes = Card.types();
  for (var i = 0; i < cardTypes.length; i++) {
    var c = new Card(cardTypes[i]);
    for (var j = 0; j < Card.countInDeck(c.value); j++) {
      pack.push(new Card(cardTypes[i]));
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
  this.immunePlayers = [];
  this.secretCard = this.pack.pop();
}

Engine.prototype.drawCard = function(player) {
  var newCard = this.pack.pop();
  player.hand.push(newCard);
  return newCard;
}

Engine.prototype.play = function(targetPlayer, sourcePlayer, action) {
  var card = new Card(action.cardCode);

  if (card.shortCode == 'sh' || card.shortCode == 's' || card.shortCode == 'p')
    targetPlayer = undefined;
  
  // Remove card from player's hand
  for (var i = 0; i < sourcePlayer.hand.length; i++) {
    if (sourcePlayer.hand[i].shortCode == card.shortCode) {
      sourcePlayer.hand.splice(i, 1);
      break;
    }
  }
  this.discard.push(card);
  
  // Remove the sourcePlayer from the immune list if they were previously on it.
  for (var i = 0; i < this.immunePlayers.length; i++) {
    var immunePlayer = this.immunePlayers[i];
    if (immunePlayer.id == sourcePlayer.id) {
      console.log("removing " + sourcePlayer.name + " from immunity list");
      this.immunePlayers.splice(i, 1);
      sourcePlayer.status = "";
    }
  }
  
  // If targetPlayer is on the immune list, do nothing this turn.
  var targetImmune = false;
  if (targetPlayer) {
    for (var i = 0; i < this.immunePlayers.length; i++) {
      var immunePlayer = this.immunePlayers[i];
      if (immunePlayer.id == targetPlayer.id) {
        console.log("found " + targetPlayer.id + " in the immunity list, do nothing. womp womp.");
        targetImmune = true;
      }
    } 
  }

  var result = {};
  result.message = "** " + sourcePlayer.name + " played " + card.name;
  if (targetPlayer) {
    result.message += " against " + targetPlayer.name + " **";
  } else {
    result.message += " **";
  }
  
  if (targetImmune) {
    result.message += "\n" + targetPlayer.name + " is protected by the Shugenja!";
    return result;
  }

  // Guard - Guess the card
  var guessMessage;
  if (card.shortCode == "g") {
    var guess = new Card(action.guess);
    var targetPlayerCard = targetPlayer.hand[0];
    guessMessage = "** " + sourcePlayer.name + " guesses " + guess.name + " and is ";
    if (guess.shortCode == targetPlayerCard.shortCode) {
      this.setPlayerLose(targetPlayer);
      guessMessage += "CORRECT!";
    } else {
      guessMessage += "WRONG!";
    }
    guessMessage += " **";

    result.message += "\n" + guessMessage;
  }
  
  // Courtier - Show sourcePlayer targetPlayer's cards
  if (card.shortCode == "c") {
    result.courtierResult = targetPlayer.hand[0];
  }
  
  // Diplomat - Compare hands, higher wins
  if (card.shortCode == "d") {
    var targetPlayerCard = targetPlayer.hand[0];
    var sourcePlayerCard = sourcePlayer.hand[0];
    
    console.log("showdown: " + targetPlayerCard.value + " vs " + sourcePlayerCard.value);
    
    if (targetPlayerCard.value > sourcePlayerCard.value) {
      console.log("target wins");
      this.setPlayerLose(sourcePlayer);
    } else if (sourcePlayerCard.value > targetPlayerCard.value) {
      console.log("source wins");
      this.setPlayerLose(targetPlayer);
    }
  }
  
  // Shugenja - invincible
  if (card.shortCode == "sh") {
    sourcePlayer.status = this.immuneStatus;
    this.immunePlayers.push(sourcePlayer);
    console.log("list of immune players is now " + JSON.stringify(this.immunePlayers));
  }
  
  // Hatamoto - targetPlayer drops all cards and picks a new one
  if (card.shortCode == "h") {
    while(targetPlayer.hand.length > 0) {
      var discardedCard = targetPlayer.hand.pop();
      this.discard.push(discardedCard);
      
      // Discarding the princess is a loss
      if (discardedCard.shortCode == "p") {
        this.setPlayerLose(targetPlayer);
      }
    }
    if (this.pack.length == 0) {
      targetPlayer.hand.push(this.secretCard);
    } else {
      targetPlayer.hand.push(this.pack.pop()); 
    }
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
    this.setPlayerLose(sourcePlayer);
  }
  
  result.message += "\n" + this.discard[this.discard.length - 1].name + " was added to the discard pile";
  
  return result;
}

Engine.prototype.setPlayerLose = function(player) {
  console.log(player.name + " has just lost");
  player.status = this.lostStatus;
  var card = player.hand.pop();
  if (card)
    this.discard.push(card);
  return card; 
}

module.exports = Engine;