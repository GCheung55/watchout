'use strict'

var prime = require('prime')
var defer = require('prime/defer')

var Watchout = prime({
    _stopped: false,

    constructor: function(task, callback, time, context) {
        var scope = this

        scope._task = task
        scope._callback = callback
        scope._time = time
        scope._context = context

        scope.reset()

        task(function() {
            scope.reset()
        }, function() {
            scope.done(true)
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

    /**
     * Reset the watchdog
     */
    reset: function() {
        var scope = this
        var time = scope._time

        if (!scope._stopped) {
            scope._cancel()

            scope._deferredCancel = defer(function() {
                scope.done(false)
            }, time)
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

            scope._callback.call(scope._context, !!success)
        }
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
