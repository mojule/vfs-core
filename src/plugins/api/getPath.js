'use strict'

const getPath = ({ api }) => {
  api.getPath = () => {
    const slugs = []

    api.inclusiveAncestorNodes.forEach( current => {
      const slug = current.slug()
      slugs.unshift( slug )
    })

    return slugs.join( '/' )
  }
}

module.exports = getPath
