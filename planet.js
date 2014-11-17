(function(window) {
    "use strict";

    window.Planet = function Planet(color, width, height) {
        this.initialize(color, width, height)
    }

    Planet.NUM_SPAWN_POINTS = 7

    var p = Planet.prototype = new createjs.Shape()

    p.Container_initialize = p.initialize

    p.initialize = function(color, x, y) {

        this.color = color
        this.radius = 40
        this.graphics = new createjs.Graphics()
        this.graphics.beginFill(color)
        this.graphics.drawCircle(0,0, this.radius)
        this.x = x
        this.y = y

        this.spawns = []


        this.graphics.beginStroke(this.color)
        for (var i = 0; i < Planet.NUM_SPAWN_POINTS; i++) {
            var spawn = {
                x: this.x + this.radius * 4 * Math.sin(Math.PI * 2 / Planet.NUM_SPAWN_POINTS * i),
                y: this.y + this.radius * 4 * Math.cos(Math.PI * 2 / Planet.NUM_SPAWN_POINTS * i),
                vx: 1/this.radius * 200 * Math.sin(Math.PI / 2 + Math.PI * 2 / Planet.NUM_SPAWN_POINTS * i),
                vy: 1/this.radius * 200 * Math.cos(Math.PI / 2 + Math.PI * 2 / Planet.NUM_SPAWN_POINTS * i),
                r: Math.PI / 2 + Math.PI * 2 / Planet.NUM_SPAWN_POINTS * i
            }
            this.spawns.push(spawn)
        }
        this.graphics.endStroke()

    }

    p.getSpawnPoint = function() {
        return this.spawns[Math.floor(Math.random()*this.spawns.length)]
    }

}(window));

/* vim: set sw=4 ts=4 et nocindent smartindent : */
