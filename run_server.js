var app = require('http').createServer(static_handler)
  , socket = require('socket.io').listen(app)
  , fs = require('fs')
  , url = require('url')
  , path = require('path')
  , WorldMan = require('./server/managers/world-manager.js')
  , PlayMan = require("./server/managers/player-manager.js")

app.listen(8080);

server = {};
server.world_manager = new WorldMan();
server.player_manager = new PlayMan();

server.world_manager.init();
server.player_manager.init();

server.socket_man = socket;
server.socket_man.configure(function () {
       server.socket_man.set('transports', ['websocket']);
});
server.socket_man.sockets.on('connection', function (socket) {
    console.log("Incoming Connections");
    server.player_manager.incoming_player(socket);
});


function static_handler(request, response) {

  var uri = url.parse(request.url).pathname
    , filename = path.join(process.cwd(), uri);
  
  path.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;
    }

    if (fs.statSync(filename).isDirectory()) filename += '/index.html';

    fs.readFile(filename, "binary", function(err, file) {
      if(err) {        
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }

      response.writeHead(200);
      response.write(file, "binary");
      response.end();
    });
  });
}
