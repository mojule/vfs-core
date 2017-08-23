'use strict'

const is = require( '../../is' )

const registerText = ({ statics }) => {
  const extensions = new Set()

  const normalizeExt = ext => {
    if( !is.string( ext ) || ext.length === 0 )
      throw new Error( 'Expected a non empty string' )

    if( !ext.startsWith( '.' ) )
      ext = '.' + ext

    ext = ext.toLowerCase()

    return ext
  }

  statics.registerText = ext => extensions.add( normalizeExt( ext ) )
  statics.isTextExtension = ext => extensions.has( normalizeExt( ext ) )
}

module.exports = registerText
