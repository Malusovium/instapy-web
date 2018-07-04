const { src
      , task
      , exec
      , context
      } = require('fuse-box/sparky')
const { FuseBox
      , WebIndexPlugin
      , EnvPlugin
      , QuantumPlugin
      // , ImageBase64Plugin
      , CopyPlugin
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
            // [ ImageBase64Plugin()
            [ CopyPlugin
              ( { useDefault: true
                , files: ['*.png' ]
                // , dest: 'assets'
                }
              )
            , EnvPlugin
              ( { ENV:
                    this.isProduction
                      ? 'production'
                      : 'test'
                , FRONT_URL:
                    this.isProduction
                      ? this.fqdn
                      : 'http://localhost:4444'
                , BACK_URL:
                    this.isProduction
                      ? this.fqdn
                      : 'http://localhost:3000'
                }
              )
            , WebIndexPlugin
              ({ template: './src/index.html'})
            , this.isProduction
              && QuantumPlugin
                ( { // target: 'browser/es6'
                  // bakeApiIntoBundle: 'app'
                    processPolyfill: true
                  // , replaceProcessEnv: true
                  // , containedAPI: true
                  , uglify: true
                  , treeshkae: true
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
    fuse
      .dev
       ( { fallback: 'index.html'
         }
       )
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
    context.fqdn = process.env.FQDN || 'https://my-web.com'
    const fuse = context.getConfig()
    fuse.bundle('app')
        .instructions('> index.ts')

    await fuse.run()
  }

task('dev', dev)
task('build', build)
