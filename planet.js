(function(window) {
    "use strict";

    window.Planet = function Planet(color, x, y) {
        this.initialize(color, x, y)
    }

    Planet.NUM_SPAWN_POINTS = 7
    Planet.DEFAULT_RADIUS   = 30
    Planet.SHIP_RESCUE_COST = 15

    var p = Planet.prototype = new createjs.Shape()

    p.base_initialize = p.initialize

    p.initialize = function(color, x, y) {
        this.base_initialize()

        this.players = []

        this.color = color
        this.score  = 0
        this.radius = Planet.DEFAULT_RADIUS
        this.graphics.beginFill(color)
        this.graphics.drawCircle(0,0, this.radius)
        this.x = x
        this.y = y

        this.spawns = []

        this.scoreboard = new Scoreboard(this.color)

        this.graphics.beginStroke(this.color)
        for (var i = 0; i < Planet.NUM_SPAWN_POINTS; i++) {
            var spawn = {
                x: this.x + this.radius * 4 * Math.sin(Math.PI * 2 / Planet.NUM_SPAWN_POINTS * i),
                y: this.y + this.radius * 4 * Math.cos(Math.PI * 2 / Planet.NUM_SPAWN_POINTS * i),
                vx: 1/this.radius * 180 * Math.sin(Math.PI / 2 + Math.PI * 2 / Planet.NUM_SPAWN_POINTS * i),
                vy: 1/this.radius * 180 * Math.cos(Math.PI / 2 + Math.PI * 2 / Planet.NUM_SPAWN_POINTS * i),
                r: (360 / Planet.NUM_SPAWN_POINTS * i - 90) % 360
            }
            this.spawns.push(spawn)
        }
        this.graphics.endStroke()

    }

    p.getSpawnPoint = function() {
        return this.spawns[Math.floor(Math.random()*this.spawns.length)]
    }
    p.dumpCargo = function(amount) {
        this.score += amount
        this.scoreboard.update(this.score, this.players.length)
    }

    p.respawnShip = function() {
        this.score -= Planet.SHIP_RESCUE_COST
        this.scoreboard.update(this.score, this.players.length)
    }

}(window));

/* vim: set sw=4 ts=4 et nocindent smartindent : */
