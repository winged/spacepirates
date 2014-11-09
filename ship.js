(function(window) {
    "use strict";

    function Ship(startX, startY, vX, vY, worlds) {
        this.initialize(startX, startY, vX, vY, worlds);
    }

    var p = Ship.prototype = new createjs.Container();

    // public properties:
    Ship.TOGGLE = 60;
    Ship.MAX_THRUST = 2;
    Ship.MAX_VELOCITY = 5;

    // public properties:
    p.shipFlame;
    p.shipBody;

    p.timeout;
    p.thrust;

    p.fuel;

    p.vX;
    p.vY;

    p.bounds;
    p.hit;

    // constructor:
    p.Container_initialize = p.initialize;	//unique to avoid overiding base class

    p.initialize = function (startX, startY, vX, vY, worlds) {
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
        this.planets = worlds

        this.makeShape();
        this.timeout = 0;
        this.thrust = 0;
        this.vX = vX;
        this.vY = vY;


        this.x = startX
        this.y = startY
        //this.rotation = 90

        this.fuel = 1000;
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
        g.beginStroke("#FFFFFF");
        g.moveTo(0,0)
        var preview = this.preview()
        for (var x = 0; x < 100; x++) {
            preview.tick()
            if (preview.isCrashed()) {
                break;
            }
            g.lineTo(preview.x - this.x, preview.y - this.y)
        }


        this.hud.textSpeed.text = 'Speed: ' + Math.round(this.speed())
        this.hud.textFuel.text  = 'Fuel: '  + Math.round(this.fuel)
        this.hud.textGrav.text  = 'Gravity: ' + Math.round(this.vectorLength(this.gravity())*10)

        //furthest visual element
        this.bounds = 10;
        this.hit = this.bounds;
    }

    p.preview = function() {
        return {
            x: this.x,
            y: this.y,
            vX: this.vX,
            vY: this.vY,
            planets: this.planets,
            gravity: this.gravity,
            attractionTo: this.attractionTo,
            distanceTo: this.distanceTo,
            vectorLength: this.vectorLength,
            makeShape: function(){},
            shipFlame: {},
            tick: this.tick,
            isCrashed: this.isCrashed
        }
    }

    p.isCrashed = function() {
        for (var p = 0; p < this.planets.length; p++) {
            if (this.distanceTo(this.planets[p]) < 40) {
                return true;
            }
        }
        return false;
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
            Math.pow(v.x ,2)
            +
            Math.pow(v.y, 2)
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
            x:  80 * deltaX / Math.pow(Math.abs(dist)+0.1, 2),
            y:  80 * deltaY / Math.pow(Math.abs(dist)+0.1, 2)
        }
    }

    p.tick = function (event) {
        //move by velocity

        var gravity = this.gravity()
        this.vX += gravity.x
        this.vY += gravity.y

        this.makeShape()

        this.x += this.vX;
        this.y += this.vY;

        // running out of fuel
        if (this.fuel <= 0) {
            this.thrust = 0
        }

        //with thrust flicker a flame every Ship.TOGGLE frames, attenuate thrust
        if (this.thrust > 0) {
            this.timeout++;
            this.shipFlame.alpha = 1;

            this.fuel -= this.thrust * .2

            if (this.timeout > Ship.TOGGLE) {
                this.timeout = 0;
                if (this.shipFlame.scaleX == 1) {
                    this.shipFlame.scaleX = 0.5;
                    this.shipFlame.scaleY = 0.5;
                } else {
                    this.shipFlame.scaleX = 1;
                    this.shipFlame.scaleY = 1;
                }
            }
            this.thrust -= 0.5;
        } else {
            this.shipFlame.alpha = 0;
            this.thrust = 0;
        }
    }

    p.accelerate = function () {
        //increase push ammount for acceleration
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

    window.Ship = Ship;
}(window));

/* vim: set sw=4 ts=4 et nocindent smartindent : */
