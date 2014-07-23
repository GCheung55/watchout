'use strict'

var config = module.exports

config['Watchout test'] = {
    rootPath: '../',
    environment: 'node',
    sources: [
        '*.js'
    ],
    tests: [
        'test/**/*-test.js',
    ],
    testHelpers: [
        'test/buster-helpers.js'
    ]
}
