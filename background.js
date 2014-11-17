(function(window) {
    "use strict";

    window.Background = function Background(width, height, worlds) {
        this.initialize(width, height, worlds)
    }

    var p = Background.prototype = new createjs.Container()

    p.Container_initialize = p.initialize

    p.initialize = function(width, height, worlds) {
        this.Container_initialize()
        this.width  = width
        this.height = height

        var stars = new createjs.Shape()

        for (var x = 0; x < 500; x++) {
            var starpos = {
                isWithinBoundingBox: Ship.prototype.isWithinBoundingBox,
                distanceTo: Ship.prototype.distanceTo,
                vectorLength: Ship.prototype.vectorLength,
                planets: worlds,
                x: 0,
                y: 0
            }

            var radius = Math.random()
            stars.graphics.beginFill('#bebebe')

            while (!starpos.isWithinBoundingBox()) {
                starpos.x = Math.random() * this.width
                starpos.y = Math.random() * this.height
            }
            stars.graphics.drawCircle(starpos.x,starpos.y, radius)
        }

        var sky = new createjs.Shape()
        sky.graphics.beginLinearGradientFill(
            ['#000000', '#050520'], // colors
            [0, 1],                 // ratios
            0,0,                    // pos 1
            0,1000                  // pos 2
        )
        sky.graphics.drawRect(0,0, this.width, this.height)
        this.addChild(sky)
        this.addChild(stars)
    }

}(window));

/* vim: set sw=4 ts=4 et nocindent smartindent : */
