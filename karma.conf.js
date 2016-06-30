module.exports = function (config) {
  var customLaunchers = {
    sl_chrome: {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform: 'Windows 7',
      version: '35'
    },
    sl_firefox: {
      base: 'SauceLabs',
      browserName: 'firefox',
      version: '30'
    },
    sl_ios_safari: {
      base: 'SauceLabs',
      browserName: 'iphone',
      platform: 'OS X 10.9',
      version: '7.1'
    },
    sl_ie_11: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 8.1',
      version: '11'
    }
  }

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
    options.reporters.concat(['coveralls', 'dots', 'saucelabs'])
    // https://github.com/karma-runner/karma-sauce-launcher/issues/73
    options.sauceLabs = {
      startConnect: false,
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
      username: process.env.SAUCE_USERNAME,
      accessKey: process.env.SAUCE_ACCESS_KEY,
      testName: 'NamedStorage Unit Tests'
    }
    options.customLaunchers = customLaunchers
    options.browsers = Object.keys(customLaunchers)
    options.singleRun = true
    options.autoWatch = false
  } else {
    options.browsers = options.browsers.concat(['Chrome', 'Safari'])
  }

  config.set(options)
}
