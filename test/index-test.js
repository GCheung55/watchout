'use strict'

var buster = require('buster')

var Watchout = require('../')

buster.testCase('Watchout', {
    'constructor()': {
        'throws if missing time or callback args': function(){
            var stub = this.stub(Watchout.prototype, '_setDefer')

            assert.exception(function(){
                new Watchout()
            })

            assert.exception(function(){
                new Watchout(1)
            })
        },
        'task argument is optional': function() {
            var stub = this.stub(Watchout.prototype, '_setDefer')

            refute.exception(function() {
                new Watchout(1, function() {})
            })
        },

        'should trigger _setDefer': function() {
            var stub = this.stub(Watchout.prototype, '_setDefer')

            new Watchout(1, function() {}).cancel()

            assert.calledOnce(stub)
        },

        'executes task function with three arguments: reset, done, and cancel functions': {

            'where reset function executes `reset()`': function() {
                var resetStub = this.stub(Watchout.prototype, 'reset')
                var doneStub = this.stub(Watchout.prototype, 'done')
                var _setDeferStub = this.stub(Watchout.prototype, '_setDefer')

                new Watchout(1, function() {}, function(reset) {
                    reset()
                })

                assert.calledOnce(resetStub)
                assert.calledOnce(_setDeferStub)
                refute.called(doneStub)
            },

            'where done function executes `done()`': function() {
                var resetStub = this.stub(Watchout.prototype, 'reset')
                var doneStub = this.stub(Watchout.prototype, 'done')
                var _setDeferStub = this.stub(Watchout.prototype, '_setDefer')

                new Watchout(1, function() {}, function(reset, done) {
                    done()
                })

                refute.calledOnce(resetStub)
                assert.calledOnce(_setDeferStub)
                assert.calledOnce(doneStub)
            },

            'where cancel function executes `cancel()`': function() {
                var resetStub = this.stub(Watchout.prototype, 'reset')
                var doneStub = this.stub(Watchout.prototype, 'done')
                var _setDeferStub = this.stub(Watchout.prototype, '_setDefer')
                var cancelStub = this.stub(Watchout.prototype, 'cancel')

                new Watchout(1, function() {}, function(reset, done, cancel) {
                    cancel()
                })

                refute.calledOnce(resetStub)
                refute.calledOnce(doneStub)
                assert.calledOnce(_setDeferStub)
                assert.calledOnce(cancelStub)
            }
        },

        'executes callback function with haltedTimeout boolean': function(done) {
            new Watchout(1, function(haltedTimeout){
                assert.isTrue(haltedTimeout)
                new Watchout(1, function(haltedTimeout){
                    assert.isFalse(haltedTimeout)
                    done()
                })
            }, function(r, d){
                d()
            })
        }
    },

    '_cancel() cleans up deferred': function() {
        this.stub(Watchout.prototype, '_setDefer')
        this.stub(Watchout.prototype, 'done')

        var watchout = new Watchout(1, function() {})
        var spy = this.spy()

        watchout._cancel()

        refute.defined(watchout._deferredCancel)

        watchout._deferredCancel = spy

        watchout._cancel()

        assert.calledOnce(spy)
    },

    'reset() executes _cancel, and sets _deferredCancel': function(done) {
        var _cancelStub = this.stub(Watchout.prototype, '_cancel')

        var watchout = new Watchout(1, done)

        watchout.reset()

        assert.calledOnce(_cancelStub)
        assert.isFunction(watchout._deferredCancel)
    },

    'done() sets _stopped and executes _cancel() and _callback, where _callback is passed a haltedTimeout boolean': function(){
        var _setDeferStub = this.stub(Watchout.prototype, '_setDefer')
        var _cancelStub = this.stub(Watchout.prototype, '_cancel')
        var spy = this.spy()
        var watchout = new Watchout(1, spy)

        assert.isFalse(watchout._stopped)
        
        watchout.done()
        
        assert.isTrue(watchout._stopped)

        assert.calledOnce(_cancelStub)

        assert.calledOnceWith(spy, false)
    },

    'cancel() sets _stopped and executes _cancel()': function() {
        var _setDeferStub = this.stub(Watchout.prototype, '_setDefer')
        var _cancelSpy = this.spy(Watchout.prototype, '_cancel')
        var watchout = new Watchout(1, function() {})

        assert.isFalse(watchout._stopped)
        
        watchout.cancel()
        
        assert.isTrue(watchout._stopped)

        assert.calledOnce(_cancelSpy)
    },

    'pass() triggers done with true': function(){
        var _setDeferStub = this.stub(Watchout.prototype, '_setDefer')
        var done = this.stub(Watchout.prototype, 'done')
        var watchout = new Watchout(1, function(){})

        watchout.pass()

        assert.calledOnceWith(done, true)
    },

    'fail() triggers done with false': function(){
        var _setDeferStub = this.stub(Watchout.prototype, '_setDefer')
        var done = this.stub(Watchout.prototype, 'done')
        var watchout = new Watchout(1, function(){})

        watchout.fail()

        assert.calledOnceWith(done, false)
    }
})
