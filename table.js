var Engine = require("./engine.js")
var Player = require("./player.js")

function Table(tableID){
  this.tableID = tableID;
	this.name = "Table "+tableID;
  this.engine = new Engine();
  this.players = [];
  this.playerlimit = 4;
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
  }
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

module.exports = Table;