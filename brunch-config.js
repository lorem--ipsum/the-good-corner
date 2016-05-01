module.exports = {
  files: {
    javascripts: {
      joinTo: {
        'vendor.js': /^(?!src)/,
        'app.js': /^src/
      }
    },
    stylesheets: {joinTo: 'app.css'}
  },

  paths: {
    watched: ['src']
  },

  plugins: {
    babel: {presets: ['es2015', 'react']},
    sass: {mode: 'native'}
  },

  modules: {
    nameCleaner: (path) => path.replace(/^src\//, '')
  }
};
