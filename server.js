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
    
    // Double check player is not already in table
    // Double check player name is unique
    for (var i = 0; i < table.players.length; i++) {
      if (table.players[i].id == socket.id) {
        socket.emit("error", {
          message: "You are already a member of this table.",
        });
        return;
      }
      if (table.players[i].name == data.playerName) {
        socket.emit("error", {
          message: "Name is already in use, please choose a new one. Thanks!",
        });
        return;
      }
    }
    
    var newPlayer = table.addPlayer(socket.id, data.playerName);

    // Tell all other players to add a new player to their UI
    // Also keep a running string of all the players in the room
    var playerList = "";
    for (var i = 0; i < table.players.length; i++) {
      var player = table.players[i];
      playerList = playerList + player.name + ", ";
      if (player.id != socket.id) {
        io.to(player.id).emit("playerJoined", { newPlayer: newPlayer })
      }
    }
    
    // Configure the new player's initial UI
    socket.emit("joinedTable", {
      message: "Joined Table: " + table.name + "\nPlayers: " + playerList + "\nActive player is " + table.activePlayer.name,
      hand: table.getPlayer(socket.id).hand,
      players: table.players,
    });
    
    // Let the first player know that he is the active player
    // TODO: make this less dumb
    if (table.players.length == 1) {
      socket.emit("turnBegan", {
        activePlayer: table.activePlayer,
        players: table.players,
      });   
    }
  });
  
  socket.on('playCard', function(data){
    var result = table.cardPlayed(data.targetPlayerId, socket.id, data);
    
    io.sockets.emit("cardPlayed", {
      message: result.message,
    });
    
    if (result.courtierResult && !result.gameOver) {
      socket.emit("courtierResult", {card: result.courtierResult});
    }
    
    // Only send the hand to the corresponding player instead of a broadcast to prevent cheating. 
    for (var i = 0; i < table.players.length; i++){ 
      var player = table.players[i];
      io.to(player.id).emit("turnEnded", {
        hand: player.hand,
      });
      
      // Start a new turn
      io.to(player.id).emit("turnBegan", {
        activePlayer: table.activePlayer,
        cardsRemaining: table.engine.pack.length,
        players: table.players,
      });
    }
  });
});