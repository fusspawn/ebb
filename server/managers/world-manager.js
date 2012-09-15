var World = require("../objects/world.js");

var WorldManager = function() {
    this.worlds = [];
    this.last_world_id = 0;
    this.world_tick_rate = 20; // WorldState FPS
    
    this.init = function() {
        console.log("[Service] WorldManager: Starting..");
    };
        
    this.get_player_room = function(player) {
        if(this.worlds[this.last_world_id] == null) {
            console.log("No Space in worlds. Spawning New");
            
            var WorldInstance = new World();
            WorldInstance.world_id = this.get_world_id();
            WorldInstance.init("test room name");
            
            this.worlds.push(WorldInstance);
            return WorldInstance;
        } else { 
            return worlds[this.last_world_id];
        }
    }
    
    this.get_world_id = function() {
        this.last_world_id += 1;
        return this.last_world_id;
    };
};

module.exports = WorldManager;