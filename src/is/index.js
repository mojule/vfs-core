'use strict'

const Is = require( '@mojule/is' )
const isValidFilename = require( 'valid-filename' )

const mimetypesText = [
  'application/javascript', 'application/json'
]

const encodingsText = [
  'utf8', 'ascii', 'utf-8', 'binary', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le'
]

const encodingsBinaryString = [
  'hex', 'base64'
]

const encodingsBinary = encodingsBinaryString.concat( [ 'buffer' ] )

const encodings = encodingsText.concat( encodingsBinary )

const isText = subject =>
  ( /^text\// ).test( subject ) || ( /xml$/ ).test( subject ) ||
  mimetypesText.includes( subject ) || encodingsText.includes( subject )

const isEncoding = subject => encodings.includes( subject )

const isJsonBuffer = subject =>
  Is.object( subject ) && Is.toString( subject.type ) && subject.type === 'Buffer' &&
  isByteArray( subject.data )

const isByte = subject => Is.integer( subject ) && subject >= 0 && subject < 256

const isByteArray = subject => Is.array( subject ) && subject.every( isByte )

const isBuffer = subject => subject instanceof Buffer

const isBufferArg = subject =>
  isBuffer( subject ) || isJsonBuffer( subject ) || isByteArray( subject )

const isValue = subject =>
  Is.object( subject ) && isValidFilename( subject.filename ) &&
  Is.string( subject.nodeType )

const isDirectoryValue = subject =>
  isValue( subject ) && subject.nodeType === 40 //ugh

const isFileValue = subject =>
  isValue( subject ) && subject.nodeType === 41 &&
  ( isStringData( subject ) || isBinaryData( subject ) )

const isStringData = subject =>
  (
    isEncoding( subject.encoding ) &&
    encodingsText.includes( subject.encoding ) && Is.string( subject.data )
  ) ||
  ( is.undefined( subject.encoding ) && Is.string( subject.data ) )

const isBinaryStringData = subject =>
  Is.string( subject.data ) &&
  encodingsBinaryString.includes( subject.encoding )

const isBufferData = subject =>
  ( Is.undefined( subject.encoding ) && isBufferArg( subject.data ) ) ||
  ( subject.encoding === 'buffer' && isBuffer( subject.data ) )

const isBinaryData = subject =>
  isBinaryStringData( subject ) || isBufferData( subject )

const predicates = {
  text: isText,
  jsonBuffer: isJsonBuffer,
  buffer: isBuffer,
  bufferArg: isBufferArg,
  filename: isValidFilename,
  byte: isByte,
  byteArray: isByteArray,
  encoding: isEncoding,
  value: isValue,
  fileValue: isFileValue,
  directoryValue: isDirectoryValue
}

const is = Is( predicates )

module.exports = is
