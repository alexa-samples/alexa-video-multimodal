'use strict'
const fs = require('fs')
fs.renameSync('coverage', 'dist/coverage')
fs.renameSync('doc', 'dist/doc')