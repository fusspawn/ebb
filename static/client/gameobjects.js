/*------------------- 
a player entity
-------------------------------- */

var PressEnterToStart = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.gravity = 0;
    },
    update: function() {
        if(me.input.isKeyPressed("enter"))
            me.state.change(me.state.PLAY);
    },
});


var NetworkPlayer = me.ObjectEntity.extend({ 
    init: function(x, y, settings) {},
    update: function() {},
});

var PlayerEntity = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        // call the constructor
        this.parent(x, y, settings);
        this.fire_direction = {x: 0, y: -1};
        this.gravity = 0;
        // set the default horizontal & vertical speed (accel vector)
        this.setVelocity(5, 5);
        this.health = 1000;
        this.collidable = true;
        this.updateColRect(-1, 32, -1, 32);
        // set the display to follow our position on both axis
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
        this.rotation = 0;
        this.type = "player";
        me.game.HUD.updateItemValue("phealth", this.health);
    },
    update: function() {
        this.check_fire();
        if (me.input.isKeyPressed('left')) {
            this.vel.x -= this.accel.x * me.timer.tick;
            this.rotation = 270;
            this.fire_direction = {x: -1, y: 0};
        } else if (me.input.isKeyPressed('right')) {
            this.rotation = 90;
            this.fire_direction = {x: 1, y: 0};
            this.vel.x += this.accel.x * me.timer.tick;
        } else {
            this.vel.x = 0;
        }
        
        if (me.input.isKeyPressed('up')) {
            this.rotation = 0;
            this.vel.y = -this.maxVel.y * me.timer.tick;
             this.fire_direction = {x: 0, y: -1};
        } else if(me.input.isKeyPressed('down')) {
            this.rotation = 180;
            this.vel.y = this.maxVel.y * me.timer.tick;
             this.fire_direction = {x: 0, y: 1};
        } else {
            this.vel.y = 0;
        }
        this.angle = this.rotation * Math.PI / 180;
        this.updateMovement();
        me.game.collide(this);
        this.sync_movement();
        
        if (this.vel.x!=0 || this.vel.y!=0) {
            this.parent(this);
            return true;
        }
        
        return false;
    },
    sync_movement: function(){
        client_statics.socket.send(  
            "status_update", {
                world_id: client_statics.world_id,
                player_id: client_statics.player_id,
                pos_x: this.pos.x,
                pos_y: this.pos.y,
                rotation: this.rotation
            }
        );
    },
    
    onCollision: function(vec, object) {
        if(object.type == "bullet" && object.owner != this) {
            this.health = this.health - 10;
            me.game.HUD.updateItemValue("phealth", -10);
            if(this.health < 1)
            {
                me.game.remove(this);
                me.game.sort();
                me.state.change("restart");
            }
        }
    },
    check_fire: function() {
        if(me.input.isKeyPressed("attack")) {
            var projectile = new MissileEntity(this.pos.x, this.pos.y, {image: "projectile_wtf"});
            var dir = this.get_fire_direction();
            projectile.set_vel(dir.x, dir.y);
            projectile.set_owner(this);
            me.game.add(projectile, this.z);
            me.game.sort();
        }
    },
    get_fire_direction: function() {
        return this.fire_direction;
    }
});
var HeadCrap = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.gravity = 0;
        this.collidable = true;
        this.updateColRect(-1, 32, -1, 32); 
        this.health = 100;
        this.type = "mob";
        this.annoyed_by_last = null;
        this.speed = .10;
        this.direction = {x:0, y:0};
        this.last_fire = 0;
        this.can_fire = false;
        me.game.HUD.updateItemValue("mhealth", this.health);
    },
    update: function() {
        this.do_fire_logic();
        this.do_pathing();
        me.game.collide(this);
        return true;
    },
    do_fire_logic: function() {
        if(!this.can_fire)
            return;
            
        this.last_fire += 1;
        if(this.last_fire > 20) {
            this.last_fire = 0;
            var projectile = new MissileEntity(this.pos.x + 16, this.pos.y + 16, {image: "projectile_axe"});
            var dir = this.direction;
            projectile.set_vel(-dir.x, -dir.y);
            projectile.set_owner(this);
            me.game.add(projectile, this.z + 1);
            me.game.sort();
        }
    },
    random: function() {
        var plusOrMinus = Math.random() < 0.5 ? -1 : 1;
        return plusOrMinus;
    },
    do_pathing: function() {
        if(this.annoyed_by_last == null)
            return;
            
        this.can_fire = true;
        this.direction = {x: 0, y: 0};
        if(this.pos.x < this.annoyed_by_last.pos.x)
            this.direction.x = -1;
        else if(this.pos.x > this.annoyed_by_last.pos.x)
            this.direction.x = 1;
        
        if(this.pos.y < this.annoyed_by_last.pos.y)
            this.direction.y = -1;
        else if(this.pos.y > this.annoyed_by_last.pos.y)
            this.direction.y = 1;
            
            
        this.angle = this.pos.dotProduct(this.annoyed_by_last.pos)  * Math.PI / 180;
        this.vel.x -= this.direction.x * (this.speed * me.timer.tick);
        this.vel.y -= this.direction.y * (this.speed * me.timer.tick);
        this.updateMovement();
    },
    onCollision: function(res, object) {
        if(object.type == "bullet") {
            if(object.owner.type == "mob") {
                return true;
            } else {
                this.annoyed_by_last = object.owner;
                this.health = this.health - 10;
                me.game.HUD.updateItemValue("mhealth", -10);
                if (this.health < 1) 
                    me.game.remove(this);
            }
        }
    }
});
var MissileEntity = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.gravity = 0;
        this.collidable = true;
        this.speed = .33;
        this.direction = {x: 0, y: 0};
        this.updateColRect(-1, 10, -1, 10);
        this.type = "bullet";
        this.owner = null;
    },
    set_owner: function(owner) { this.owner = owner; },
    update: function() {
            this.vel.x += this.direction.x * (this.speed * me.timer.tick);
            this.vel.y += this.direction.y * (this.speed * me.timer.tick);
            var collision = this.updateMovement();
            if (collision.y && collision.yprop.isSolid)  {
                me.game.remove(this);
            } else if (collision.x && collision.xprop.isSolid) {
                me.game.remove(this);
            }
            me.game.collide(this);
            this.angle += .33;
            return true;
    },
    set_vel: function(x, y) {
        this.direction.x = x;
        this.direction.y = y;
    },
    onCollision: function(res, object) {
        if(object.type == "mob" && this.owner != object)
            me.game.remove(this);
    }
});
var HealthObject = me.HUD_Item.extend({
    init: function(x, y) {
        // call the parent constructor
        this.parent(x, y);
        // create a font
        this.font = new me.BitmapFont("32x32_font", 32);
    },
    draw: function(context, x, y) {
        this.font.draw(context, this.value, this.pos.x + x, this.pos.y + y);
    }
 
});