function Player(playerID, name){
  this.id = playerID;
  this.name = name;
  this.hand = [];
  this.status = "";
}

module.exports = Player;