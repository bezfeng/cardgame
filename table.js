var Engine = require("./engine.js")
var Player = require("./player.js")

function Table(tableID){
  this.tableID = tableID;
	this.name = "Table "+tableID;
  this.engine = new Engine();
  this.players = [];
  this.playerlimit = 4;
  this.activePlayer;
  this.scores = {};
}

Table.prototype.addPlayer = function(playerID, playerName) {
  var player = new Player(playerID, playerName);

  // TODO: Check if player has not already joined the table
  this.players.push(player);
  this.engine.drawCard(player);
  
  // If this is the first player to join, assume for now he gets to start
  // TODO: rework starting player logic
  if (this.players.length === 1) {
    console.log("setting starting player as" + player.name)
    this.engine.drawCard(player);
    this.activePlayer = player;
  }
  
  return player;
};

Table.prototype.getPlayer = function(playerId) {
  var player = null;
  for(var i = 0; i < this.players.length; i++) {
    if(this.players[i].id == playerId) {
      player = this.players[i];
      break;
    }
  }
  return player;
};

Table.prototype.getPlayerIndex = function(playerId) {
  for(var i = 0; i < this.players.length; i++) {
    if(this.players[i].id == playerId) {
      return i;
    }
  }
};

Table.prototype.cardPlayed = function(targetPlayerId, sourcePlayerId, action) {
  var targetIndex = this.getPlayerIndex(targetPlayerId);
  var sourceIndex = this.getPlayerIndex(sourcePlayerId);
  var targetPlayer = this.players[targetIndex];
  var sourcePlayer = this.players[sourceIndex];
  
  var result = this.engine.play(targetPlayer, sourcePlayer, action);
  
  // Game over checking --------------------------------------------
  
  var winner;
  
  // Game over if there are no cards left in the deck. Compare values to decide winner.
  if (this.engine.pack.length == 0) {
    console.log("out of cards, comparing players");
    var highestPlayer = this.players[0];
    var revealString = "\n\nNo more cards!\n";
    revealString += this.players[0].name + " has a " + this.players[0].hand[0].name + " (" + this.players[0].hand[0].value +")\n";
    
    for (var i = 1; i < this.players.length; i++) {
      revealString += this.players[i].name + " has a " + this.players[i].hand[0].name + " (" + this.players[i].hand[0].value +")\n";
      if (this.players[i].hand[0].value > highestPlayer.hand[0].value) {
        highestPlayer = this.players[i];
      }
    }
    winner = highestPlayer;
    result.message += revealString;
  }
  
  // Game is over if everybody else has been knocked out.
  var nonLosers = [];
  for (var i = 0; i < this.players.length; i++) {
    if (this.players[i].status != "lose") {
      nonLosers.push(this.players[i]);
    }
  }
  if (nonLosers.length === 1) {
    winner = nonLosers[0];
  }
  
  if (winner) {
    // TODO this is unnecessary, we never use the status
    winner.status = "win";
    result.gameOver = true;
    
    // Increment score for active player
    var id = winner.id;
    if (this.scores.id) {
      this.scores.id++;
    } else {
      this.scores.id = 1;
    }
    
    result.message += "\n\n" + winner.name + " wins!";
    result.message += "\n\nStarting new game...";
    
    this.engine.reset();
    
    // Reset player status
    for (var i = 0; i < this.players.length; i++) {
      this.players[i].status = "";
      this.players[i].hand = [];
      this.engine.drawCard(this.players[i]);
    }
    
    this.activePlayer = winner;
  } else {
    // Find the index of the current player and increment to get the next player
    var newIndex = sourceIndex + 1;
  
    // Loop back to the first player if we've reached the end of the list
    if (newIndex == this.players.length) {
      newIndex = 0;
    }
    
    while (this.players[newIndex].status == "lose" && newIndex != sourceIndex) {
      newIndex++;
      if (newIndex == this.players.length) {
        newIndex = 0;
      }
    } 
    this.activePlayer = this.players[newIndex];
  }
  
  this.engine.drawCard(this.activePlayer);
    
  return result;
}

module.exports = Table;