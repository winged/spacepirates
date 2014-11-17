(function(window) {
    "use strict";

    function Ship(worlds, myWorld) {
        this.initialize(worlds, myWorld);
    }

    var p = Ship.prototype = new createjs.Container();

    // public properties:
    Ship.GRAVITY             = 50;
    Ship.REVIVAL_TIME        = 4000;
    Ship.MAX_THRUST          = 4;
    Ship.FLAME_THRUST_FACTOR = 0.5;
    Ship.MAX_VELOCITY        = 20;
    Ship.ROTATION_SPEED      = 10;

    // public properties:
    p.shipFlame = undefined;
    p.shipBody = undefined;

    p.timeout = undefined;
    p.thrust = undefined;

    p.fuel = undefined;

    p.vX = undefined;
    p.vY = undefined;

    // constructor:
    p.Container_initialize = p.initialize;	//unique to avoid overiding base class

    p.initialize = function (worlds, myWorld) {
        this.Container_initialize();

        this.shipFlame = new createjs.Shape()
        this.shipBody  = new createjs.Shape()
        this.hud       = new createjs.Container()

        this.hud.border    = new createjs.Shape()
        this.hud.textFuel  = new createjs.Text('speed',   null, '#bebebe')
        this.hud.textSpeed = new createjs.Text('speed',   null, '#bebebe')
        this.hud.textGrav  = new createjs.Text('gravity', null, '#bebebe')
        this.hud.addChild(this.hud.border)
        this.hud.addChild(this.hud.textFuel )
        this.hud.addChild(this.hud.textSpeed)
        this.hud.addChild(this.hud.textGrav)
        this.hud.textSpeed.x = 5
        this.hud.textSpeed.y = 5
        this.hud.textFuel.x = 5
        this.hud.textFuel.y = 15
        this.hud.textGrav.x = 5
        this.hud.textGrav.y = 25

        this.trajectory = new createjs.Shape()

        this.addChild(this.shipFlame);
        this.addChild(this.shipBody);
        this.addChild(this.trajectory);
        this.planets  = worlds
        this.myPlanet = myWorld

        this.makeShape();
        this.timeout = 0;
        this.thrust = 0;
        this.vX = 0;
        this.vY = 0;

        this.x = 0
        this.y = 0
        
        this.respawn()

        this.fuel = 200;
    }

    // public methods:
    p.makeShape = function () {
        //draw ship body
        var g = this.shipBody.graphics;
        g.clear();
        g.beginStroke("#FFFFFF");

        g.moveTo(0, 10);	//nose
        g.lineTo(5, -6);	//rfin
        g.lineTo(0, -2);	//notch
        g.lineTo(-5, -6);	//lfin
        g.closePath(); // nose


        //draw ship flame
        var o = this.shipFlame;
        o.scaleX = 0.5;
        o.scaleY = 0.5;
        o.y = -5;

        g = o.graphics;
        g.clear();
        g.beginStroke("#FFFFFF");

        g.moveTo(2, 0);		//ship
        g.lineTo(4, -3);	//rpoint
        g.lineTo(2, -2);	//rnotch
        g.lineTo(0, -5);	//tip
        g.lineTo(-2, -2);	//lnotch
        g.lineTo(-4, -3);	//lpoint
        g.lineTo(-2, -0);	//ship


        g = this.hud.border.graphics
        g.clear();
        g.moveTo(-0.5,0)
        g.beginStroke("#FFFFFF");
        g.beginFill("rgba(30,30,30,60)");
        g.lineTo(-0.5, 40.5)
        g.lineTo(100,  40.5)
        g.lineTo(130,  -0.5)
        g.lineTo(-0.5, -0.5)

        g = this.trajectory.graphics
        g.clear();
        g.beginStroke(createjs.Graphics.getRGB(0,255,255, 1));
        g.moveTo(0,0)
        var preview = this.preview()

        var maxPreview = 40

        for (var x = 1; x < maxPreview; x++) {
            preview.rotation = 0

            preview.tick()
            if (preview.isCrashed()) {
                // TODO: find closest point on planet, then draw
                // preview crash there to avoid flickering
                break;
            }

            g.lineTo(preview.x - this.x, preview.y - this.y)
            g.endStroke()
            var newalpha = (maxPreview - x) / maxPreview
            g.moveTo(preview.x - this.x, preview.y - this.y)
            g.beginStroke(createjs.Graphics.getRGB(0,255,255, newalpha));
            //g.lineTo(preview.x, preview.y)
        }


        this.hud.textSpeed.text = 'Speed: ' + Math.round(this.speed())
        this.hud.textFuel.text  = 'Fuel: '  + Math.round(this.fuel)
        this.hud.textGrav.text  = 'Gravity: ' + Math.round(this.vectorLength(this.gravity())*10)

    }

    p.respawn = function() {
        var spawn = this.myPlanet.getSpawnPoint()
        console.log("Ship: spawning at", spawn)

        this.timeDied = undefined
        this.vX = spawn.vx
        this.vY = spawn.vy
        this.x  = spawn.x
        this.y  = spawn.y

        this.rotation            = spawn.r
        this.trajectory.rotation = - spawn.r
    }

    p.preview = function() {

        return {
            x                   : this.x,
            y                   : this.y,
            vX                  : this.vX,
            vY                  : this.vY,
            planets             : this.planets,
            gravity             : this.gravity,
            attractionTo        : this.attractionTo,
            distanceTo          : this.distanceTo,
            vectorLength        : this.vectorLength,
            makeShape           : function(){},
            makeCrashedShape    : this.makeCrashedShape,
            graphics            : this.trajectory.graphics,
            shipFlame           : new createjs.Shape(),
            shipBody            : new createjs.Shape(),
            trajectory          : new createjs.Shape(),
            tick                : this.tick,
            isCrashed           : this.isCrashed,
            isWithinBoundingBox : this.isWithinBoundingBox,
            isPreview           : true
        }
    }

    p.isCrashed = function() {
        // check crash into planets themelves
        for (var x = 0; x < this.planets.length; x++) {
            if (this.distanceTo(this.planets[x]) < this.planets[x].radius) {
                return true;
            }
        }
        return !this.isWithinBoundingBox()
    }

    p.isWithinBoundingBox = function() {
        // first, check crash into planets themelves
        // at the same time, check crash into bounding ellipsis
        var sumDistance    = 0
        var planetDistance = 0
        var previousPlanet = null;

        for (var i = 0; i < this.planets.length; i++) {
            var distance = this.distanceTo(this.planets[i])
            if (previousPlanet) {
                var dist = {
                    x: previousPlanet.x - this.planets[i].x,
                    y: previousPlanet.y - this.planets[i].y
                }
                planetDistance += this.vectorLength(dist)
            }
            previousPlanet = this.planets[i]

            sumDistance += distance
        }

        return (sumDistance < planetDistance * 1.6)
    }

    p.gravity = function() {
        var sx = 0.0
        var sy = 0.0

        for (var p = 0; p < this.planets.length; p++) {
            var attr = this.attractionTo(this.planets[p])
            sx += attr.x
            sy += attr.y
        }
        return {x: sx, y: sy}
    }

    p.vectorLength = function(v) {
        return Math.sqrt(
            Math.pow(v.x ,2) + Math.pow(v.y, 2)
        )
    }

    p.speed = function() {
        return this.vectorLength({x:this.vX, y: this.vY})
    }

    p.distanceTo = function (planet) {
        return this.vectorLength({
            x: this.x - planet.x,
            y: this.y - planet.y
        })
    }

    p.attractionTo = function(planet) {
        var deltaX = planet.x - this.x
        var deltaY = planet.y - this.y
        var dist = this.distanceTo(planet)
        return {
            x:  Ship.GRAVITY * deltaX / Math.pow(Math.abs(dist)+0.1, 2),
            y:  Ship.GRAVITY * deltaY / Math.pow(Math.abs(dist)+0.1, 2)
        }
    }

    p.makeCrashedShape = function() {
        var fadeTime = 500
        var timeDead = (new Date()) - this.timeDied
        var fade = Math.max(0, fadeTime - timeDead) / fadeTime

        var g = this.shipBody.graphics
        g.clear()
        g.beginStroke(createjs.Graphics.getRGB(255,255,255, fade))
        g.beginFill(createjs.Graphics.getRGB(255,0xbc,0x23, fade))
        g.drawPolyStar(0, 0, this.fuel / 30, 8, 0.5, 0)

        g = this.trajectory.graphics
        g.clear()

        g = this.shipFlame.graphics
        g.clear()
    }

    p.tick = function (event) {
        //move by velocity

        var gravity = this.gravity()
        this.vX += gravity.x
        this.vY += gravity.y

        if (this.isCrashed() && !this.isPreview) {
            this.vX = 0
            this.vY = 0
            if (!this.timeDied) {
                this.timeDied = new Date()
            }
            else if (new Date() - this.timeDied > Ship.REVIVAL_TIME) {
                return this.respawn()
            }
            else {
                this.makeCrashedShape()
                return
            }
        }

        this.makeShape()

        this.x += this.vX;
        this.y += this.vY;

        // running out of fuel
        if (this.fuel <= 0) {
            this.thrust = 0
            this.fuel   = 0
        }

        //with thrust flicker a flame every Ship.TOGGLE frames, attenuate thrust
        if (this.thrust > 0) {
            this.timeout++;
            this.shipFlame.alpha = 1;

            this.fuel -= this.thrust

            this.shipFlame.scaleX = this.thrust * Ship.FLAME_THRUST_FACTOR
            this.shipFlame.scaleY = this.thrust * Ship.FLAME_THRUST_FACTOR

            this.thrust -= 0.5;
        }
        else {
            this.shipFlame.alpha = 0;
            this.thrust = 0;
        }
    }

    p.accelerate = function () {
        //increase push ammount for acceleration
        if (this.fuel <= 0) {
            this.fuel = 0
            return
        }
        this.thrust += this.thrust + 0.6;
        if (this.thrust >= Ship.MAX_THRUST) {
            this.thrust = Ship.MAX_THRUST;
        }

        //accelerate
        this.vX += Math.sin(this.rotation * (Math.PI / -180)) * this.thrust;
        this.vY += Math.cos(this.rotation * (Math.PI / -180)) * this.thrust;

        //cap max speeds
        this.vX = Math.min(Ship.MAX_VELOCITY, Math.max(-Ship.MAX_VELOCITY, this.vX));
        this.vY = Math.min(Ship.MAX_VELOCITY, Math.max(-Ship.MAX_VELOCITY, this.vY));
    }

    p.rotate = function rotate(dir) {
        switch(dir) {
            case 'left':  this.rotation -= Ship.ROTATION_SPEED; break;
            case 'right': this.rotation += Ship.ROTATION_SPEED; break;
        }
        this.trajectory.rotation = - this.rotation
    }

    window.Ship = Ship;
}(window));

/* vim: set sw=4 ts=4 et nocindent smartindent : */
