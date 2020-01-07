'use strict'
const rimraf = require('rimraf')
const fs = require('fs')
rimraf.sync('./dist')
fs.mkdirSync('./dist')