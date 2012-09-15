require("underscore");


var World = function() {
    this.world_id;
    this.world_data = {};
    this.name = "Unknown_World";
    this.players = [];
    
    this.init = function(name) {
        this.name = name;
        console.log("[World] WorldManager: Starting World: " + name + "id:" + this.world_id);
    };
    
    this.register_player = function(player) {
        this.players.push(player);
    }
    
    this.set_world_map = function(map) {
        this.world_data = map.get_data();
    };    
    
    this.update_world_state = function(delta) {
        this.process_physics_tick(delta);
        this.sync_state_to_world();
    };

    this.process_physics_tick = function(delta) {
    };    
    
    this.sync_state_to_world = function() {
        _.each(this.players, function(player) {
            player.send_packet(this.world_data);
        });
    };
    
    this.handle_player_message = function(message) {
        var PlayerID = message.player_id;
        var Type = message.type;
    }
};

module.exports = World;