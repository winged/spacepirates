(function(window) {
    "use strict";

    window.Planet = function Planet(color, width, height) {
        this.initialize(color, width, height)
    }

    var p = Planet.prototype = new createjs.Shape()

    p.Container_initialize = p.initialize

    p.initialize = function(color, x, y) {

        this.color = color
        this.graphics = new createjs.Graphics()
        this.graphics.beginFill(color)
        this.graphics.drawCircle(0,0, 40)
        this.x = x
        this.y = y
    }
}(window));

/* vim: set sw=4 ts=4 et nocindent smartindent : */
