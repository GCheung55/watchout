'use strict'

var prime = require('prime')
var defer = require('prime/defer')
var partial = require('mout/function/partial')

var checkArg = function(name, arg){
    if (arg == undefined) {
        throw new Error('Missing argument: ' + name)
    }
}

var checkTime = partial(checkArg, 'time')
var checkCallback = partial(checkArg, 'callback')

var Watchout = prime({
    _stopped: false,

    constructor: function(time, callback, task) {
        var scope = this

        checkTime(time)
        checkCallback(callback)
        
        scope._time = time
        scope._callback = callback
        scope._task = task

        scope._setDefer()

        task && task(function() {
            scope.reset()
        }, function() {
            scope.pass()
        }, function() {
            scope.cancel()
        })
    },

    /**
     * Cancel and cleanup deferred
     */
    _cancel: function() {
        var scope = this
        var deferredCancel = scope._deferredCancel

        deferredCancel && deferredCancel()

        delete scope._deferredCancel
    },

    _setDefer: function() {
        var scope = this

        scope._deferredCancel = defer(function() {
            scope.fail()
        }, scope._time)
    },

    /**
     * Reset the watchdog
     */
    reset: function() {
        var scope = this
        var time = scope._time

        if (!scope._stopped) {
            scope._cancel()

            scope._setDefer()
        }
    },

    /**
     * Complete by canceling the watchdog and calling callback
     * @param  {Boolean}   success Determine whether the task was completed before the timeout
     */
    done: function(success) {
        var scope = this

        if (!scope._stopped) {
            scope._stopped = true

            scope._cancel()

            scope._callback.call(scope, !!success)
        }
    },

    /**
     * Convenience method triggering done successfully
     */
    pass: function() {
        this.done(true)
    },

    /**
     * Convenience method triggering done unsuccessfully
     */
    fail: function() {
        this.done(false)
    },

    /**
     * Cancel the watchdog
     */
    cancel: function() {
        var scope = this

        if (!scope._stopped) {
            scope._stopped = true

            scope._cancel()
        }
    }
})

module.exports = Watchout
