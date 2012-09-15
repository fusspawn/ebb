require("underscore");

var Player = function(id, name, socket) 
{
    this.id = id;
    this.name = name;
    this.socket = socket;
    this.world_id = null;
    
    this.init = function() {
        this.send_packet("set_id", {player_id: this.id});
    };
    
    this.send_packet = function(event, packet) {
        this.socket.emit(event, packet);
    };
    
    this.on_status_change = function(packet) {};
    
    this.on_room_join = function(world) {
        this.send_packet("inital_status", {player_id: this.id, world_id: world.world_id});
        world.register_player(this);
    };
};

module.exports = Player;