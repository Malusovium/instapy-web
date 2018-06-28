const { src
      , task
      , exec
      , context
      } = require('fuse-box/sparky')
const { FuseBox
      , WebIndexPlugin
      , EnvPlugin
      , QuantumPlugin
      } = require('fuse-box')

context
( class {
    getConfig () {
      return FuseBox.init
        ( { homeDir: 'src'
          , target: 'browser@es6'
          , output: 'build/$name.js'
          , sourceMaps: !this.isProduction
          , plugins:
            [ WebIndexPlugin
              ({ template: './src/index.html'})
            , this.isProduction
              && QuantumPlugin
                ( { bakeApiIntoBundle: 'app'
                  , containedAPI: true
                  , uglify: true
                  , treeshkae: true
                  }
                )
            , EnvPlugin
              ( { ENV:
                    this.isProduction 
                      ? 'production'
                      : 'test'
                , URL:
                    this.isProduction
                      ? this.backUrl
                      : 'http://localhost:3000'
                }
              )
            ]
          }
        )
    }
  }
)

const clean =
  async context => {
    await src('./build')
      .clean('build/')
      .exec()
  }

const dev =
  async context => {
    await clean()
    context.isProduction = false
    const fuse = context.getConfig()
    fuse.dev({ fallback: 'index.html' })
    fuse
      .bundle('app')
      .instructions('> index.ts')
      .hmr()
      .watch()

    await fuse.run()
  }

const build =
  async context => {
    await clean()
    context.isProduction = true
    context.backUrl = process.env.FQDN
    const fuse = context.getConfig()
    fuse.bundle('app')
        .instructions('> index.ts')

    await fuse.run()
  }

task('dev', dev)
task('build', build)
