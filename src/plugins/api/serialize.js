'use strict'

const is = require( '../../is' )
const path = require( 'path' )
const Mime = require( 'mime' )

const serialize = ({ api, Api }) => {
  api.serialize = () => {
    const serialized = {}

    api.subNodes.forEach( current => {
      if( current.hasChildNodes() ) return

      const key = current.getPath()

      let value = true

      if( current.nodeName === '#file' ){
        const { encoding, filename } = current.value
        let { data } = current.value

        const mime = Mime.lookup( key )
        const { ext } = path.parse( filename )

        if( encoding === 'hex' )
          data = Buffer.from( data, 'hex' )

        value = is.text( mime ) || is.text( encoding ) || Api.isTextExtension( ext ) ?
          data : data.toString( 'base64' )
      }

      serialized[ key ] = value
    })

    return serialized
  }
}

module.exports = serialize
