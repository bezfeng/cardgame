var Engine = require("./engine.js")
var Player = require("./player.js")

function Table(tableID){
  this.tableID = tableID;
	this.name = "Table "+tableID;
  this.engine = new Engine();
  this.players = [];
  this.playerlimit = 4;
  this.activePlayer;
}

Table.prototype.addPlayer = function(playerID, playerName) {
  var player = new Player(playerID, playerName);

  // TODO: Check if player has not already joined the table
  this.players.push(player);
  this.engine.drawCard(player);
  
  // If this is the first player to join, assume for now he gets to start
  // TODO: rework starting player logic
  if (this.players.length === 1) {
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
  
  var message = this.engine.play(targetPlayer, sourcePlayer, action);
  
  // Find the index of the current player and increment to get the next player
  if (sourceIndex + 1 < this.players.length) {
    this.activePlayer = this.players[sourceIndex + 1];
  } else {
    this.activePlayer = this.players[0];
  }
  
  this.engine.drawCard(this.activePlayer);
  
  return message;
}

module.exports = Table;