(function(window) {
    "use strict";

    window.Scoreboard = function Scoreboard(color) {
        this.initialize(color)
    }

    var p = Scoreboard.prototype = new createjs.Container()

    p.Container_initialize = p.initialize

    p.initialize = function(color) {
        p.Container_initialize()

        this.border      = new createjs.Shape()
        this.textScore   = new createjs.Text('score',     'bold 15px Arial', color)
        this.textPlayers = new createjs.Text('players',   'bold 15px Arial', color)

        this.addChild(this.border)
        this.addChild(this.textScore)
        this.addChild(this.textPlayers)

        this.update(0, 0)

        this.textScore.x = -80
        this.textScore.y =  30

        this.textPlayers.x = -80
        this.textPlayers.y =  10

        var g = this.border.graphics
        g.clear();
        g.beginFill("rgba(30,30,30,60)");
        g.beginStroke("#FFFFFF");

        g.moveTo(-150, 100)
        g.lineTo(150, 100)
        g.lineTo(100, 0)
        g.lineTo(-100, 0)
        g.lineTo(-150, 100)
        g.closePath()

    }

    p.update = function(score, players) {
        this.score = score
        this.players = players
        this.textScore.text   = "Team score: " + Math.round(score)
        this.textPlayers.text = Math.round(players) + " players"
    }

}(window));

/* vim: set sw=4 ts=4 et nocindent smartindent : */

