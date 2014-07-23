'use strict'

var buster = require('buster')

var Watchout = require('../')

buster.testCase('Watchout', {
    'constructor()': {
        'should trigger reset': function() {
            var stub = this.stub(Watchout.prototype, 'reset')

            new Watchout(function() {}, function() {}).cancel()

            assert.calledOnce(stub)
        },

        'executes task function with two arguments: reset and done functions': {

            'where reset function executes `reset()`': function() {
                var resetStub = this.stub(Watchout.prototype, 'reset')
                var doneStub = this.stub(Watchout.prototype, 'done')

                new Watchout(function(reset) {
                    reset()
                }, function() {})

                assert.calledTwice(resetStub)
                refute.called(doneStub)
            },

            'where done function executes `done()`': function() {
                var resetStub = this.stub(Watchout.prototype, 'reset')
                var doneStub = this.stub(Watchout.prototype, 'done')

                new Watchout(function(reset, done) {
                    done()
                }, function() {})

                assert.calledOnce(resetStub)
                assert.calledOnce(doneStub)
            }
        }
    },

    '_cancel() cleans up deferred': function() {
        this.stub(Watchout.prototype, 'reset')
        this.stub(Watchout.prototype, 'done')

        var watchout = new Watchout(function() {})
        var spy = this.spy()

        watchout._cancel()

        refute.defined(watchout._deferredCancel)

        watchout._deferredCancel = spy

        watchout._cancel()

        assert.calledOnce(spy)
    },

    'reset() executes _cancel, and sets _deferredCancel': function(done) {
        var doneStub = this.stub(Watchout.prototype, 'done')
        var _cancelStub = this.stub(Watchout.prototype, '_cancel')

        var watchout = new Watchout(function() {}, function() {})

        assert.calledOnce(_cancelStub)
        assert.isFunction(watchout._deferredCancel)
        setTimeout(done(function() {
            assert.calledOnceWith(doneStub, false)
        }), 100)
    },

    'done() sets _stopped and executes _cancel() and _callback, where _callback is passed a success argument': function(){
        var resetStub = this.stub(Watchout.prototype, 'reset')
        var _cancelStub = this.stub(Watchout.prototype, '_cancel')
        var spy = this.spy()
        var watchout = new Watchout(function() {}, spy)

        assert.isFalse(watchout._stopped)
        
        watchout.done()
        
        assert.isTrue(watchout._stopped)

        assert.calledOnce(_cancelStub)

        assert.calledOnceWith(spy, false)
    },

    'cancel() sets _stopped and executes _cancel()': function() {
        var resetStub = this.stub(Watchout.prototype, 'reset')
        var _cancelSpy = this.spy(Watchout.prototype, '_cancel')
        var watchout = new Watchout(function() {})

        assert.isFalse(watchout._stopped)
        
        watchout.cancel()
        
        assert.isTrue(watchout._stopped)

        assert.calledOnce(_cancelSpy)
    }
})
