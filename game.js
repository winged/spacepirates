(function(window) {
    "use strict";

    var width  = 1200
    var height =  800
    document.getElementById('arena').width  = width
    document.getElementById('arena').height = height

    var stage = new createjs.Stage('arena')

    var background = new Background(width, height)

    var worldBlue = new Planet('#2020de', width * .8, height/2)
    var worldRed  = new Planet('#de2020', width * .2, height/2)

    stage.addChild(background)
    stage.addChild(worldRed)
    stage.addChild(worldBlue)

    var ship = new Ship(350, 360, 10, 0, [worldRed, worldBlue])
    stage.addChild(ship)

    stage.addChild(ship.hud)

    createjs.Ticker.addEventListener("tick", stage);
    createjs.Ticker.addEventListener("tick", function() { ship.tick() });
}(window));

/* vim: set sw=4 ts=4 et nocindent smartindent : */
