(function(window) {
    "use strict";

    function Ship(planets, myPlanet) {
        this.initialize(planets, myPlanet);
    }

    var p = Ship.prototype = new createjs.Container();

    // public properties:
    Ship.GRAVITY             = 50
    Ship.REVIVAL_TIME        = 4000
    Ship.MAX_THRUST          = 4
    Ship.FLAME_THRUST_FACTOR = 0.5
    Ship.MAX_VELOCITY        = 20
    Ship.ROTATION_SPEED      = 15
    Ship.MAX_FUEL            = 100
    Ship.REFUEL_SPEED        = 0.5

    Ship.MAX_CARGO           = 100
    Ship.LOADING_SPEED       = 0.2

    // constructor:
    p.Container_initialize = p.initialize; //unique to avoid overiding base class

    p.initialize = function (planets, myPlanet) {
        this.Container_initialize();

        this.planets  = planets
        this.myPlanet = myPlanet

        this.shipFlame = new createjs.Shape()
        this.shipBody  = new createjs.Shape()
        this.hud       = new createjs.Container()

        this.hud.border    = new createjs.Shape()
        this.hud.textFuel  = new createjs.Text('speed',   null, '#bebebe')
        this.hud.textSpeed = new createjs.Text('speed',   null, '#bebebe')
        this.hud.textGrav  = new createjs.Text('gravity', null, '#bebebe')
        this.hud.textCargo = new createjs.Text('cargo',   null, '#bebebe')
        this.hud.textScore = new createjs.Text('score',   null, '#bebebe')

        this.hud.addChild(this.hud.border)
        this.hud.addChild(this.hud.textFuel )
        this.hud.addChild(this.hud.textSpeed)
        this.hud.addChild(this.hud.textGrav)
        this.hud.addChild(this.hud.textCargo)
        this.hud.addChild(this.hud.textScore)
        this.hud.textSpeed.x = 5
        this.hud.textSpeed.y = 5
        this.hud.textFuel.x = 5
        this.hud.textFuel.y = 15
        this.hud.textGrav.x = 5
        this.hud.textGrav.y = 25

        this.hud.textCargo.x = 5
        this.hud.textCargo.y = 35

        this.hud.textScore.x = 5
        this.hud.textScore.y = 45

        this.trajectory = new createjs.Shape()

        this.addChild(this.shipFlame);
        this.addChild(this.shipBody);
        this.addChild(this.trajectory);

        this.makeShape();
        this.thrust = 0;
        this.vX = 0;
        this.vY = 0;

        this.x = 0
        this.y = 0

        this.cargo = 0
        this.score = 0

        this.respawn()

        this.fuel = Ship.MAX_FUEL;
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
        g.lineTo(-0.5, 60.5)
        g.lineTo(100,  60.5)
        g.lineTo(160,  -0.5)
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
        }


        this.hud.textSpeed.text = 'Speed: '   + Math.round(this.speed())
        this.hud.textFuel.text  = 'Fuel: '    + Math.round(this.fuel)
        this.hud.textGrav.text  = 'Gravity: ' + Math.round(this.vectorLength(this.gravity())*10)
        this.hud.textCargo.text = 'Cargo: '   + Math.round(this.cargo)
        this.hud.textScore.text = 'Score: '   + Math.round(this.score)

    }

    p.respawn = function() {
        var spawn = this.myPlanet.getSpawnPoint()
        console.log("Ship: spawning at", spawn)

        this.timeDied = undefined
        this.vX = spawn.vx
        this.vY = spawn.vy
        this.x  = spawn.x
        this.y  = spawn.y

        this.rotation            =   spawn.r
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

        // for now, just ckeck the BOX, not the ellipse
        if (this.x < 0) { this.x = -0.1; return false}
        if (this.y < 0) { this.y = -0.1; return false}
        if (this.x > 1200) { this.x = 1200.1;  return false }
        if (this.y > 800)  { this.y =  800.1;  return false }

        return true


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
        var fadeTime = 800
        var timeDead = (new Date()) - this.timeDied
        var fade = Math.pow(Math.max(0, fadeTime - timeDead) / fadeTime, 2)

        var g = this.shipBody.graphics
        g.clear()
        g.beginStroke(createjs.Graphics.getRGB(255,255,255, fade))
        g.beginFill(createjs.Graphics.getRGB(255,0xbc,0x23, fade))
        g.drawPolyStar(0, 0, this.fuel / 6 - timeDead * 0.1, 8, 0.5, timeDead * 0.1)

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
            this.cargo = 0
            this.score = 0
            if (!this.timeDied) {
                this.timeDied = new Date()
            }
            else if (new Date() - this.timeDied > Ship.REVIVAL_TIME) {
                this.myPlanet.respawnShip()
                return this.respawn()
            }
            else {
                this.makeCrashedShape()
                return
            }
        }
        if (!this.isPreview) {
            this.refuel()
            this.loadCargo()
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
    p.refuel = function() {
        if (this.distanceTo(this.myPlanet) < this.myPlanet.radius*3) {
            // refuel
            this.fuel = Math.min(this.fuel + Ship.REFUEL_SPEED, Ship.MAX_FUEL)

            // unload cargo in the same step

            this.dumpCargo()

        }
    }

    p.dumpCargo = function() {
        var cargoBefore = this.cargo
        this.cargo = Math.max(this.cargo - Ship.LOADING_SPEED, 0)
        this.score += cargoBefore - this.cargo

        this.myPlanet.dumpCargo(cargoBefore - this.cargo)
    }

    p.loadCargo = function() {
        for (var x = 0; x < this.planets.length; x++) {
            if (this.planets[x] === this.myPlanet) {
                // no loading at home planet
                continue;
            }
            if (this.distanceTo(this.planets[x]) < this.planets[x].radius * 3) {
                this.cargo = Math.min(this.cargo + Ship.LOADING_SPEED, Ship.MAX_CARGO)
            }
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

        var weight = (this.fuel / Ship.MAX_FUEL + this.cargo / Ship.MAX_CARGO) / 2
        var drag = Ship.MAX_VELOCITY /  5 * weight

        //accelerate
        this.vX += Math.sin(this.rotation * (Math.PI / -180)) * this.thrust * drag;
        this.vY += Math.cos(this.rotation * (Math.PI / -180)) * this.thrust * drag;

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
