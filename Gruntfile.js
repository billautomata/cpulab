module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-browserify')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-express-server')
  grunt.loadNpmTasks('grunt-standard')
  grunt.loadNpmTasks('grunt-run')

  // grunt.registerTask('serve', [ 'browserify', 'express:dev', 'watch'])
  grunt.registerTask('default', ['standard:webapp', 'express', 'watch'])

  grunt.initConfig({
    express: {
      options: { },
      dev: {
        options: {
          port: 8000,
          script: './express_server.js'
        }
      }
    },
    standard: {
      options: {
        format: true,
        force: true
      },
      webapp: {
        src: [
          './webapp/**/*.js', './webapp/**/**/*.js'
        ]
      },
      source: {
        src: [ './source/*.js' ]
      }
    },
    run : {
      d: {
        cmd: 'node',
        args: [
          'server_side.js'
        ]
      },
      standard: {
        cmd: 'standard',
        args: [
          '-F',
          './source/*.js'
        ]
      }
    },
    browserify: {
      main: {
        src: 'webapp/index.js',
        dest: 'viz/viz.js',
        files: {
          'viz/viz.js': ['./webapp/*.js', './webapp/**/*.js', './webapp/**/**/*.js' ],
        },
        options: {
          transform: ['brfs'],
          browserifyOptions: {
            debug: true
          }
        }
      }
    },
    watch: {
      // client_js: {
      //   files: [ './source/*.js', './webapp/*.js', './index.html' ],
      //   tasks: ['standard:webapp', 'browserify:main'],
      //   options: {
      //     livereload: {
      //       port: 35729
      //     }
      //   }
      // },
      server_js: {
        files: [ './source/*.js', ],
        tasks: ['run:standard', 'run:d'],
        options: {
          livereload: {
            port: 35729
          }
        }
      }

    }
  })
}
