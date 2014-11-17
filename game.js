(function(window) {
    "use strict";

    var width  = 1200
    var height =  800
    document.getElementById('arena').width  = width
    document.getElementById('arena').height = height

    var stage = new createjs.Stage('arena')


    var worldBlue = new Planet('#2020de', width * 0.8, height/2)
    var worldRed  = new Planet('#de2020', width * 0.2, height/2)

    var worlds = [
        worldBlue,
        worldRed,
    ]

    var background = new Background(width, height)
    stage.addChild(background)

    stage.addChild(worldRed)
    stage.addChild(worldBlue)

    worldRed .scoreboard.x =  100
    worldRed .scoreboard.y =  740
    worldBlue.scoreboard.x = 1100
    worldBlue.scoreboard.y =  740

    stage.addChild(worldRed .scoreboard)
    stage.addChild(worldBlue.scoreboard)


    var ship = new Ship(worlds, worldRed)
    stage.addChild(ship)

    stage.addChild(ship.hud)

    createjs.Ticker.addEventListener("tick", stage);
    createjs.Ticker.addEventListener("tick", function() { ship.tick() });

    var interaction = new Interaction()

    interaction.up   (function(down){ if(down) ship.accelerate() })
    interaction.left (function(down){ if(down) ship.rotate('left') })
    interaction.right(function(down){ if(down) ship.rotate('right') })

}(window));

/* vim: set sw=4 ts=4 et nocindent smartindent : */
