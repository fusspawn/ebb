
client_socket = null;

var jsApp = {
    onload: function() {
        if (!me.video.init('jsapp', 1024, 768, false, 1.0)) {
            alert("Sorry but your browser does not support html 5 canvas.");
            return;
        }
 
        me.audio.init("mp3, ogg");
        me.loader.onload = this.loaded.bind(this);
        me.loader.preload(g_resources);
        me.state.change(me.state.LOADING);
    },
    
    loaded: function() {
        // set the "Play/Ingame" Screen Object
        me.state.set(me.state.PLAY, new PlayScreen());
        me.state.set("restart", new DeadScreen());
        me.state.set("server-connect", new ServerConnectionScreen());
        me.state.change("server-connect");
    }
 
};

// jsApp
/* the in game stuff*/
var PlayScreen = me.ScreenObject.extend({
    onResetEvent: function() {
          
           me.game.addHUD(0, 0, 1024, 768);
           me.entityPool.add("mainPlayer", PlayerEntity);
           me.entityPool.add("mob", HeadCrap);
             
           // enable the keyboard
           me.input.bindKey(me.input.KEY.LEFT,  "left");
           me.input.bindKey(me.input.KEY.RIGHT, "right");
           me.input.bindKey(me.input.KEY.UP, "up");
           me.input.bindKey(me.input.KEY.DOWN, "down");
           me.input.bindKey(me.input.KEY.A,  "left");
           me.input.bindKey(me.input.KEY.D, "right");
           me.input.bindKey(me.input.KEY.W, "up");
           me.input.bindKey(me.input.KEY.S, "down");
           me.input.bindKey(me.input.KEY.SPACE, "attack", true);
           me.game.HUD.addItem("mhealth", new HealthObject(100, 50));
           me.game.HUD.addItem("phealth", new HealthObject(120, 100));
           me.levelDirector.loadLevel("arena2_map");
    },
    onDestroyEvent: function() {
        me.game.disableHUD();
    }
 
});

var DeadScreen = me.ScreenObject.extend({
    onResetEvent: function() {
        me.input.bindKey(me.input.KEY.ENTER, "enter");
        me.game.add(new PressEnterToStart(20, 20, {image:"uparrow"}));
    }
});


var ServerConnectionScreen = me.ScreenObject.extend({
    onResetEvent: function() {
        client_statics.socket = io.connect('http://eternal_boss_battles.fusspawn.c9.io');  
        
        client_statics.socket.on('error', function (reason) {
            console.error('Unable to connect Socket.IO', reason);
        }); 
        client_statics.socket.on("stateChange", function() {
            
        });
        client_statics.socket.on("connect", function() {
            me.state.change(me.state.PLAY);
        });
    }
});

window.onReady(function() {
    jsApp.onload();
});