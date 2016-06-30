module.exports = function (config) {
  const options = {
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'storage.js',
      'test/**/*-spec.js'
    ],
    exclude: [],
    preprocessors: {
      'storage.js': ['coverage']
    },
    reporters: ['progress', 'coverage'],
    coverageReporter: {
      dir: 'coverage',
      reporters: [
        {
          type: 'html',
          subdir: function (browser) {
            return 'html/' + browser.toLowerCase().split(/[ /-]/)[0]
          }
        },
        {
          type: 'lcov',
          subdir: 'lcov'
        }
      ]
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['PhantomJS'],
    singleRun: true,
    concurrency: Infinity
  }

  if (process.env.TRAVIS) {
    options.reporters.push('coveralls')
    options.singleRun = true
    options.autoWatch = false
  } else {
    options.browsers = options.browsers.concat(['Chrome', 'Safari'])
  }

  config.set(options)
}
