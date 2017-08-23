'use strict'

const is = require( '@mojule/is' )

const atPath = ({ api }) => {
  api.atPath = path => {
    const slugs = path.split( '/' )

    let target = api.rootNode

    slugs.forEach( ( slug, i ) => {
      if( i === 0 || is.undefined( target ) ) return

      target = target.childNodes.find( child =>
        child.slug() === slug
      )
    })

    return target
  }
}

module.exports = atPath
