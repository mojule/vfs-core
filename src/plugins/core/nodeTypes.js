'use strict'

const path = require( 'path' )
const is = require( '../../is' )
const Mime = require( 'mime' )

const nodeType = ({ core }) => {
  core.registerNodeType({
    nodeType: 40,
    name: 'directory',
    isEmpty: () => false,
    create: filename => {
      if( !is.filename( filename ) )
        throw Error( 'Expected filename to be a valid file name' )

      return { filename }
    }
  })

  core.registerNodeType({
    nodeType: 41,
    name: 'file',
    isEmpty: () => true,
    create: ( filename, data, encoding ) => {
      if( !is.filename( filename ) )
        throw new Error( 'Expected filename to be a valid file name' )

      if( is.undefined( encoding ) && is.bufferArg( data ) )
        data = Buffer.from( data )

      if( is.undefined( encoding ) && is.string( data ) )
        encoding = 'utf8'

      const parsed = path.parse( filename )
      const { ext } = parsed
      const mime = Mime.lookup( filename )
      const value = { filename, data, encoding, ext, mime }

      return value
    }
  })
}

module.exports = nodeType
