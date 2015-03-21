var Table = require("./table.js");
var socket = require('socket.io');

//setup an Express server to serve the content
var http = require("http");
var express = require("express");
var app = express();

app.use("/", express.static(__dirname + "/"));
app.use("/resources", express.static(__dirname + "/resources"));
var server = http.createServer(app);
server.listen(8080);
var io = socket.listen(server);

var table = new Table(1);

console.log("Server up, listening on 8080!");

app.get('/', function (req, res) {
  console.log("index.html get request")
  res.sendfile(__dirname + '/index.html');
});


//starting the socket and awaiting connections
io.sockets.on('connection', function (socket) {

  socket.on('playerjoin', function(data){
    console.log("socket id: " + socket.id);
    console.log("socket data received: " + data.playerName);
    var newPlayer = table.addPlayer(socket.id, data.playerName);

    console.log("Player in table " + JSON.stringify(table.players));
    
    var hand = table.getPlayer(socket.id).hand;
    var handString = "";
    for (var i = 0; i < hand.length; i++) {
      handString = handString + hand[i].name + ", ";
    }
    
    // Tell all other players to add a new player to their UI
    // Also keep a running string of all the players in the room
    var playerList = "";
    for (var i = 0; i < table.players.length; i++) {
      var player = table.players[i];
      playerList = playerList + player.name + ", ";
      if (player.id != socket.id) {
        console.log("emitting to " + player.id)
        io.to(player.id).emit("playerJoined", { newPlayer: newPlayer })
      }
    }
    
    // Configure the new player's initial UI
    socket.emit("joinedTable", {
      message: "Joined Table: " + table.name + "\nPlayers: " + playerList + "\nHand: " + handString,
      hand: hand,
      players: table.players,
    });
    
  });
  
  socket.on('playCard', function(data){
    console.log("card played: " + JSON.stringify(data.cardCode) + " against " + data.targetPlayerId);
    table.cardPlayed(data.targetPlayerId, socket.id, data);
    for (var i = 0; i < table.players.length; i++){ 
      var player = table.players[i];
      io.to(player.id).emit("turnEnded", {
        hand: player.hand,
      });

    }
  });

});