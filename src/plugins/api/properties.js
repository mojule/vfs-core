'use strict'

const is = require( '../../is' )

const ensureValue = ( node, value ) => {
  const isValue = node.nodeName === '#file' ?
    is.fileValue : is.directoryValue

  if( !isValue( value ) )
    throw Error( `Bad value: ${ value }` )
}

const properties = ({ api, state, core, privates, Api }) => {
  core.registerProperty({
    target: api,
    name: 'filename',
    get: () => state.value.filename
  })

  if( state.value.nodeType === Api.FILE_NODE ){
    core.registerProperty({
      target: api,
      name: 'data',
      get: () => state.value.data
    })

    core.registerProperty({
      target: api,
      name: 'mime',
      get: () => state.value.mime
    })

    core.registerProperty({
      target: api,
      name: 'ext',
      get: () => state.value.ext
    })
  }

  core.registerProperty({
    target: api,
    name: 'value',
    get: () => state.value,
    set: value => {
      ensureValue( api, value )

      state.value = value

      return value
    }
  })
}

module.exports = properties