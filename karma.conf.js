module.exports = function (config) {
  // https://github.com/angular/angular.js/blob/master/karma-shared.conf.js#L36
  var customLaunchers = {
    'SL_Chrome': {
      base: 'SauceLabs',
      browserName: 'chrome',
      version: '47'
    },
    'SL_Firefox': {
      base: 'SauceLabs',
      browserName: 'firefox',
      version: '43'
    },
    'SL_Safari_8': {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'OS X 10.10',
      version: '8'
    },
    'SL_Safari_9': {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'OS X 10.11',
      version: '9'
    },
    'SL_IE_9': {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 2008',
      version: '9'
    },
    'SL_IE_10': {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 2012',
      version: '10'
    },
    'SL_IE_11': {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 8.1',
      version: '11'
    },
    'SL_iOS': {
      base: "SauceLabs",
      browserName: "iphone",
      platform: "OS X 10.10",
      version: "8.1"
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
