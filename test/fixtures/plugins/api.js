'use strict'

const fs = require( 'fs' )
const path = require( 'path' )
const pify = require( 'pify' )

const { stat, writeFile, mkdir } = pify( fs )

const actualize = ({ api }) => {
  const write = ( root, current ) => {
    const filename = path.join( root, current.getPath() )

    if( current.nodeName === '#directory' )
      return mkdir( filename )

    const { data, encoding } = current.value

    return writeFile( filename, data, encoding )
  }

  api.actualize = ( root, callback ) =>
    stat( root )
    .then( stats => {
      if( !stats.isDirectory() )
        throw new Error( 'root must be a path to an existing directory' )
    })
    .then( () => api.subNodes.toArray() )
    .then( nodes => new Promise( ( resolve, reject ) => {
      const next = () => {
        if( nodes.length === 0 )
          return resolve()

        const current = nodes.shift()

        write( root, current ).then( () => next() ).catch( reject )
      }

      next()
    }))
    .then( () => callback( null ) )
    .catch( err => callback( err ) )
}

module.exports = actualize