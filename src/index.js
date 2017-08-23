'use strict'

const { Factory } = require( '@mojule/tree' )
const plugins = require( './plugins' )

const VFS = Factory( plugins )

module.exports = VFS
