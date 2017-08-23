'use strict'

const assert = require( 'assert' )
const path = require( 'path' )
const fs = require( 'fs' )
const pify = require( 'pify' )
const rimraf = require( 'rimraf' )
const { Factory } = require( '../src' )
const plugins = require( './fixtures/plugins' )
const is = require( '../src/is' )

const VFS = Factory( plugins )

const sourceDirectory = path.join( process.cwd(), 'test/fixtures/source' )
const sourceHelloFile = path.join( process.cwd(), 'test/fixtures/source/hello.txt' )
const targetDirectory = path.join( process.cwd(), 'test/fixtures/target' )
const targetHelloFile = path.join( process.cwd(), 'test/fixtures/target/hello.txt' )
const actualizedDirectory = path.join( process.cwd(), 'test/fixtures/target/source' )

const mkdir = pify( fs.mkdir )

describe( 'VFS', () => {
  const base64png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAMAAAAoyzS7AAAABlBMVEX///8AAABVwtN+AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAeFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAQAAADiNnVPNjtMwEH4Vy3sBicSJm39tWLXJVuwhsCqVlqsTO1urjR3ZLs321TjwSLwCTmkKQqsKYfkw4/m+mfH83N4NPWm2zICaPXORwx/fvkPAaQ6fwsqr+oJt+IejYp+PH9fNcdukFN69B7dDNnR9xwwBQ7cTOhtySKisWWbl8RlBcIKYbQ7nowF8qR5BIRUDoRs5jT/DIE5dP0xxErwD2PMj5AXITx1/ltkbeOB8oI2maJutyuU5ltVyuDGmzxA6HA7uYeZK9Wy5aYo8jDB2LMLRL8KQwRH6ZvJQMt0o3hsuBRh1Usu9ySGcvtD1VXVxLLR7+pDbyA4NpEe+66GuQxNamxVrr6P1+qVnaMW03KuGWfjNH6GuU0egzSb7pLhtCtmVstl3TJiHMofW4lJOszAI4jCYRQ716tpp06B2kiRiTkviGLchoRh7k5/X+ElZRPEMx3iRLnz/Pk79BZ6HUXS/jHBYJvOJ+yC0IaJhE5f/5kZXuVmhGDFSraXcTVPwuJFG6o3sQVGMXQ/dELx54oLKg347NuqcL1P8K6NLJTtwqnTGX8ni3yrwi0//t4LIJoX+Gp/pyc7kKF6WwSqXdWLC7pCyy/ITNz4Nn6IenJwAAAAKSURBVBhXY2AAAAACAAGj2j2UAAAAAElFTkSuQmCC'

  describe( 'createFile', () => {
    it( 'text', () => {
      const text = VFS.createFile( 'hello.txt', 'Hello, world!' )

      assert.equal( text.nodeType, VFS.FILE_NODE )
      assert.equal( text.data, 'Hello, world!' )
      assert.equal( text.mime, 'text/plain' )
      assert.equal( text.filename, 'hello.txt' )
      assert.equal( text.ext, '.txt' )
    })

    it( 'from buffer', () => {
      const buffer = Buffer.from( base64png, 'base64' )
      const png = VFS.createFile( 'bin.png', buffer )
      const { data } = png

      assert( data instanceof Buffer )
    })

    it( 'from JSON buffer', () => {
      const buffer = Buffer.from( base64png, 'base64' )
      const json = JSON.stringify( buffer )
      const obj = JSON.parse( json )
      const png = VFS.createFile( 'bin.png', obj )
      const { data } = png

      assert( data instanceof Buffer )
      assert.equal( data.toString( 'base64' ), base64png )
    })

    it( 'from byte array', () => {
      const buffer = Buffer.from( base64png, 'base64' )
      const json = JSON.stringify( buffer )
      const obj = JSON.parse( json )
      const png = VFS.createFile( 'bin.png', obj.data )
      const { data } = png

      assert( data instanceof Buffer )
      assert.equal( data.toString( 'base64' ), base64png )
    })

    it( 'from buffer with encoding', () => {
      const buffer = Buffer.from( base64png, 'base64' )
      const png = VFS.createFile( 'bin.png', buffer, 'buffer' )
      const { data } = png

      assert( data instanceof Buffer )
      assert.equal( data.toString( 'base64' ), base64png )
    })

    it( 'from hex data', () => {
      const buffer = Buffer.from( base64png, 'base64' )
      const hex = buffer.toString( 'hex' )

      const png = VFS.createFile( 'bin.png', hex, 'hex' )
      const { data } = png

      assert( is.string( data ) )
      assert.equal( data, hex )
    })

    it( 'bad filename', () => {
      assert.throws( () => VFS.createFile( 'root/hello.txt', 'hello' ) )
      assert.throws( () => VFS.createFile( '', 'hello' ) )
      assert.throws( () => VFS.createDirectory( 'root/hello' ) )
      assert.throws( () => VFS.createDirectory( '' ) )
    })
  })

  describe( 'serializes', () => {
    it( 'single directory', () => {
      const root = VFS.createDirectory( 'root' )
      const serRoot = root.serialize()

      assert.deepEqual( serRoot, { 'root': true } )
    })

    it( 'single file', () => {
      const file = VFS.createFile( 'hello.txt', 'Hello, World!', 'utf8' )
      const serFile = file.serialize()

      assert.deepEqual( serFile, { 'hello.txt': 'Hello, World!' } )
    })

    it( 'nested', () => {
      const root = VFS.createDirectory( 'root' )
      const file = VFS.createFile( 'hello.txt', 'Hello, World!', 'utf8' )

      root.appendChild( file )

      const serTree = root.serialize()

      assert.deepEqual( serTree, { 'root/hello.txt': 'Hello, World!' } )
    })

    it( 'binary', () => {
      const expect = { 'bin.png': base64png }
      const buffer = Buffer.from( base64png, 'base64' )
      const file = VFS.createFile( 'bin.png', buffer )
      const serFile = file.serialize()

      assert.deepEqual( serFile, expect )
    })

    it( 'hex', () => {
      const expect = { 'bin.png': base64png }
      const buffer = Buffer.from( base64png, 'base64' )
      const hex = buffer.toString( 'hex' )
      const file = VFS.createFile( 'bin.png', hex, 'hex' )
      const serFile = file.serialize()

      assert.deepEqual( serFile, expect )
    })
  })


  describe( 'deserializes', () => {
    it( 'single directory', () => {
      const root = VFS.createDirectory( 'root' )
      const serRoot = root.serialize()
      const rootTree = VFS.deserialize( serRoot )

      assert.deepEqual( serRoot, rootTree.serialize() )
    })

    it( 'single file', () => {
      const file = VFS.createFile( 'hello.txt', 'Hello, World!', 'utf8' )
      const serFile = file.serialize()
      const fileTree = VFS.deserialize( serFile )

      assert.deepEqual( serFile, fileTree.serialize() )
    })

    it( 'nested', () => {
      const root = VFS.createDirectory( 'root' )
      const sub = VFS.createDirectory( 'sub' )
      const sub2 = VFS.createDirectory( 'sub2' )
      const text = VFS.createFile( 'hello.txt', 'Hello, World!', 'utf8' )
      const js = VFS.createFile( 'hello.js', '\'use strict\'\n', 'utf8' )

      root.appendChild( text )
      root.appendChild( sub )
      root.appendChild( sub2 )
      sub.appendChild( js )

      const serTree = root.serialize()
      const tree = VFS.deserialize( serTree )

      assert.deepEqual( serTree, tree.serialize() )
    })

    it( 'binary', () => {
      const serFile = { 'bin.png': base64png }

      const file = VFS.deserialize( serFile )
      const { data } = file

      assert( data instanceof Buffer )
    })
  })

  describe( 'virtualize', () => {
    it( 'virtualizes directory', done => {
      // git doesn't check in empty folders, we might need to make it
      const empty = path.join( sourceDirectory, 'depth-0/depth-1/depth-2' )

      try {
        const stats = fs.statSync( empty )
      } catch( e ){
        if( e.code === 'ENOENT' )
          fs.mkdirSync( empty )
        else
          throw e
      }

      VFS.registerText( '.mmon' )
      VFS.virtualize( sourceDirectory, ( err, tree ) => {
        assert( !err )

        const ser = tree.serialize()

        assert.deepEqual( ser, {
          'source/depth-0/depth-1/depth-2': true,
          'source/depth-0/depth-1/bin.png': base64png,
          'source/depth-0/depth-1/hello.mmon': 'hello>',
          'source/depth-0/hello.js': '\'use strict\'\n',
          'source/hello.txt': 'Hello, World!'
        })

        done()
      })
    })

    it( 'virtualizes file', done => {
      VFS.virtualize( sourceHelloFile, ( err, tree ) => {
        assert( !err )

        const ser = tree.serialize()

        assert.deepEqual( ser, {
          'hello.txt': 'Hello, World!'
        })

        done()
      })
    })

    it( 'bad registerText extensions', () => {
      assert.throws( () => VFS.registerText() )
      assert.throws( () => VFS.registerText( '' ) )
    })

    it( 'registerText dotless', () => {
      VFS.registerText( 'haml' )
      assert( VFS.isTextExtension( '.haml' ) )
    })
  })

  describe( 'actualize', () => {
    it( 'actualizes directory', done => {
      VFS.virtualize( sourceDirectory, ( err, tree ) => {
        mkdir( targetDirectory )
        .then( () => {
          tree.actualize( targetDirectory, err => {
            assert( !err )

            VFS.virtualize( actualizedDirectory, ( err, actTree ) => {
              assert.deepEqual( tree.serialize(), actTree.serialize() )

              rimraf( targetDirectory, () => done() )
            })
          })
        })
      })
    })

    it( 'actualizes file', done => {
      VFS.virtualize( sourceHelloFile, ( err, tree ) => {
        mkdir( targetDirectory )
        .then( () => {
          tree.actualize( targetDirectory, err => {
            assert( !err )

            VFS.virtualize( targetHelloFile, ( err, actTree ) => {
              assert.deepEqual( tree.serialize(), actTree.serialize() )

              rimraf( targetDirectory, () => done() )
            })
          })
        })
      })
    })

    it( 'bad root path', done => {
      VFS.virtualize( sourceDirectory, ( err, tree ) => {
        tree.actualize( '', err => {
          assert( err )
          tree.actualize( sourceHelloFile, err => {
            assert( err )
            done()
          })
        })
      })
    })
  })

  describe( 'value', () => {
    it( 'sets new file name value', () => {
      const text = VFS.createFile( 'hello.txt', 'hello' )

      text.value.filename = 'goodbye.txt'

      assert.equal( text.filename, 'goodbye.txt' )
    })

    it( 'sets new directory name value', () => {
      const directory = VFS.createDirectory( 'hello' )

      directory.value.filename = 'goodbye'

      assert.equal( directory.filename, 'goodbye' )
    })

    it( 'throws on bad value', () => {
      const text = VFS.createFile( 'hello.txt', 'hello' )

      assert.throws( () => {
        text.value = { nodeType: 0, filename: 'nope' }
      })
    })
  })

  describe( 'paths', () => {
    it( 'getPath', done => {
      VFS.virtualize( sourceDirectory, ( err, tree ) => {
        const depth2 = tree.subNodes.find( current =>
          current.filename === 'depth-2'
        )

        const png = tree.subNodes.find( current =>
          current.filename === 'bin.png'
        )

        assert.equal( tree.getPath(), 'source' )
        assert.equal( depth2.getPath(), 'source/depth-0/depth-1/depth-2' )
        assert.equal( png.getPath(), 'source/depth-0/depth-1/bin.png' )

        done()
      })
    })

    it( 'atPath', done => {
      VFS.virtualize( sourceDirectory, ( err, tree ) => {
        const depth2 = tree.subNodes.find( current =>
          current.filename === 'depth-2'
        )

        const png = tree.subNodes.find( current =>
          current.filename === 'bin.png'
        )

        assert.equal( tree.atPath( 'source' ), tree )
        assert.equal( tree.atPath( 'source/depth-0/depth-1/depth-2' ), depth2 )
        assert.equal( tree.atPath( 'source/depth-0/depth-1/bin.png' ), png )

        done()
      })
    })
  })
})
