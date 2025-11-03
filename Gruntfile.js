module.exports = function(grunt) {
  const sass = require('sass');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // Compile SCSS to minified CSS with source maps
    sass: {
      options: {
        implementation: sass,
        sourceMap: true,
        outputStyle: 'compressed'
      },
      dist: {
        files: {
          'css/styles.min.css': 'scss/styles.scss'
        }
      }
    },

    // Concatenate JS sources into a single bundle
    concat: {
      js: {
        options: {
          sourceMap: true
        },
        files: {
          'js/app.js': [
            'src/js/script.js',
            'src/js/filters.js',
            'src/js/pwa.js'
          ]
        }
      }
    },

    // Minify JS bundle with source map
    uglify: {
      options: {
        mangle: true,
        compress: true,
        sourceMap: true,
        sourceMapName: 'js/app.min.js.map'
      },
      dist: {
        files: {
          'js/app.min.js': ['js/app.js']
        }
      }
    },

    // Clean generated assets
    clean: {
      build: ['css/styles.min.css', 'css/styles.min.css.map', 'js/*.min.js', 'js/*.map', 'js/app.js']
    },

    // Watch for changes (optional convenience)
    watch: {
      scss: {
        files: ['scss/**/*.scss'],
        tasks: ['sass']
      },
      js: {
        files: ['src/js/*.js'],
        tasks: ['concat', 'uglify']
      }
    }
  });

  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('build', ['sass', 'concat', 'uglify']);
  grunt.registerTask('default', ['build']);
};
