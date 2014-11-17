(function(window) {
    "use strict";

    window.Background = function Background(width, height) {
        this.initialize(width, height)
    }

    var p = Background.prototype = new createjs.Container()

    p.Container_initialize = p.initialize

    p.initialize = function(width, height) {
        this.Container_initialize()
        this.width  = width
        this.height = height

        var stars = new createjs.Container()

        for (var x = 0; x < 600; x++) {
            var star = new createjs.Shape()
            var radius = Math.random()
            star.graphics.beginFill('#bebebe')
            star.graphics.drawCircle(0,0, radius)
            star.x = Math.random() * this.width
            star.y = Math.random() * this.height
            stars.addChild(star)
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
