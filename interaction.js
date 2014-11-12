(function(window) {
    "use strict";

    var keymap = {
        37: 'left',
        39: 'right',
        38: 'up',
        40: 'down',
        13: 'enter',
    }

    var Interaction = window.Interaction = function() {
        document.addEventListener('keydown', this.keyevent.bind(this))
        document.addEventListener('keyup',   this.keyevent.bind(this))
    }

    var p = Interaction.prototype

    p.listeners = {}

    Object.keys(keymap).forEach(function(keycode) {
        var keyname = keymap[keycode]
        p.listeners[keyname] = []
        p[keyname] = function(callback) {
            this.listeners[keyname].push(callback)
        }
    })

    p.keyevent = function(ev) {
        var mapping = keymap[ev.keyCode]
        if (!mapping) {
            console.log("Key event for unknown key", ev)
            return
        }
        var down = 
            (ev.type == 'keydown') ? true :
            (ev.type == 'keyup')   ? false :
            undefined
        if (down == undefined){
            console.log("Key event neither up nor down", ev)
            return
        }
        ev.preventDefault()
        if (!this.listeners[mapping]) {
            console.log("No listeners for key", ev)
            return
        }
        var listeners = this.listeners[mapping]
        for (var i = 0; i < listeners.length; i++) {
            try {
                listeners[i](down)
            }
            catch (exc){
                // ignore
            }
        }
    }
    

}(window));

/* vim: set sw=4 ts=4 et nocindent smartindent : */
