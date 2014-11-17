(function(window) {
    "use strict";

    var width  = 1200
    var height =  800
    document.getElementById('arena').width  = width
    document.getElementById('arena').height = height

    var stage = new createjs.Stage('arena')

    var background = new Background(width, height)

    var worldBlue = new Planet('#2020de', width * 0.8, height/2)
    var worldRed  = new Planet('#de2020', width * 0.2, height/2)

    stage.addChild(background)
    stage.addChild(worldRed)
    stage.addChild(worldBlue)

    var ship = new Ship([worldRed, worldBlue], worldRed)
    stage.addChild(ship)

    stage.addChild(ship.hud)

    createjs.Ticker.addEventListener("tick", stage);
    createjs.Ticker.addEventListener("tick", function() { ship.tick() });

    var interaction = new Interaction()

    interaction.up(function(down){ if(down) ship.accelerate() })
    interaction.left(function(down){ if(down) ship.rotate('left') })
    interaction.right(function(down){ if(down) ship.rotate('right') })

}(window));

/* vim: set sw=4 ts=4 et nocindent smartindent : */
