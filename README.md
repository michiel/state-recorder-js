# state-recorder

A State object that can emit or consume changes in JSON-PATCH format

[![Travis build status](http://img.shields.io/travis/michiel/state-recorder-js.svg?style=flat)](https://travis-ci.org/michiel/state-recorder-js)
[![Code Climate](https://codeclimate.com/github/michiel/state-recorder-js/badges/gpa.svg)](https://codeclimate.com/github/michiel/state-recorder-js)
[![Test Coverage](https://codeclimate.com/github/michiel/state-recorder-js/badges/coverage.svg)](https://codeclimate.com/github/michiel/state-recorder-js)
[![Dependency Status](https://david-dm.org/michiel/state-recorder-js.svg)](https://david-dm.org/michiel/state-recorder-js)
[![devDependency Status](https://david-dm.org/michiel/state-recorder-js/dev-status.svg)](https://david-dm.org/michiel/state-recorder-js#info=devDependencies)


## Example

    $ npm run build
    $ node

    > SR = require('./dist/state-recorder').default
    [Function: StateRecorder]
    > var state = new SR()
    undefined
    > state.set('keyA', 'a')
    undefined
    > state.set('keyA', 'A')
    undefined
    > var patches = state.getReversePatches()
    undefined
    > patches
    [ { op: 'remove', path: 'keyA' },
      { op: 'replace', path: 'keyA', value: 'a' } ]
    > state.get('keyA')
    'A'
    > state.applyPatch(patches[1])
    undefined
    > state.get('keyA')
    'a'
    > state.applyPatch(patches[0])
    undefined
    > state.has('keyA')
    false
    > state.getPatches()
    [ [ { op: 'remove', path: 'keyA' },
        { op: 'add', path: 'keyA', value: 'a' } ],
      [ { op: 'replace', path: 'keyA', value: 'a' },
        { op: 'replace', path: 'keyA', value: 'A' } ],
      [ { op: 'replace', path: 'keyA', value: 'A' },
        { op: 'replace', path: 'keyA', value: 'a' } ],
      [ { op: 'add', path: 'keyA', value: 'a' },
        { op: 'remove', path: 'keyA' } ] ]

