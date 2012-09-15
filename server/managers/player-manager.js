require("underscore");
var Player = require("../objects/player.js");
var PlayerManager = function() {
    this.last_p_id = 0;
    this.init = function() {
        console.log("[Service] PlayerManager: Starting..");
    };
     
    this.incoming_player = function(socket) {
        console.log("[PlayerManager] got new player connection...");
        var player = new Player(this.get_player_id(), "unknown", socket);
        player.init();
        player.on_room_join(server.world_manager.get_player_room());
    };
    
    this.get_player_id = function() {
        this.last_p_id += 1;
        return this.last_p_id;
    }
};

module.exports = PlayerManager;

