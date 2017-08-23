'use strict'

const is = require( '../../is' )
const Mime = require( 'mime' )

const deserialize = ({ statics, Api }) => {
  statics.deserialize = obj => {
    const paths = Object.keys( obj )

    let root

    const map = {}

    paths.forEach( filename => {
      const segs = filename.split( '/' )
      const name = segs.pop()
      const value = obj[ filename ]

      let file

      if( value === true ){
        file = Api.createDirectory( name )
      } else {
        const mime = Mime.lookup( filename )
        const isText = is.text( mime )
        const data = isText ? value : Buffer.from( value, 'base64' )
        let encoding

        if( isText )
          encoding = 'utf8'

        file = Api.createFile( name, data, encoding )
      }

      let parent
      let path = ''

      segs.forEach( ( name, i ) => {
        path += name

        let directory

        if( is.undefined( map[ path ] ) ){
          directory = Api.createDirectory( name )
          map[ path ] = directory

          if( i === 0 )
            root = directory
          else
            parent.appendChild( directory )
        } else {
          directory = map[ path ]
        }

        parent = directory

        path += '/'
      })

      if( is.undefined( parent ) ){
        root = parent = file
      } else {
        parent.appendChild( file )
      }
    })

    return root
  }
}

module.exports = deserialize
