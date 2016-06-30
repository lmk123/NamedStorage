/* global define:false */
(function (global, factory) {
  var mod = factory(global)
  /* istanbul ignore next */
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = mod
    /* istanbul ignore next */
  } else if (typeof define === 'function' && define.amd) {
    define(function () { return mod })
  } else {
    global.NamedStorage = mod
  }
}(this, function (global) {
  'use strict'
  var jsonParse = JSON.parse
  var jsonStringify = JSON.stringify
  var isNull = function (v) {
    return v === null
  }
  var isFunction = function (v) {
    return typeof v === 'function'
  }
  var isString = function (v) {
    return typeof v === 'string'
  }
  var emptyObj = {}
  var hasOwn = emptyObj.hasOwnProperty
  var forIn = function (obj, handler) {
    for (var key in obj) {
      if (hasOwn.call(obj, key)) {
        handler(key)
      }
    }
  }

  /**
   * 复制 JSON 对象。由于最终保存的是 JSON 字符串,所以不需要使用深复制。
   * @see https://github.com/lodash/lodash/issues/1984
   * @param o
   */
  var cloneJSON = function (o) {
    return jsonParse(jsonStringify(o))
  }

  var allStorages = {
    local: {},
    session: {}
  }

  /**
   * 构造函数
   * @param {String|Object} [options] - 当这个参数是字符串时, 则等同于设置 name
   * @param {Boolean} [options.session] - 默认使用 localStorage。设置此项为 true 则使用 sessionStorage
   * @param {String} [options.name="d"] - key 的前缀。添加此前缀能避免污染全局 storage 数据
   * @param {Boolean} [options.cache=true] - 若启用缓存, 则读取数据时会先从缓存内读取,然后从 storage 内读取
   * @param {Boolean} [options.lazySave=false] - 若启用, 则设置数据时不会立刻写入 storage, 而是在 window.onunload 事件时写入
   * @constructor
   */
  function MyStorage (options) {
    var _options = isString(options) ? { name: options } : (options || emptyObj)
    var namespace = (_options.name || 'd') + ':'
    var type = _options.session ? 'session' : 'local'

    var thisType = allStorages[type]
    // 相同的 type 与 namespace 会获取到同一个实例
    if (thisType[namespace]) {
      return thisType[namespace]
    }
    thisType[namespace] = this

    this.storage = global[type + 'Storage']
    this.type = type
    this.namespace = namespace
    this.useCache = _options.cache !== false
    this.saveOnUnload = _options.lazySave && this.useCache && isFunction(global.addEventListener)
    if (this.useCache) {
      this.caches = {}
    }
    if (this.saveOnUnload) {
      var that = this
      global.addEventListener('unload', function () {
        var caches = that.caches
        forIn(caches, function (key) {
          that.storage.setItem(that.getKey(key), jsonStringify(caches[key]))
        })
      })
    }
  }

  var storageProp = MyStorage.prototype

  /**
   * 获取实际使用的键名
   * @param {String} key
   * @returns {String}
   */
  storageProp.getKey = function (key) {
    return this.namespace + key
  }

  /**
   * 设置数据
   * @param {String} key
   * @param {*} value
   */
  storageProp.set = function (key, value) {
    // 如果值是 null 或 undefined 则删除这个键
    if (value == null) {
      this.remove(key)
      return
    }

    if (this.useCache) {
      this.caches[key] = cloneJSON(value)
    }
    if (!this.saveOnUnload) {
      this.storage.setItem(this.getKey(key), jsonStringify(value))
    }
  }

  /**
   * 获取数据
   * @param {String} key
   * @returns {*}
   */
  storageProp.get = function (key) {
    var useCache = this.useCache
    var caches

    // 如果启用缓存,则先从缓存内读取数据
    if (useCache) {
      caches = this.caches
      if (caches.hasOwnProperty(key)) {
        return cloneJSON(caches[key])
      }
    }

    var _key = this.getKey(key)
    // 尝试从 storage 内读取数据
    var stringValue = this.storage.getItem(_key)
    if (isNull(stringValue)) {
      return
    }

    // 尝试将 storage 内的数据转换成 json 值
    var jsonValue
    try {
      jsonValue = jsonParse(stringValue)
    } catch (e) {}

    var value = jsonValue || stringValue
    if (useCache) {
      caches[key] = cloneJSON(value)
    }
    return value
  }

  /**
   * 删除键
   * @param {String} key
   */
  storageProp.remove = function (key) {
    if (this.useCache) {
      delete this.caches[key]
    }
    if (!this.saveOnUnload) {
      this.storage.removeItem(this.getKey(key))
    }
  }

  /**
   * 清空数据
   * @param {Boolean} [whole=false] - 如果为 true,则会清空 storage 内的所有值,否则只清空此命名空间内的值
   */
  storageProp.clear = function (whole) {
    if (whole) {
      // 清空此 type 下的所有实例的 cache
      var allTypes = allStorages[this.type]
      forIn(allTypes, function (key) {
        var that = allTypes[key]
        if (that.useCache) {
          that.caches = {}
        }
      })
      this.storage.clear()
      return
    }

    if (this.useCache) {
      this.caches = {}
    }

    var namespace = this.namespace
    var storage = this.storage
    forIn(storage, function (key) {
      if (key.indexOf(namespace) === 0) {
        storage.removeItem(key)
      }
    })
  }

  return MyStorage
}))
